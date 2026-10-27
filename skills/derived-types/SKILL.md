---
name: derived-types
description: Keep React and TypeScript types single-sourced across components, hooks, and helpers so a changed field reaches every consumer through the compiler. Use when a prop, hook parameter, helper signature, map, callback, or constant restates a type already owned by a response schema, form schema, store, primitive, or constant (a `createdAt` prop typed as `string`, a `getLabel` helper that takes any `string`, a copied status union, a `Record<string, ...>` map); when code needs `as`, `any`, `!`, or `String(x)` to pass data; when a primitive callback returns `string` that must become a union; when deciding whether reusable code owns its types, derives them, or becomes generic; or when auditing a codebase for type drift without overengineering.
---

# Derived Types

Give every type one owner and derive every other mention from it, in
components, hooks, and helpers alike, so a source change reaches each consumer
through the compiler instead of a cast.

## Version

Read `../VERSION` and include `Thinstack v<version>` in the final handoff.

## Layer placement

Thinstack code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, product
rules). Dependencies point downward only.

This skill owns no layer; it decides how types cross layers. The same split
applies to every kind of code:

| Code | Reusable: owns its contract | Feature adapter: derives from the owner |
| --- | --- | --- |
| Component | `Timestamp` with `value: Date \| string` | `ShipmentRow` with `shipment: Pick<Shipment, ...>` |
| Hook | `useDisclosure(defaultOpen?: boolean)` | `useShipmentStatusFilter(shipments)` over `Pick<Shipment, "status">` |
| Helper | `formatDate(value: Date \| string)` | `isShipmentStatusFilter(value): value is ShipmentStatusFilter` |

Reusable code never imports a feature, schema, query, or record type; a type
import follows the same downward direction as a value import.

## Required workflow

1. Read repository instructions, compiler strictness, and the code the task
   touches. Name the owner of each fact before editing (see Owners).
2. Classify every receiving component, hook, and helper with the placement
   test: code that changes when the product changes is feature code; code that
   changes when the design system or platform changes is reusable.
3. Derive in feature code; own the contract in reusable code.
4. Remove the redeclared shapes, widened parameters, casts, and needless
   annotations the derivation replaces. Preserve runtime behavior.
5. Run the type check. Fix every reported consumer at the feature edge by
   converting, formatting, or narrowing; never widen reusable code or cast.
6. Report each type as `derived`, `owned on purpose`, or `left manual` with a
   reason, and include `Thinstack v<version>`. End with one `Skipped:` line
   for what was left out on purpose and one `Not checked:` line for what could
   not be verified.

Audit mode: for existing drift, follow [drift-audit.md](references/drift-audit.md).

## Smallest complete change

Write only what the task needs, in the layer that owns it. Take the first
option that fully works:

1. No new type: leave query data, hook results, and helper returns inferred.
   Skip aliases, exports, and type parameters nobody asked for and no recorded
   requirement (roadmap, backlog, plan, design, sibling screen) names; name
   them in the handoff.
2. An indexed access or `Pick` from the owner (see Owners).
3. `as const` or `satisfies` on the value itself.
4. A type guard built from the owner when a primitive hands back a wider type.
5. In reusable code, an owned UI or platform contract, extracted only for a
   current or recorded second consumer or a design-system concept.

- Finish every place the change reaches: callers, tests, fixtures, and
  exports. Narrowing at the trust boundary, no casts, and anything the user
  asked for are never cut.
- Mark a deliberate limit with one comment:
  `// shortcut: <limit>, <when to upgrade>`.

## Owners

One fact has one owner. Never restate it in a second declaration.

| Fact | Owner | Route |
| --- | --- | --- |
| Remote record | `type Shipment = z.infer<typeof shipmentSchema>` beside the response schema | `$manage-server-state` |
| Union of record values | the schema enum (`shipmentStatusSchema`), read as `Shipment["status"]` or `.options` | `$manage-server-state` |
| Form values | the form schema; split `z.input` and `z.output` only when a transform or coercion makes them differ | `$build-forms` |
| Shared client state | the scoped store's state type | `$build-composable-components` |
| Primitive or family props | the component's own props, read as `ComponentProps<typeof X>` | `$build-composable-components` |
| Fixed options | an `as const` array or object | this skill |

## Reusable code owns its contract

Primitives and families in `components/ui`, shared hooks, and shared helpers
describe UI or platform values, not records:

- Accept UI or platform vocabulary: `value: Date | string`,
  `label: ReactNode`, `variant`, `size`, `itemValues: string[]` ids. Owning
  `string` here is correct; it is the code's contract, not a copy of a field.
- Components extend the element or primitive they render:
  `Omit<ComponentProps<"time">, "dateTime" | "children"> & { value: Date | string }`
  or `ComponentProps<typeof Badge>`. Omit only the keys the component
  replaces, spread the rest, and merge `className` last.

## Feature code derives

Components, hooks, and helpers in `features/<feature>` derive product types:

| Need | Derivation |
| --- | --- |
| A record part, or several fields of one record | `shipment: Pick<Shipment, "trackingCode" \| "status">`; the record comes from outside as a prop, not loose primitive arguments |
| One field | `Shipment["estimatedArrival"]` |
| Nested object or array element | `Shipment["carrier"]`, `Order["lines"][number]` |
| Map keyed by a union | `satisfies Record<Shipment["status"], ...>`; a new server status fails compile in the map |
| List built from a union | `["all", ...shipmentStatusSchema.options] as const`, then `(typeof shipmentStatusFilters)[number]` |
| One primitive prop | `NonNullable<ComponentProps<typeof Badge>["variant"]>` |
| Family callback | `ComponentProps<typeof Roster>["onValueChange"]` |
| Hook state | `useState<ShipmentStatusFilter>("all")` |

