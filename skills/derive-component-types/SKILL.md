---
name: derive-component-types
description: Keep React and TypeScript types single-sourced so a changed field reaches every consumer through the compiler. Use when a component prop, map, callback, or constant restates a type already owned by a response schema, form schema, store, primitive, or constant (a `createdAt: string` prop, a copied status union, a `Record<string, ...>` status map); when a call site needs `as`, `any`, `!`, or `String(x)` to pass data; when deciding whether a reusable component owns its props, derives them with `Pick` or indexed access, or becomes generic; or when auditing a codebase for type drift without overengineering.
---

# Derive Component Types

Give every type one owner and derive every other mention from it, so a source
change reaches each consumer through the compiler instead of a cast.

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

React Skills code lives in one of three layers: primitives (shadcn/Radix and
`cn`), composable families (compound roots, slots, item boundaries, scoped
stores), and feature adapters (screens, schemas, queries, mutations, product
rules). Dependencies point downward only.

This skill owns no layer; it decides how types cross layers. Primitives and
families own their contract in UI vocabulary and never import feature or
record types. Feature adapters derive from the owner and map records to
reusable props at the edge, where both types are known. A type import follows
the same downward direction as a value import.

## Required workflow

1. Read repository instructions, compiler strictness, and the code the task
   touches. Name the owner of each fact before editing (see Owners).
2. Classify every receiving component with the placement test: code that
   changes when the product changes is a feature adapter; code that changes
   when the design system changes is a primitive or family.
3. Derive in feature adapters; own the contract in primitives and families.
4. Remove the redeclared shapes, widened props, casts, and needless
   annotations the derivation replaces. Preserve runtime behavior.
5. Run the type check. Fix every reported consumer at the feature edge by
   converting or formatting there; never widen a reusable component or add a
   cast to make the error disappear.
6. Report each type as `derived`, `owned on purpose`, or `left manual` with a
   reason, and include `React Skills v<version>`.

Audit mode: for existing drift, follow [drift-audit.md](references/drift-audit.md).

## Owners

One fact has one owner. Never restate it in a second declaration.

| Fact | Owner | Route |
| --- | --- | --- |
| Remote record | `type Shipment = z.infer<typeof shipmentSchema>` beside the response schema | `$manage-server-state` |
| Form values | the form schema; split `z.input` and `z.output` only when a transform or coercion makes them differ | `$build-forms` |
| Shared client state | the scoped store's state type | `$build-composable-components` |
| Primitive or family props | the component's own props, read as `ComponentProps<typeof X>` | `$build-composable-components` |
| Fixed options | an `as const` array or object | this skill |

## Reusable components own their contract

Primitives and families in `components/ui` describe UI, not records:

- Accept UI vocabulary: `value: Date | string`, `label: ReactNode`,
  `variant`, `size`. Owning `string` here is correct; it is the component's
  contract, not a copy of a server field.
- Extend the element or primitive they render:
  `Omit<ComponentProps<"time">, "dateTime" | "children"> & { value: Date | string }`
  or `ComponentProps<typeof Badge>`. Omit only the keys the component
  replaces, spread the rest, and merge `className` last.
- Never import a feature, schema, query, or record type.

## Feature adapters derive

A feature adapter in `features/<feature>` derives every product type:

| Need | Derivation |
| --- | --- |
| Several fields of one record | `shipment: Pick<Shipment, "trackingCode" \| "status">`; pass the narrowed record, not loose primitive props |
| One field | `Shipment["estimatedArrival"]` |
| Nested object or array element | `Shipment["carrier"]`, `Order["lines"][number]` |
| Map keyed by a union | `satisfies Record<Shipment["status"], ...>`; a new server status fails compile in the map |
| One primitive prop | `NonNullable<ComponentProps<typeof Badge>["variant"]>` |
| Family callback | `ComponentProps<typeof Roster>["onValueChange"]` |
| Constant options | `as const`, then `(typeof SHIPMENT_FILTERS)[number]` |
| Query data | let `useQuery(options)` infer; never annotate the result |

Pick the fields the component reads; use the whole record type only when it
reads nearly all of them. Map the record to reusable props at the edge
(`<Timestamp value={shipment.estimatedArrival} />`). When the source changes,
the compiler flags that line; convert or format there.

