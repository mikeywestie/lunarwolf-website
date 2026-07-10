# LunarWolf Website

The public front door of LunarWolf: a premium, responsive website for presenting our work, services, products, and future client platform.

## Status

**Version:** 0.2.0
**Stage:** Sprint 0 — Foundation, hardened for production

## Local development

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Quality checks

```bash
npm run typecheck   # TypeScript project build check
npm run lint        # ESLint
npm run format      # Prettier (writes)
npm run format:check
```

CI runs typecheck, lint, format check, and build on every push/PR to `main` (see `.github/workflows/ci.yml`).

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS (reset only — components are hand-authored)
- Framer Motion, Lucide React
- Self-hosted Inter Variable font (`@fontsource-variable/inter`)
- Netlify (hosting, headers, redirects)

## Domain

The canonical domain is set to the live Netlify URL (`https://lunarwolf-software.netlify.app`) in:

- `index.html` (canonical link, Open Graph/Twitter tags, JSON-LD)
- `public/robots.txt`
- `public/sitemap.xml`

If you move to a custom domain later, update all three, and add social profile URLs to `sameAs` in the JSON-LD block.

## Current objective

Make visitors understand what LunarWolf builds, why they can trust us, and how to start a project within ten seconds.
