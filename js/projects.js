// Galeria de projetos em React.
// Lê os <article class="project"> já presentes no HTML (fonte única dos dados)
// e renderiza a mesma lista com um filtro Todos / Sites / Design.
import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import htm from 'htm';

const html = htm.bind(React.createElement);

const FILTERS = [
  { id: 'all', label: 'Todos' },
  { id: 'web', label: 'Sites' },
  { id: 'design', label: 'Design' }
];

function readProjects(host) {
  return [...host.querySelectorAll('.project')].map(el => {
    const img = el.querySelector('img');
    const status = el.querySelector('.status');
    return {
      id: el.dataset.id,
      cat: el.dataset.cat,
      img: { src: img.getAttribute('src'), alt: img.alt, width: img.getAttribute('width'), height: img.getAttribute('height') },
      status: status.textContent.trim(),
      wip: status.classList.contains('wip'),
      label: el.querySelector('.label').textContent.trim(),
      title: el.querySelector('h3').textContent.trim(),
      desc: el.querySelector('.desc').textContent.trim(),
      stack: el.querySelector('.stack').textContent.trim()
    };
  });
}

const Arrow = () => html`
  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function Project({ p }) {
  return html`
    <article class="project">
      <figure class="shot">
        <img src=${p.img.src} alt=${p.img.alt} width=${p.img.width} height=${p.img.height} loading="lazy" decoding="async" />
      </figure>
      <div class="project-meta">
        <span class=${p.wip ? 'status wip' : 'status'}>${p.status}</span>
        <span class="label">${p.label}</span>
      </div>
      <h3>${p.title}</h3>
      <p class="desc">${p.desc}</p>
      <p class="stack">${p.stack}</p>
    </article>`;
}

function NextTile() {
  return html`
    <aside class="next" aria-labelledby="next-title">
      <h3 id="next-title">O próximo projeto pode ser o seu.</h3>
      <p>Me conta do seu negócio e eu te mostro o que faz sentido.</p>
      <a class="text-link" href="#contato">Vamos conversar <${Arrow} /></a>
    </aside>`;
}

function Gallery({ items, onFilter, onReady }) {
  const [filter, setFilter] = useState('all');
  const grid = useRef(null);
  const first = useRef(true);
  const visible = filter === 'all' ? items : items.filter(p => p.cat === filter);
  const count = id => (id === 'all' ? items.length : items.filter(p => p.cat === id).length);

  useEffect(() => { onReady?.(); }, []);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    onFilter?.(grid.current);
  }, [filter]);

  return html`
    <div class="filters" role="group" aria-label="Filtrar projetos">
      ${FILTERS.map(f => html`
        <button key=${f.id} type="button" class="filter" aria-pressed=${filter === f.id} onClick=${() => setFilter(f.id)}>
          ${f.label} <span class="count">${count(f.id)}</span>
        </button>`)}
    </div>
    <p class="sr-only" role="status">${visible.length} projetos exibidos</p>
    <div class="work" ref=${grid}>
      ${visible.map(p => html`<${Project} key=${p.id} p=${p} />`)}
      ${visible.length % 2 === 1 && html`<${NextTile} />`}
    </div>`;
}

export function mountGallery(host, { onFilter } = {}) {
  const items = readProjects(host);
  if (!items.length) return Promise.resolve();
  return new Promise(resolve => {
    createRoot(host).render(html`<${Gallery} items=${items} onFilter=${onFilter} onReady=${resolve} />`);
  });
}
