# yakov-dryh

Minimal Foundry VTT system scaffold for `Data/systems/yakov-dryh`, built around Foundry V13 APIs and an ApplicationV2-first architecture.

## Current Scope

- `system.json` manifest with a runtime bundle, stylesheet, localization, and a seeded `character` Actor subtype
- `src/main.ts` composition root
- `src/module/applications` for ApplicationV2 and sheet classes
- `src/module/data` for system-facing document type constants and future data model scaffolding
- `src/module/documents` for custom document classes
- `src/module/system-registration` for Foundry init-time registration work
- `templates/`, `styles/`, and `lang/` for static package resources

## Development

Install dependencies:

```bash
npm install
```

Build the runtime bundle and stylesheet:

```bash
npm run build
```

Run linting:

```bash
npx eslint src --ext .ts
```

Run tests:

```bash
npx vitest run
```

## Foundry Notes

- The current document scaffold registers a custom `Actor` class and a default Actor sheet for the `character` subtype.
- The `documentTypes.Actor.character` manifest entry makes that subtype valid to the Foundry server.
- The `data` layer is intentionally light right now. A natural next step is adding `TypeDataModel` classes and pairing them with `CONFIG.Actor.dataModels`.

## Reference Material

- Official API: https://foundryvtt.com/api/
- `ApplicationV2`: https://foundryvtt.com/api/classes/foundry.applications.api.ApplicationV2.html
- System development guide: https://foundryvtt.com/article/system-development/
- Local architecture reference: `example/app-example-main`
