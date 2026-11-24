// Símbolo da marca </> em 3D ao redor da ilustração da apresentação:
// "<" e ">" em verde-lima de cada lado, "/" em grafite atrás.
// As peças entram com profundidade, flutuam de leve e inclinam com o mouse.
// Pausa fora da tela; com "reduzir movimento" renderiza um quadro parado.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const LIME = '#b9ff36';
const GRAPHITE = '#2c2e30';

// Uma barra arredondada (o "traço" do símbolo)
function bar(length, thickness, material) {
  const geo = new RoundedBoxGeometry(length, thickness, thickness, 6, thickness * 0.5);
  return new THREE.Mesh(geo, material);
}

// "<" com a ponta na origem; espelhado vira ">"
function chevron(material, { arm = 1.25, thickness = 0.34 } = {}) {
  const group = new THREE.Group();
  const reach = arm + thickness * 0.5; // sobreposição na ponta para a junção ficar limpa
  const angle = Math.PI / 4;
  [1, -1].forEach(dir => {
    const m = bar(reach, thickness, material);
    m.position.set(Math.cos(angle) * reach / 2, dir * Math.sin(angle) * reach / 2, 0);
    m.rotation.z = dir * angle;
    group.add(m);
  });
  // centraliza o chevron no próprio eixo
  group.children.forEach(m => { m.position.x -= Math.cos(angle) * reach / 2; });
  return group;
}

export function createCodeMark(canvas, { still = false, anchor = null } = {}) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  } catch {
    return; // sem WebGL: a ilustração aparece sozinha
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.9;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.45;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.z = 11;

  const key = new THREE.DirectionalLight('#ffffff', 1.1);
  key.position.set(3, 4, 6);
  scene.add(key, new THREE.AmbientLight('#ffffff', 0.25));

  const lime = new THREE.MeshPhysicalMaterial({
    color: LIME, roughness: 0.4, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.25
  });
  const graphite = new THREE.MeshPhysicalMaterial({
    color: GRAPHITE, roughness: 0.45, metalness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.3
  });

  const mark = new THREE.Group();
  const left = chevron(lime);
  const right = chevron(lime);
  right.rotation.y = Math.PI;
  const slash = bar(4.2, 0.34, graphite);
  slash.rotation.z = Math.PI / 2.6;
  mark.add(left, right, slash);
  scene.add(mark);

  const pieces = [
    { obj: left, rest: new THREE.Vector3(), phase: 0 },
    { obj: right, rest: new THREE.Vector3(), phase: 1.7 },
    { obj: slash, rest: new THREE.Vector3(0, 0.1, -1.6), phase: 3.1 }
  ];

  // Centraliza o símbolo no centro da ilustração (anchor) e distribui as peças
  const layout = aspect => {
    const visibleH = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visibleW = visibleH * aspect;
    const scale = Math.min(1, visibleW / 6.4);
    mark.scale.setScalar(scale);
    const spread = Math.min(visibleW * (aspect < 1.05 ? 0.41 : 0.38), 2.6) / scale;
    pieces[0].rest.set(-spread, 0, 0.4);
    pieces[1].rest.set(spread, 0, 0.4);
    pieces[2].rest.set(0, 0, -1.6);
    mark.position.set(0, 0, 0);
    if (anchor && anchor.offsetParent === canvas.offsetParent && canvas.offsetWidth) {
      // offset* ignora transforms, então a animação de entrada da imagem não desloca o cálculo
      const dx = (anchor.offsetLeft + anchor.offsetWidth / 2 - (canvas.offsetLeft + canvas.offsetWidth / 2)) / canvas.offsetWidth;
      const dy = (anchor.offsetTop + anchor.offsetHeight / 2 - (canvas.offsetTop + canvas.offsetHeight / 2)) / canvas.offsetHeight;
      mark.position.set(dx * visibleW, -dy * visibleH, 0);
    }
  };

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = canvas;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    layout(camera.aspect);
    if (still) place(1, 0);
    renderer.render(scene, camera);
  };

  const easeOut = t => 1 - Math.pow(1 - t, 4);
  function place(intro, time) {
    pieces.forEach((p, i) => {
      const k = easeOut(Math.min(1, Math.max(0, intro * 1.4 - i * 0.18)));
      const float = still ? 0 : Math.sin(time * 0.9 + p.phase) * 0.08;
      p.obj.position.set(p.rest.x, p.rest.y + float, p.rest.z - (1 - k) * 6);
      p.obj.scale.setScalar(0.6 + 0.4 * k);
    });
  }

  new ResizeObserver(resize).observe(canvas);
  resize();
  canvas.classList.add('ready');
  if (still) return;

  const pointer = { x: 0, y: 0 };
  addEventListener('pointermove', e => {
    pointer.x = e.clientX / innerWidth - 0.5;
    pointer.y = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(canvas);

  const clock = new THREE.Clock();
  const tick = () => {
    if (visible && !document.hidden) {
      const t = clock.getElapsedTime();
      place(Math.min(1, t / 1.6), t);
      mark.rotation.y += (pointer.x * 0.5 - mark.rotation.y) * 0.05;
      mark.rotation.x += (pointer.y * 0.3 - mark.rotation.x) * 0.05;
      left.rotation.x = Math.sin(t * 0.6) * 0.12;
      right.rotation.x = Math.sin(t * 0.6 + 1.2) * 0.12;
      renderer.render(scene, camera);
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
