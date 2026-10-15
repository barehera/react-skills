# October 15 2026 v4 UI-only composition decisions

## Source and evidence

- Benchmark it6 (`benchmarks/build-composable-components/ITERATIONS.md`):
  v3.3.0 (lean-v7) scored 91.9 against 100 for v3.2.0 (lean-v6). T1 skipped
  the generic `components/ui` family because an existing primitive "already
  covers the role". Both versions produced closed record components whose root
  carried trigger props, copy, and data (`<MemberCombobox aria-labelledby
  className projectId value onValueChange unselectedLabel />`).
- Direct owner review of the generated code on 2026-10-15. The owner rejected
  props on record roots and render-function item children, preferred the
  `cva` + `data-*` Tabs shape (variant on `TabsList`, triggers read
  `group-data-[…]/tabs-list:`), and approved this consumer shape as the target:
  "everything is given from outside; the component knows only UI, not the
  data; single responsibility".
- Source research (shadcn/ui `main`, Base UI `master`, Radix `main`): roots
  hold state, behaviour, and data only; placeholder, empty text, aria, and
  `className` live on the parts that render them; shadcn's Tabs puts `variant`
  as a `cva` on `TabsList`; shadcn ships no record-specific wrappers in `ui/`.
- Four type-checked rewrites (Combobox, ActionMenu, SelectableList, Tabs and
  the Roster example) against a draft of these rules in the benchmark fixture.

## Decisions

| Finding | Decision | Destination | Reason |
| --- | --- | --- | --- |
| Generic families know only UI; data, copy, and config come from outside | accepted | `docs/technology-stack.md`; `build-composable-components` core | Owner's single-responsibility principle |
| Consumer reads the query and maps data inside the list part; status parts inside the list | accepted | `build-composable-components`, `manage-server-state` | Owner rejected root-owned collections and render-function items |
| Record parts only where a record or product rule is read; no pass-through wrappers | accepted | `build-composable-components` composition reference | Shortest code; matches shadcn's lack of record wrappers |
| Record parts default their copy | rejected | n/a | Copy comes from outside, even in record parts |
| Visual config as `cva` + `data-*` + group selectors, no context or store for visual-only values | accepted | stack contract; `build-composable-components`; `use-preferred-react-stack` | Owner's Tabs preference; shadcn Tabs source |
| Root may take ids for an aggregate (`itemValues`) | accepted | `build-composable-components` | Select-all and counts without row registration effects |
| Density on the list container rather than a frame around header and list | accepted | `build-composable-components` | Owner-approved shape |
| Existing primitive is no reason to skip the generic family when reuse is asked | accepted | `build-composable-components` ladder | it6 T1 regression |
| Derived values as parts without function children (`<Count /> selected`) | accepted | `build-composable-components` | Owner rejected function children |
| Visual-only scoped store in the Roster example | rejected | example removed it | Visual state is CSS, not a store |
| Form adapters (`options`, `slotProps`) | already-covered | `build-forms` | Already UI-only with data from outside |

## Release

These rules replace the root-owned collection, render-callback, and
root-owned visual-config guidance of v3, so the catalog ships them as a major
release (v4.0.0).

## Known gaps and follow-ups

- Benchmark rubric v2 rewards root-owned visual config (`root-owned-config`,
  `density-propagation`) and a root-owned collection in T2. It needs a v3
  rubric before v4 is benchmarked.
- A server-searched picker needs the selected record's label while searching;
  a by-id query is the clean fix where the backend offers one.
