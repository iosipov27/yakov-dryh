# DRYH Rules Notes

Use the project-authored notes below when checking DRYH mechanics.
Do not add original third-party rules documents or reference applications to this
repository.

## Conflict Rolls

- In a conflict, the player rolls a triple pool:
  - `D6 Discipline`
  - `D6 Exhaustion`
  - `D6 Madness`
- The player rolls against the GM's `D6 Pain` pool.
- Always roll all dice currently on the character sheet.

## Player Options Around A Conflict Roll

- Before the roll, the player may add `+1` to `+6` Madness dice.
- Before or after the roll, the player may add `+1 Exhaustion` die by taking
  `+1 Exhaustion`.
- After the roll, the player may spend `-1 Hope` to add a `1` to the Discipline
  pool.

## GM Option Around A Conflict Roll

- After the roll, the GM may add or remove a `6` in any pool by converting
  `-1 Despair` to `+1 Hope`.
- The Hope gained this way is unavailable until the next scene.
- If this change makes Pain dominate, that does not add a coin to the Despair
  coffer.

## Success

- Each `1`, `2`, or `3` gives `+1 Success` to its pool.
- An action succeeds if the player's total successes from Discipline, Exhaustion,
  and Madness meet or exceed the GM's Pain successes.

## Dominant Pool

- Each pool's Strength is its highest die.
- Ties are broken by the next-highest die, continuing as needed.
- If still tied, use this priority:
  - `Discipline > Madness > Exhaustion > Pain`
- The strongest pool dominates the situation and determines its consequence.

## Dominant Outcomes

- If Discipline dominates:
  - the situation stays under control
  - the player may un-check either a Response or `-1 Exhaustion`
- If Exhaustion dominates:
  - the situation taxes the character's resources and need for rest
  - add `+1 Exhaustion`
  - if Exhaustion is now above `6`, the character Crashes
- If Madness dominates:
  - the situation becomes chaotic
  - the player chooses a Response to check and roleplay
  - if there are no unchecked Responses, the character Snaps
- If Pain dominates:
  - the character pays a greater price than expected
  - add `+1 Despair` coin to the coffer

## Talents

- Exhaustion talents:
  - To do the difficult:
    - the character must already have Exhaustion
    - the roll must get at least that much Exhaustion in successes
  - To do the impossible:
    - the player must add `+1 Exhaustion`
    - the implementation note is to add one success per Exhaustion die
- Madness talents:
  - the player must add Madness dice
  - more Madness dice allow more powerful effects

## Hope And Despair

- Hope is a shared table pool for all players, not a personal character resource.
- Despair is a shared GM pool.
- Hope and Despair are table resources that sit in the center of play, not on
  individual character sheets.
- Hope is not tied to a specific character, roll, or owner.
- Despair gained from one character's conflict can later become Hope that any
  player may spend.
- The loop is:
  - when Pain dominates, the GM gains Despair
  - when the GM spends Despair, it is converted into Hope
  - once available, any player may spend that Hope, even if they were not part of
    the original roll
- Hope coins vanish at the end of the session.
- Outside conflict, a player may Get A Break:
  - spend `-1 Hope`
  - un-check either a Response or `-1 Exhaustion`
- After a roll but before results are narrated, a player may Improve Success:
  - spend `-1 Hope`
  - add a `1` to the Discipline pool
- After the character relaxes for a few hours, a player may Restore Discipline:
  - spend `-[5 - Discipline] Hope`
  - convert `-1 Madness` to `+1 Discipline`

## Failure

- When Pain successes beat player successes, the GM may choose one:
  - add `+1 Exhaustion`
  - check a Response and roleplay it
- The GM may not choose `+1 Exhaustion` if Exhaustion dominates.
- The GM may not choose a Response if Madness dominates.
- These failure consequences may cause a Snap or Crash.

## Snap

- A character Snaps when they must check a Response but have none remaining.
- When a character Snaps:
  - they freak out for the rest of this scene or all of the next scene, at
    minimum
  - un-check all Responses
  - convert `-1 Discipline` to `+1 Madness`
  - if Discipline drops to `0`, the character becomes an NPC Nightmare

## Crash And Sleep

- A character Crashes when Exhaustion exceeds `6`.
- By the end of the scene, they fall asleep for at least a day or die.
- Sleeping characters attract Nightmares.
- When a character wakes from sleep:
  - `Discipline = 1`
  - `Exhaustion = 0`
  - all Responses are un-checked
  - the character may not use talents
- After staying awake for as long as they slept:
  - `Discipline = 3`
  - the character may use talents again

## Helping Other Characters

- To help another character:
  - narrate the helping action
  - roll the helper's Discipline dice
  - use the successes from those dice
  - do not use those Discipline dice when determining which pool dominates

## Scars

- At the end of each session, the character records one key experience as a new
  Scar.
- A player may Recall A Scar:
  - check the Scar off for the session
  - re-roll Discipline, Madness, or Exhaustion
- A player may Transform A Scar:
  - cross the Scar off permanently
  - choose one:
    - add `+5 Hope`
    - transform a Madness talent into a different one for the duration of the
      scene
    - transform a Madness talent into a different one permanently
