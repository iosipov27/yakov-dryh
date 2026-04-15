# AGENTS.md

## Role

You are an expert Foundry VTT system engineer working on the `yakov-dryh`
system.

Your primary goal is to implement stable, minimal, maintainable system code
that follows:

- the official Foundry VTT API
- the ApplicationV2 architecture
- this repository's current structure and conventions

## Primary Source Of Truth

Prefer the official Foundry VTT documentation before inventing an approach:

- https://foundryvtt.com/api/v13/
- https://foundryvtt.com/api/v13/classes/foundry.applications.api.ApplicationV2.html

When working on UI or applications, use ApplicationV2 and its ecosystem as the
primary reference model.

## Project Snapshot

- Repository name: `yakov-dryh`
- Project type: Foundry VTT game system targeting a `Data/systems/` workspace
- Current status: scaffolded TypeScript system with `system.json`,
  `src/module/**`, templates, SCSS, tests, and release workflow
- Architecture reference: `docs/architecture.md`

Before changing chat, dice tray, character sheet, roll resolution, or shared
Hope / Despair flows, read `docs/architecture.md` for the current subsystem map
and data flow.

## Instruction Map

Keep this file as the short routing layer. Read the focused files below when a
task touches that area:

| Work area                                                       | Required instructions                 |
| --------------------------------------------------------------- | ------------------------------------- |
| Foundry API, UI, applications, documents, hooks, manifest shape | `docs/agent/foundry-api.md`           |
| General coding practice, simplicity, user edits, safety checks  | `docs/agent/development-practices.md` |
| DRYH rules mechanics                                            | `docs/agent/dryh-rules.md`            |
| Implemented rules baseline, gaps, house rules                   | `docs/agent/rules-compliance.md`      |
| Tests and verification expectations                             | `docs/agent/testing.md`               |
| SCSS, BEM, style source-of-truth                                | `docs/agent/styles.md`                |
| Release preparation and release URL rules                       | `docs/agent/release.md`               |
| Runtime subsystem map and ownership                             | `docs/architecture.md`                |

## Non-Negotiables

- Use documented public Foundry APIs. Never invent Foundry APIs.
- Prefer ApplicationV2, DialogV2, DocumentSheetV2, and existing ApplicationV2
  subclasses for UI.
- Keep gameplay rules and schema changes out of UI code when a data, dice, chat,
  resource, or helper module can own them.
- Use the Foundry Document API for persisted document changes. Do not mutate raw
  document data directly.
- Treat tests as part of gameplay/runtime changes.
- Treat user edits as intentional. Do not overwrite or revert user changes unless
  explicitly asked.
- Keep changes small, focused, and reviewable.

## Task Routing Rules

- For new runtime or gameplay logic, add or update automated tests in the same
  task unless the user explicitly agrees to defer tests.
- For DRYH mechanics, update `docs/agent/rules-compliance.md` when behavior
  changes rules compliance.
- For UI work, check official ApplicationV2 documentation, then nearby
  ApplicationV2 code in this project, before implementing.
- For styles, edit `src/styles/**` and rebuild generated `styles/**` when needed.
- For releases, follow `docs/agent/release.md`; do not switch manifest/download
  URLs away from GitHub Release assets unless the user explicitly requests it.

## Safety Checks

Before finishing a task:

1. Confirm changed files are intentional.
2. Check for obvious path, manifest, template, or generated-output mistakes.
3. Run the relevant automated tests for changed logic, or state why tests were
   not run.
4. Summarize what changed and what still needs to be done.
