# Development Practices

Use this file for general coding behavior, scope control, simplicity rules, and
completion checks.

## Agent Goal

Help build and maintain the system with:

- small changes
- safe changes
- reviewable diffs
- architecture consistency

## Scope Control

- Do not do more than the user asked.
- Keep the implementation scoped to the requested behavior and directly related
  cleanup.
- Avoid opportunistic refactors unless they are needed to complete the requested
  change safely.

## Coding Preferences

- Use clear names and straightforward logic.
- Add comments only where behavior is not obvious.
- Preserve backward compatibility where practical.
- Prefer configuration over hardcoded values.
- Prefer understandable code over flexible code. KISS is more important than DRY
  when removing duplication would make the code harder to read.
- Avoid jQuery.
- Use TypeScript and prefer explicit useful types.
- Follow the Single Responsibility Principle.
- Each file, class, and function should have one clear reason to change.
- Keep domain modules focused on domain logic.
- Move generic parsing, normalization, formatting, and reusable helpers into
  `utils/` or another dedicated helper module.
- If a file starts mixing actor logic, UI logic, chat logic, and generic helpers,
  split it before adding more code.

## Readability And Maintainability

- Write short, focused functions with a single responsibility.
- Use clear, descriptive names for variables, functions, and classes.
- Avoid deep nesting; prefer early returns and guard clauses for real control
  flow.
- Keep functions and methods to a reasonable length, typically under 30 lines.

## Error Handling

- Always handle errors explicitly rather than silently ignoring them.
- Use wrapped errors for traceability and context when rethrowing caught errors.
- Provide meaningful error messages that help with debugging.
- Fail fast and fail loudly during development.

## Code Organization

- Organize code into logical modules and packages.
- Separate concerns: keep business logic separate from infrastructure code.
- Use consistent file and folder naming conventions.
- Follow the principle of least surprise in API design.

## User Edits Are Intentional

- If the user has manually changed code, templates, or styles, do not overwrite
  or revert those edits just to match an earlier pattern.
- Assume a manual user change is needed unless the user explicitly asks to remove
  it.
- When continuing work in a file the user has edited, build on top of that
  version and adapt your implementation to it.
- If a manual user change directly conflicts with the requested feature, stop and
  clarify before replacing it.

## Simplicity Rules

- Do not add speculative defensive checks just to be safe.
- Avoid guards like `if (!(root instanceof HTMLElement)) return;` unless there is
  an observed runtime failure or a documented API reason that requires it.
- Prefer the simplest direct code path first. If it later fails in real usage,
  then fix that specific failure.
- Do not add preventative fixes for hypothetical crashes that have not been
  observed yet.
- Avoid unnecessary mappings, translation layers, adapter objects, or intermediate
  transformations.
- If a mapping layer is truly needed, stop and ask before introducing it.
- When in doubt, choose fewer abstractions and less branching.

## Architecture Guidance

- Treat the composition root as the place where the package wires itself into
  Foundry. Keep registration logic centralized there.
- Put gameplay rules and schema changes in the data and document layers, not
  directly in UI code.
- Put dialogs, sheets, HUD pieces, and sidebar behavior in the application layer
  and back them with templates.
- Put custom roll logic, chat enrichers, and roll helpers in dedicated dice,
  chat, and helper modules.
- Keep socket handlers, migrations, settings registration, and template preload
  logic in `src/module/system-registration`.
- Keep build configuration separate from runtime logic. Rollup, Gulp, TypeScript,
  Sass, and setup scripts should not absorb gameplay rules.
- Preserve the current separation of runtime, content, and tooling.

## Historical Setup Checklist

The initial scaffold checklist from early project setup is complete. Do not treat
these as open backlog items:

- Create the initial `system.json`.
- Add the main entry script.
- Add stylesheet.
- Add localization file.
- Add a runtime folder that separates UI, data, documents, and registration
  concerns.
- Add README with install and development notes.

## Safety Checks

Before finishing a task:

1. Confirm changed files are intentional.
2. Check for obvious path, manifest, template, or generated-output mistakes.
3. Run the relevant automated tests for changed logic, or state why tests were
   not run.
4. Summarize what changed and what still needs to be done.
