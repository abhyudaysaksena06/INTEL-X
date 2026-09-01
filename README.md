# FULL STACK INTEL X

The four separate INTEL X repositories assembled into one website, with a single
shared navigation bar and one merged design system.

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
npm run build   # production build into dist/
```

## Routes

| Route       | Page       | Source                                            |
| ----------- | ---------- | ------------------------------------------------- |
| `/`         | Home       | `HOME/INTEL-X-PROJECT` — hero, world map, HUD      |
| `/events`   | Events     | written for this site (see note below)            |
| `/sponsors` | Sponsors   | `SPONSORS/intel-x-sponsor-page` — scroll reveal    |
| `/contact`  | Contact us | `CONTACT US/Bhavya-intelx` — evidence board + form |

Unknown routes redirect to `/`.

## How it was put together

- **Stack**: Vite 7 + React 19 + Tailwind CSS v4, with `react-router-dom` for
  routing. `@` is aliased to `src/`, so the original `@/assets/...` imports in the
  copied pages still resolve.
- **Navigation** (`src/components/Navbar.tsx`) is the header from the CONTACT US
  page — same markup, tokens and mobile menu — with the plain anchors swapped for
  router links and the active state driven by the current route. It is sticky, so
  it stays put across all four pages. The footer reuses the same styling.
- **Design system** (`src/styles.css`) merges the two Tailwind v4 themes: the HOME
  stylesheet is the base (cyan/black tokens, `hud`, `eyebrow`, `glow-cyan`,
  `grid-lines`, its keyframes) and the CONTACT US additions are layered on
  (`--board`, `--ink`, `--gold`, `--thread`, `--parchment`, the Oswald/Special
  Elite/Caveat fonts, `paper-aged`, `board-vignette`, `paper-field`, the blood-flow
  and modal animations).
- **Page changes**: the contact page lost its TanStack Router wiring and its own
  inline header (now the shared navbar); the sponsors page was dropped in
  unmodified; the home page is the hero composition minus its old navbar.

## Note on the events page

The events repository (`vaanya-sharma05/Vaanya-LEAD`) contains only a Figma Make
scaffold — `index.html` points at `/src/main.tsx`, but no `src/` directory exists.
There was nothing to port, so `src/pages/Events.tsx` is a new event docket written
against the shared tokens so it matches the rest of the site. Replace it when the
real page lands.
