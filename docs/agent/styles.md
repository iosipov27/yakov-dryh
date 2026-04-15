# Style And SCSS Policy

Use this file when changing templates, CSS classes, or SCSS.

## Source Of Truth

- Keep `src/styles/yakov-dryh.scss` as the style composition root that only wires
  partials together.
- Treat `src/styles/**` as the source of truth.
- Treat `styles/**` as runtime output that should stay in sync when source styles
  change.
- Do not hand-edit `styles/**`; rebuild it from SCSS.

## Partial Ownership

- Keep CSS variables and tokens in a dedicated partial such as
  `src/styles/partials/_variables.scss`.
- Keep global spacing utilities in a dedicated partial such as
  `src/styles/partials/_utilities.scss`.
- Split SCSS partials by responsibility, for example surfaces, sheet layout,
  controls, rolls, HUD, typography, and responsive rules.

## BEM And Selectors

- Use BEM for unique style blocks, elements, and modifiers.
- Prefer nested SCSS for modifiers and closely related child selectors so the
  base block and its variants stay together.
- When writing BEM in SCSS, prefer nested selectors like `&__element` and
  `&--modifier` instead of repeating the full class name.
- If a class is really a modifier, do not use ad-hoc state names like `is-*`; use
  a BEM modifier class in both templates and styles.

## Spacing

- Margins are positioning, so apply them with utility classes directly in
  templates, for example `mt1`, `mb02`, `ml15`, `mr5`.
- Do not add new positioning margins to block or component selectors; blocks
  should not own their external placement.
