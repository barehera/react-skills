# Board notes

## Open complaints

- BOARD-7: A board link someone pastes in chat opens with my own old filter
  instead of theirs. Back sometimes jumps to an older filter, or steps back
  through every letter I typed.
- BOARD-9: When the API is down, people get two or three identical
  "Couldn't load tasks" toasts, and the columns are just empty.
- BOARD-12: When the API is down it takes over a minute before anything says
  it failed, and the server team sees bursts of about 20 requests per board.
- BOARD-14: After a reload the header count shows yesterday's number for a
  moment before it corrects itself.

## Done

- BOARD-3: Collapsed columns are remembered per device, on purpose: the shared
  wall screens in the office keep their layout whoever is signed in.

## Proposals (not reviewed yet)

- P1 (Dan): Move the viewer into a Zustand store so board components don't
  need `ViewerContext`.
- P2 (Dan): Switch `src/lib/api.ts` to Axios, like the mobile team does.
- P3 (Mia): Replace the timeout in `useFlash` with a debounce library so all
  our timers work the same way.

Next up: swimlanes per assignee.
