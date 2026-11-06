# AKILI design system (placeholder branding)

Single source of truth: [`src/styles/tokens.css`](src/styles/tokens.css). Live preview in development: `/design-system`.

**To re-brand**, change only the colour values at the top of `tokens.css`. Nothing else needs to change.

## Two moods
| Mood | How | Look |
|---|---|---|
| Parent / admin (default) | nothing | Calm, 44 px controls, 16 px text |
| Kid | `data-mood="kid"` on the screen's wrapper | 60 px controls, rounder, 20 px text, accent colours |

Per-user accessibility options (set on `<html>` or a wrapper): `data-font="readable"` (dyslexia-friendly font stack), `data-text="large"` (+25 % text). `prefers-reduced-motion` is respected globally.

## Tokens
- **Colour**: `brand-50…900` (primary), `kid-sun|grass|berry|sky|grape` (child accents), `ink-100…900` (text/borders), `surface`, `canvas`, `ok|warn|danger|info`. Use as Tailwind utilities: `bg-brand-600`, `text-ink-700`.
- **Type**: `--font-sans`, `--font-readable`. Inputs are never below 16 px (stops zoom on iPhones).
- **Shape**: `--radius-card`, `--radius-control`, `--shadow-card`.

## Component classes
`ds-btn` + `ds-btn-primary | secondary | ghost | danger | next`, `ds-card`, `ds-input`, `ds-label`, `ds-help`, `ds-error`, `ds-badge` + `ds-badge-ok | warn | danger | info`, `ds-page` (16 px gutters, max width), `skip-link`.

## Rules
1. One primary button per screen. On a child's home screen the single `ds-btn-next` is the only big action.
2. Never rely on colour alone: pair status colours with text or an icon.
3. Every input has a visible `<label>`; errors use `role="alert"` and `aria-describedby`.
4. Test at 360 px width. Touch targets ≥ 44 px (≥ 60 px for kids).
5. Text contrast ≥ 4.5:1 (checked for the placeholder palette; re-check after choosing brand colours).
6. User-facing strings go through i18n: `t("namespace.key")`, with English in `src/i18n/locales/en.json`.

## Not yet done (later phases)
Existing pages still use their original hard-coded colours; they will be moved to these tokens page by page as each is touched in Phases 2–8. Fonts are system fonts for now (no external font request); a webfont can be added once the brand is chosen.
