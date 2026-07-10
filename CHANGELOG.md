# Changelog

All notable changes to the LunarWolf website are recorded here.

## [0.2.0] — 2026-07-10

Full site audit — SEO, performance, accessibility, security, and tooling fixes.

### Fixed

- Logo asset was 1.3MB despite rendering at 54px tall, and the source logo's tagline read "SOETWARE & AI SOLUTIONS" (typo). Re-cropped to the wordmark + mark only (removing the misspelled tagline) and compressed to ~40KB.
- `lunarwolf-office.png` (1.9MB) was bundled but never referenced anywhere. Compressed to a ~95KB JPEG/WebP pair and put to use as a supporting visual in the About section.
- `font-family: Inter` was declared in CSS but no font file or `<link>` was ever loaded, so the whole site silently rendered in the browser's fallback font. Self-hosted Inter Variable via `@fontsource-variable/inter` instead of depending on a third-party font CDN.
- `<img>` tags had no `width`/`height`, risking layout shift (CLS) while images loaded.
- External case-study link used `rel="noreferrer"` only; added `noopener` and an accessible "(opens in a new tab)" label.

### Added

- Favicon, `apple-touch-icon`, and `site.webmanifest` (the site previously shipped with no favicon at all).
- Open Graph and Twitter Card meta tags, plus a generated 1200×630 social share image.
- `robots.txt`, `sitemap.xml`, canonical URL, and JSON-LD `ProfessionalService` structured data.
- Skip-to-content link, focus-visible outline styling, and body scroll-lock while the mobile nav is open.
- `Content-Security-Policy` and `Strict-Transport-Security` headers in `netlify.toml`, plus long-lived cache headers for fingerprinted/static assets.
- ESLint (typescript-eslint + react-hooks + react-refresh), Prettier, and a GitHub Actions CI workflow that runs typecheck/lint/format-check/build on every push and PR to `main`.
- `npm run lint`, `npm run format`, `npm run format:check` scripts.

### Changed

- About section now includes a framed photo alongside the studio description and principles.
- Documentation (this file, README, ROADMAP) brought back in sync with the actual state of the codebase.

## [0.1.1] — 2026-07-10

### Added

- Crest-inspired LunarWolf visual direction using deep navy, icy blue, silver, and soft glow
- Responsive mobile navigation menu
- Four-step delivery process section
- Stronger trust signals and featured-project metadata
- Clear future client-portal placeholder

### Changed

- Refined hero messaging and call-to-action hierarchy
- Reworked the hero visual into a crescent-led brand stage
- Strengthened case-study, service-card, about, and contact presentation
- Improved mobile layouts and interaction states

## [0.1.0] — 2026-07-10

### Added

- React, TypeScript, Vite, and Tailwind CSS foundation
- Framer Motion and Lucide React
- Responsive dark LunarWolf design system
- Homepage hero and visual identity concept
- Featured Exclusive Pets Grooming Parlour project
- Services and operating-principles sections
- Contact call to action
- Netlify deployment configuration
- Initial roadmap and repository documentation
