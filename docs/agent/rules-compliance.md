# Rules Compliance Tracker

Use this file as the current checklist for development progress against the
aid-sheet rules.

## Current Implemented Baseline

- Character sheet supports:
  - name
  - concept
  - discipline
  - exhaustion display
  - permanent madness
  - responses as three configurable Fight / Flight slots with checkboxes
  - talents as text
  - scars as text
- Player roll flow currently supports:
  - loading the current actor pool into a chat-based Dice Tray from the character
    sheet
  - tray-based pool building for Discipline, Exhaustion, Madness, and Pain before
    the roll
  - optional `+1 Exhaustion` before the roll when current Exhaustion is below `6`
  - temporary Madness selection for the roll
  - a single tray-based roll for Discipline, Exhaustion, Madness, and Pain
  - optional post-roll `+1 Exhaustion` if the pre-roll option was not used
  - optional post-roll `-1 Hope` to add a `1` to the Discipline pool
- GM flow currently supports:
  - GM-only Pain editing inside the Dice Tray before the roll
  - one `+6` or `-6` intervention after the roll
  - the tray becomes roll-ready once the GM adds at least one Pain die
  - final result publication in chat
- Dice engine currently supports:
  - rolling pools
  - counting successes on `1..3`
  - dominant-pool calculation with priority `Discipline > Madness > Exhaustion >
Pain`
  - recalculation after GM intervention
- Resolution currently supports:
  - final success or failure comparison
  - dominant-pool effect text
  - button-driven player resolution for `Discipline` dominant:
    - un-check a checked Fight / Flight Response
    - remove `1 Exhaustion`
  - button-driven player resolution for `Madness` dominant:
    - check an unchecked Fight / Flight Response
  - automatic `+1 Exhaustion` when Exhaustion dominates
  - automatic `+1 Despair` when Pain dominates, except when GM shadow-casting
    made Pain dominant
  - `Snap` handling when a required Response check has no unchecked Responses:
    - all Responses are un-checked
    - `-1 Discipline`
    - `+1 Madness`
    - if Discipline drops to `0`, the character becomes a Nightmare and the
      effect text says so
  - button-driven GM failure resolution from the final roll card
  - automatic failure resolution updates for `+1 Exhaustion`, checking Fight /
    Flight responses, and `Snap` when the response branch has no unchecked
    Responses left
  - crash resolution from the final roll card when Exhaustion exceeds `6`:
    - GM chooses either `Sleep for 1 day` or `Die`
    - `Sleep for 1 day` applies:
      - `Discipline = 1`
      - `Exhaustion = 0`
      - all Responses are un-checked
      - talents are marked as temporarily unavailable in the effect text
    - `Die` currently publishes only a death effect text
- Shared resource flow currently supports:
  - a shared world-level Hope pool
  - a separate pending Hope pool for tokens that unlock on the next scene
  - a shared world-level Despair pool
  - an always-visible Hope / Despair tracker window
  - a separate chat-based Dice Tray card for player and GM dice pools
  - manual `+ / -` adjustment for both shared pools
  - GM `+6` / `-6` intervention spending `-1 Despair`
  - shadow-casting adds converted `Hope` as pending Hope when the conflict is
    finalized
  - a manual `End Scene` button moves pending Hope into active Hope

## Open Rules Compliance Gaps

- GM shadow-casting is only partially modeled:
  - Hope gained from converting `-1 Despair` to `+1 Hope` is stored as pending
    Hope on conflict finalization
  - the final effect text warns that this Hope is only usable starting next scene
  - because the system cannot detect scenes automatically, scene progression is a
    manual GM action through the tracker
  - the current flow allows only one `+6` or `-6` intervention per conflict
- Intentional house-rule divergence:
  - the Dice Tray does not allow taking `+1 Exhaustion` before the roll when
    current Exhaustion is already `6`
  - other effects may still push Exhaustion above `6`, allowing Crash to happen
    during resolution
- Shared Hope lifecycle is incomplete:
  - Get A Break is not implemented
  - Restore Discipline is not implemented
  - Hope coins do not automatically vanish at session end
- Exhaustion dominant is only partially rules-compliant:
  - `+1 Exhaustion` is applied
  - Crash now triggers only after Exhaustion goes above `6`
- Failure aftermath is only partially implemented:
  - GM can resolve `+1 Exhaustion`, check a Fight / Flight Response, or trigger
    `Snap` when no unchecked Responses remain
  - Crash can now follow those choices once Exhaustion exceeds `6`
- Crash and Sleep flow is only partially implemented:
  - current implementation uses a GM choice in the final roll card instead of
    automatic by-scene-end handling
  - sleeping characters attracting Nightmares is not implemented
  - talent lock during recovery is only described in effect text because talent
    mechanics are not automated yet
  - Discipline restoration after staying awake again is not implemented
- Helping other characters is not implemented.
- Talent mechanics are not implemented beyond text storage:
  - Exhaustion talent requirements and rewards are not modeled
  - Madness talent scaling from added Madness dice is not modeled
- Scar mechanics are not implemented beyond text storage:
  - Recall A Scar rerolls are not modeled
  - Transform A Scar effects are not modeled

## Tracker Usage Rule

- When implementing DRYH mechanics, update this tracker if behavior changes in a
  way that affects rules compliance.
- Treat items in `Open Rules Compliance Gaps` as the default backlog for
  mechanics parity unless the user explicitly chooses a house-rule divergence.
- When implementing new runtime or gameplay logic, add or update automated tests
  for that behavior in the same task.
- Do not consider new application logic complete until its expected behavior is
  covered by tests, unless the change is documentation-only, style-only, or the
  user explicitly agrees to defer tests.
