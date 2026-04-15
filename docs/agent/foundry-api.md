# Foundry API And Runtime Policy

Use this file when touching Foundry integration, UI applications, document
models, hooks, settings, manifests, or runtime registration.

## Official Sources

Always prefer the official Foundry VTT API documentation:

- https://foundryvtt.com/api/v13/
- https://foundryvtt.com/api/v13/classes/foundry.applications.api.ApplicationV2.html

Priority order when implementing new functionality:

1. Official Foundry API documentation.
2. ApplicationV2 patterns.
3. Current project architecture and nearby code.
4. Custom implementation.

## Core API Policy

- Use only documented public API.
- Never invent Foundry APIs.
- Avoid undocumented hooks, monkey patches, and core behavior patches.
- Do not call private or internal core methods.
- Documented protected ApplicationV2 lifecycle methods are allowed when they are
  the intended extension point.
- If no public API exists, say it explicitly, propose a safe alternative, and only
  then suggest a workaround.

## ApplicationV2-First Rule

When implementing UI:

1. Prefer ApplicationV2.
2. Then DialogV2.
3. Then DocumentSheetV2.
4. Then existing ApplicationV2 subclasses.

Use these official ApplicationV2 descendants as reference patterns when useful:

- ApplicationV2
- DialogV2
- DocumentSheetV2
- CategoryBrowser
- CameraPopout
- CameraViews
- CombatTrackerConfig
- CompendiumArtConfig
- DocumentSheetConfig
- FilePicker
- ImagePopout
- PermissionConfig
- RollResolver
- HeadsUpDisplayContainer
- BasePlaceableHUD
- DependencyResolution
- AVConfig
- PrototypeTokenConfig
- ChatPopout
- FrameViewer
- ModuleManagement
- Sidebar
- AbstractSidebarTab
- GamePause
- Hotbar
- MainMenu
- Players
- RegionLegend
- SceneControls
- SceneNavigation

## UI Implementation Rules

- Use the ApplicationV2 lifecycle.
- Use `DEFAULT_OPTIONS` for application configuration.
- Respect `render()` and `close()`.
- Prefer documented lifecycle methods such as `_prepareContext`, `_onRender`,
  `_preClose`, and related protected hooks when they are the right extension
  point.
- Keep UI logic separate from game logic.
- Prefer small focused apps.
- Avoid DOM hacks.
- Do not depend on unstable Foundry markup.
- Use templates for rendering.

## DOM And Events

- Scope selectors to the application root.
- Avoid global listeners.
- Clean up listeners properly.
- Avoid direct DOM manipulation outside the app root.
- Avoid jQuery.

## Data And Documents

- Use the Foundry Document API.
- Do not mutate raw data.
- Use create, update, and delete methods.
- Put gameplay rules and schema changes in data, document, dice, chat, resource,
  or helper modules instead of directly in UI classes.
- Keep actor-facing normalized data in `src/module/data`.
- Keep document classes in `src/module/documents`.
- If adding system data schema behavior, prefer Foundry's documented system data
  model patterns and keep `system.json` `documentTypes` aligned.

## Hooks And Integration

- Prefer hooks over overrides.
- Avoid patching core behavior.
- Keep integrations local and predictable.
- Keep socket handlers, migrations, settings registration, and template preload
  logic in the system-registration area.

## Foundry System Conventions

- Keep the system manifest in `system.json`.
- Keep runtime JavaScript output in `scripts/`.
- Keep CSS output in `styles/`.
- Keep Handlebars templates in `templates/`.
- Keep localization files in `lang/`.
- Avoid hardcoding world-specific paths or secrets.
- Use `system.json` for this project. Do not introduce `module.json` unless the
  user explicitly changes the project type.
- Preserve the manifest's `esmodules` and `styles` paths unless a matching build
  change requires updating them.

## Expected Structure

Preserve the current separation of concerns:

```text
system.json
package.json
scripts/
src/main.ts
src/module/
src/styles/
styles/
templates/
lang/
assets/
packs/
tools/
tests/
```

## Reference-Based Development Rule

Before implementing new Foundry-facing functionality:

1. Check official Foundry API docs.
2. Check ApplicationV2 patterns.
3. Check `docs/architecture.md`.
4. Check nearby code in the subsystem.
5. Implement the smallest maintainable change.