```tsx
// Before: redeclared facts; a schema change never reaches this row
type ShipmentRowProps = { trackingCode: string; status: string; estimatedArrival: string }
const statusLabels: Record<string, string> = { pending: "Pending", in_transit: "In transit" }

// After: derived from the owner; a missing or renamed status fails compile
type ShipmentRowProps = {
  shipment: Pick<Shipment, "trackingCode" | "status" | "estimatedArrival">
}
const shipmentStatusBadges = {
  pending: { label: "Pending", variant: "outline" },
  in_transit: { label: "In transit", variant: "secondary" },
  delivered: { label: "Delivered", variant: "default" },
} satisfies Record<Shipment["status"], { label: string; variant: BadgeVariant }>
```

## Generics only when values flow back

Make a reusable component generic only when it hands consumer values back
(`onValueChange`, a selected `value`, `getKey`) or must preserve a literal
union through its API. Use one type parameter inferred from a prop (`value: T`
with `onValueChange: (value: T) => void`); call sites never write `<T>`. A
component that only renders children or plain values stays non-generic.
`ComponentProps<typeof X>` resolves a generic `T` to its constraint, so type a
callback an adapter passes on from the owner: `(status: Shipment["status"]) => void`.

Extract to `components/ui` only for a second consumer or a design-system
concept; route its anatomy to `$build-composable-components`.

## Never silence drift

- Do not add `as SomeRecord`, `as any`, `: any`, non-null `!`, `@ts-ignore`,
  `@ts-expect-error`, or a new `?` to make a consumer accept changed data.
  `as const` and `satisfies` are fine; they check without widening.
- Do not patch a call site with `String(x)` or `Number(x)` because a prop was
  redeclared too narrowly; derive the prop. Convert only when the reusable
  contract genuinely needs another representation.
- Unknown data enters through a schema parse at the trust boundary
  (`$manage-server-state`), so record types are trustworthy downstream.

## Do not overengineer

- No branded or nominal types, deep conditional or mapped types,
  `DeepPartial`-style utilities, or type re-export barrels unless the
  repository already uses them.
- No parallel DTO and domain interfaces when the schema already infers the
  type, and no `components/types.ts` that copies record shapes.
- Export a derived alias only when two or more modules use it, and keep it
  beside its owner (`server-state/types.ts`). A module-private alias such as
  `BadgeVariant` may name a long derivation inside one file.
- Do not export a component's props type just in case; consumers read
  `ComponentProps<typeof X>`.
- Use `type` aliases for props. Let inference type query results, `map`
  callbacks, and return values the compiler already knows.

## Companion skill routing

When the request crosses the type boundary, check the installed catalog:

- `$manage-server-state`: response schemas, record types, query options, and
  parsing at the trust boundary.
- `$build-forms`: form schema input and output values and field families.
- `$build-composable-components`: family anatomy, slots, variants, stores.
- `$extract-named-helpers`: an edge conversion that deserves a named helper.
- `$feature-sliced-design`: where shared types live across features.
- `$use-preferred-react-stack`: TypeScript configuration and library choices.

Recommend an absent companion once with its concrete benefit; require approval
to install it and continue without it when declined.

## References

- [drift-audit.md](references/drift-audit.md): search patterns, fix order,
  verification, and the report table for an existing codebase.
- [examples/shipment-tracking](examples/shipment-tracking/src): read before
  deriving props from a record; every file type-checks.
  - [schemas.ts](examples/shipment-tracking/src/features/shipments/server-state/schemas.ts)
    and [types.ts](examples/shipment-tracking/src/features/shipments/server-state/types.ts):
    the response schema and the one inferred `Shipment` owner.
  - [timestamp.tsx](examples/shipment-tracking/src/components/ui/timestamp.tsx):
    a reusable component that owns `value: Date | string`.
  - [shipment-row.tsx](examples/shipment-tracking/src/features/shipments/components/shipment-row.tsx):
    the adapter with `Pick`, a `satisfies` status map, and a Badge variant.
  - [shipment-list.tsx](examples/shipment-tracking/src/features/shipments/components/shipment-list.tsx):
    the screen that passes inferred query data with no annotations.

## Decision defaults

Use these only when the repository has no established convention:

- Record types live in `features/<feature>/server-state/types.ts`, inferred
  from `schemas.ts` beside them.
- Reusable components live in `components/ui/<role>.tsx`; record adapters in
  `features/<feature>/components/<record>-<role>.tsx`.