Pick the fields the code reads; use the whole record type only when it reads
nearly all of them. Map records to reusable props and arguments at the edge
(`<Timestamp value={shipment.estimatedArrival} />`). When the source changes,
the compiler flags that line; convert or format there.

```tsx
// Before: redeclared facts; a schema change never reaches this code
type ShipmentRowProps = { trackingCode: string; status: string; estimatedArrival: string }
const statusLabels: Record<string, string> = { pending: "Pending", in_transit: "In transit" }
const getStatusLabel = (status: string) => statusLabels[status] ?? status

// After: derived from the owner; a missing or renamed status fails compile
type ShipmentRowProps = {
  shipment: Pick<Shipment, "trackingCode" | "status" | "estimatedArrival">
}
const shipmentStatusLabels = {
  all: "All", pending: "Pending", in_transit: "In transit", delivered: "Delivered",
} satisfies Record<ShipmentStatusFilter, string>
```

## Narrow, never cast

- A primitive callback that returns `string` (`onValueChange` on ToggleGroup,
  Select, or Tabs) narrows through a type guard built from the owner, then
  sets state: `if (isShipmentStatusFilter(value)) setFilter(value)`. Never
  `setFilter(value as ShipmentStatusFilter)`.
- Do not add `as SomeRecord`, `as any`, `: any`, non-null `!`, `@ts-ignore`,
  `@ts-expect-error`, or a new `?` to make code accept changed data.
  `as const` and `satisfies` are fine; they check without widening.
- Do not patch a call site with `String(x)` or `Number(x)` because a parameter
  was redeclared too narrowly; derive it. Convert only when the reusable
  contract genuinely needs another representation.
- Unknown data enters through a schema parse at the trust boundary
  (`$manage-server-state`), so record types are trustworthy downstream.
- Prefer the narrowest honest type: a derived literal union over `string`,
  `unknown` over `any`, and a discriminated union over optional fields that
  are only valid together.

## Generics only when values flow back

Make a hook or helper generic only when it hands the caller's values back (a
filtered list, a selected record) or must preserve a literal union through its
API. Use one type parameter inferred from an argument; call sites never write
`<T>`. `useShipmentStatusFilter<TShipment extends Pick<Shipment, "status">>`
reads only `status` yet returns the caller's full records. Families stay
non-generic: no `items: T[]`, `getKey`, or render-callback props. The consumer
maps records inside the list part and passes UI ids
(`tasks.map((task) => task.id)`) as `itemValues`; a `string` callback value
narrows through a guard, as in Narrow, never cast.

## Do not overengineer

- No branded or nominal types, deep conditional or mapped types,
  `DeepPartial`-style utilities, or type re-export barrels unless the
  repository already uses them; no parallel DTO or domain interfaces, and no
  `types.ts` outside the owner that copies record shapes.
- Export a derived alias only when two or more modules use it, beside its
  owner; a module-private alias (`BadgeVariant`) may name a long derivation.
  Never export a props type just in case; consumers read
  `ComponentProps<typeof X>`, `Parameters<typeof fn>`, or
  `ReturnType<typeof useX>`. Props use `type` aliases.

## Companion skill routing

When the request crosses the type boundary, check the installed catalog:

- `$manage-server-state`: response schemas, record types, query options, and
  parsing at the trust boundary.
- `$build-forms`: form schema input and output values and field families.
- `$build-composable-components`: family anatomy, slots, variants, stores.
- `$extract-named-helpers`: whether a conversion deserves a named helper, and
  its placement and name; this skill types its parameters.
- `$feature-sliced-design`: where shared types, hooks, and helpers live.
- `$use-preferred-react-stack`: TypeScript configuration and library choices.

Recommend an absent companion once with its concrete benefit; require approval
to install it and continue without it when declined.

## References

- [drift-audit.md](references/drift-audit.md): searches, fix order, report.
- [examples/shipment-tracking](examples/shipment-tracking/src): every file
  type-checks. Start from the owner, then follow it outward:
  - [schemas.ts](examples/shipment-tracking/src/features/shipments/server-state/schemas.ts)
    and [types.ts](examples/shipment-tracking/src/features/shipments/server-state/types.ts):
    the status enum, response schema, and the one inferred `Shipment` owner.
  - [shipment-status.ts](examples/shipment-tracking/src/features/shipments/model/shipment-status.ts):
    helpers with a derived filter list, a `satisfies` label map, and a guard.
  - [use-shipment-status-filter.ts](examples/shipment-tracking/src/features/shipments/model/use-shipment-status-filter.ts):
    a feature hook generic only because it returns the caller's records.
  - [timestamp.tsx](examples/shipment-tracking/src/components/ui/timestamp.tsx):
    a reusable component that owns `value: Date | string`.
  - [shipment-row.tsx](examples/shipment-tracking/src/features/shipments/components/shipment-row.tsx)
    and [shipment-list.tsx](examples/shipment-tracking/src/features/shipments/components/shipment-list.tsx):
    adapters with `Pick`, a variant map, and a guarded ToggleGroup callback.

## Decision defaults

Use these only when the repository has no established convention:

- Record types: `features/<feature>/server-state/types.ts`, inferred from
  `schemas.ts` beside them; helpers and hooks: `features/<feature>/model/`.
- Reusable components live in `components/ui/<role>.tsx`; record adapters in
  `features/<feature>/components/<record>-<role>.tsx`.
