# Design

Minimal dark portfolio, Apple-like restraint. Content (project screenshots) carries the color; the interface stays quiet.

## Tokens

| Token | Value | Use |
|---|---|---|
| `--bg` | #101112 | Page background (brand Carbon Black) |
| `--surface` | #18191b | Raised panels (portrait) |
| `--line` | #2a2c2e | Hairline separators |
| `--ink` | #f5f5f0 | Primary text (brand off-white) |
| `--ink-2` | #b4b7b0 | Body copy |
| `--mute` | #8e918b | Meta, captions |
| `--lime` | #b9ff36 | Primary button, one headline word, focus ring, selection, step numbers. Never section backgrounds. |
| `--amber` | #ffc45c | "Em desenvolvimento" status dot only |

## Type

Geist 400/500/600 (Google Fonts), system fallback. Display: 600, tracking -0.03 to -0.04em, max 6rem. Body 17px/1.6.

## Layout

- Container 1180px + fluid gutter `clamp(16px,5vw,48px)`.
- Section padding `clamp(96px,13vw,168px)`, separated by 1px hairlines.
- Order: Apresentação (headline + who he is + kit, caricature framed by the 3D `</>` mark) → Google search demo → Projetos (React filter, 2-col grid, invitation tile when count is odd) → Serviços + Como eu trabalho → Contato.
- Breakpoints: 960px (services/about stack), 760px (single column, menu button), 480px (steps single column).

## Components

- Buttons: lime pill for the single primary action (WhatsApp); everything else is a lime text link with chevron.
- Project: image (radius 16) → status dot + label → title → description → stack line. No card chrome.
- Motion: hero entrance (GSAP), search demo (typing, then results un-blur), section reveals on scroll (ScrollTrigger, once), Lenis smooth scroll. Everything static under reduced motion.

## Libraries (no build, ES modules via import map in index.html)

- React 18.3.1 + htm (esm.sh): `js/projects.js` reads the static `<article class="project">` markup and adds the filter. Static list is the no-JS fallback; edit projects in the HTML only.
- Three.js 0.169.0: `js/scene.js`, brand mark `< / >` around the caricature, centered on the image via offset measurement; lime chevrons, graphite slash; pauses offscreen.
- Lenis 1.1.13 + GSAP 3.12.5 ScrollTrigger: `js/main.js`. Core (menu, header, search demo) has no external imports so it works if a CDN fails.
