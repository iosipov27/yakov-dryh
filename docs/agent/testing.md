# Testing Policy

Use this file when adding or changing runtime behavior.

## Tests Are Part Of The Feature

- New behavior should ship with tests.
- Changed behavior should update existing tests or add new ones.
- Do not consider new application logic complete until expected behavior is
  covered by tests, unless the change is documentation-only, style-only, or the
  user explicitly agrees to defer tests.
- Prefer small focused tests for gameplay rules, chat-card actions, shared
  resources, and actor-state transitions.
- If logic is hard to test because it is mixed with Foundry runtime code, split
  pure decision logic into small helpers before adding more behavior.

## Useful Test Areas

- Dice and dominant-pool logic: `tests/dryh-roll.test.ts`,
  `tests/dominant-resolution.test.ts`.
- Dice tray state and presentation: `tests/dice-tray-state.test.ts`,
  `tests/dice-tray-rules.test.ts`, `tests/dice-tray-card-presentation.test.ts`.
- Roll card actions and finalization: `tests/roll-card-actions.test.ts`,
  `tests/roll-card-template.test.ts`.
- Shared Hope / Despair: `tests/shared-pools.test.ts`,
  `tests/setting-change.test.ts`,
  `tests/hope-despair-tracker-presentation.test.ts`.
- Actor-state transitions: `tests/snap.test.ts`, `tests/crash.test.ts`,
  `tests/failure-resolution.test.ts`, `tests/failure-consequence.test.ts`.
- Templates: `tests/*template*.test.ts`.

## Verification

- Run the narrowest relevant tests first.
- Run broader tests when changing shared helpers, roll flow, manifest paths, or
  generated runtime output.
- If tests are not run, explicitly state why.
