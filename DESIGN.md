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
- Order: Hero (centered statement + live Google search demo) → Projetos (2-col grid, 4:3 shots, 6th tile = invitation) → Serviços + Como eu trabalho (spec rows + 4 ordered steps) → Sobre (single caricature) → Contato.
- Breakpoints: 960px (services/about stack), 760px (single column, menu button), 480px (steps single column).

## Components

- Buttons: lime pill for the single primary action (WhatsApp); everything else is a lime text link with chevron.
- Project: image (radius 16) → status dot + label → title → description → stack line. No card chrome.
- Motion: one authored moment, the search demo (typing, then results un-blur). Image hover scale 1.025 on hover devices. Everything static under reduced motion.
