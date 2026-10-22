# Build Composable Components

[← React Skills catalog](../../README.md)

Design, implement, refactor, or review React component families that know
only UI. Data, copy, and configuration come from outside, so a family stays
composable as styling, permissions, overlays, and server-state behavior become
more demanding.

The skill is repository-aware. It builds a generic family in
`components/ui/<role>.tsx` over existing shadcn, Radix, or custom primitives,
preserving their props, refs, accessibility, defaults, and variants, even when
a primitive already covers one call site and the task asks for reuse.

- **The root holds only shared state**: the controlled value, open state, the
  record passed once, and the ids an aggregate such as select-all needs. It
  never takes items, loading or error flags, copy, `aria-*`, or visual config.
- **Every visible piece is a part** the consumer can omit, reorder, or
  relabel. Copy is the part's `children`; no part defaults it. A derived value
  is its own part: `<span><SelectableListCount /> selected</span>`.
- **The consumer maps the data** inside the list part and renders loading,
  error, and empty parts from its own query state. No `items` prop, render
  callback, or `Collection` part.
- **Record parts** live in the feature and exist only where the record or a
  product rule is read, such as a row that renders one record or an action
  that binds a mutation and a permission. Everything else is the generic part
  used directly.
- **Visual config is a `cva`** on the container part that owns the look,
  mirrored as `data-*` with a named group that descendants select from, as in
  shadcn's `TabsList`. No context or store carries a visual-only value; scoped
  Zustand is reserved for shared behaviour state.

```tsx
<SelectableList value={selectedTaskIds} onValueChange={setSelectedTaskIds} itemValues={taskIds}>
  <SelectableListContent density="compact">
    {tasksQuery.isPending && <SelectableListLoading>Loading tasks…</SelectableListLoading>}
    {tasksQuery.data?.map((task) => (
      <TaskSelectableListItem key={task.id} task={task} />
    ))}
  </SelectableListContent>
</SelectableList>
```

## Install

From your project root:

```bash
npx --yes github:barehera/react-skills build-composable-components
```

The installer asks which agents you use and writes only their files: the skill
in `.agents/skills/build-composable-components/`, which Cursor, GitHub Copilot, Windsurf, Codex,
Gemini CLI, and OpenCode read directly, plus one pointer for Claude Code, Kiro,
or Cline. Skip the question with `--agent`, for example `--agent cursor`.

Or install it with shadcn:

```bash
npx shadcn@latest add barehera/react-skills/build-composable-components
```

Add `-claude`, `-kiro`, or `-cline` to the item name for the pointer those
agents need. See the
[install guide](../../README.md#install) for every option.

## Use

```text
Use $build-composable-components to make this task action menu reusable on the
list rows and the detail header. Build a generic ActionMenu, pass the task once
to a record root, keep the delete dialog alive after the menu closes, and give
the header a large size.
```

```text
Use $build-composable-components to design a reusable bulk-selection list.
The screen reads the tasks query and maps the rows; add select-all, a selected
count, permission-aware bulk actions, optimistic rollback, and a compact
density.
```

```text
Use $build-composable-components to audit this Tabs extension.
Do not edit files. Check base-contract compatibility, where size and variant
live, keyboard behavior, and maintainability.
```

## Guidance

- [Canonical skill instructions](SKILL.md)
- [Composition and public API](references/composition.md)
- [State, styling, and effects](references/state-styling-and-effects.md)
- [Review and testing](references/review-and-testing.md)
- [Complete layered example](examples/layered-family): a generic `Roster`
  family with a `cva` size on `RosterList` and status parts; a
  `ShiftCrewRoster` screen that reads the query and maps members inside the
  list; a `ShiftCrewRosterItem` record part; one documented product rule; and
  the optimistic TanStack Query mutation it calls

The shared `.agents/skills/VERSION` file records the React Skills release that
supplied the installed workflow.

## Update

```bash
npx --yes github:barehera/react-skills update
```

This updates all installed React Skills for the agents you chose.

Companion guidance: [library defaults](../use-preferred-react-stack/README.md) and [helper extraction](../extract-named-helpers/README.md). Existing form, server-state, and component ownership stays with its focused skill.
