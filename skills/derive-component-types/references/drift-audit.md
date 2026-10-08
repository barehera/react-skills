# Drift audit

Use this mode when an existing codebase states the same type in several places.
When the user asks only for an audit, stop after the report; otherwise fix in
the order below.

## 1. Map the owners

List each owner and its field names and union literals before searching:

```bash
rg -n "z\.(infer|input|output)<" src        # schema-inferred records and form values
rg -n "as const" src                         # fixed options
rg -n "createStore<|StoreApi<" src           # scoped store state
```

A record with no schema (a hand-written `interface Shipment` fed by
`response.data as Shipment`) has no trustworthy owner yet; fixing that comes
first and routes to `$manage-server-state`.

## 2. Find redeclared types

Substitute the owner's field names and literals into each search.

| Signal | Search | Usually means |
| --- | --- | --- |
| Prop fields that match record fields | `rg -n "^\s*(estimatedArrival\|status\|carrier)\??:" src/features src/components` | a redeclared field; derive it |
| Hand-written props in feature code | `rg -n "(type\|interface) \w+Props\b" src/features` | check each field against its owner |
| Record casts | `rg -n "\bas [A-Z]\w*(\[\])?" src`, ignoring import aliases | a missing parse or silenced drift |
| `any` | `rg -n ":\s*any\b\|as any\|<any>" src` | lost inference |
| Suppressions and non-null | `rg -n "@ts-ignore\|@ts-expect-error\|\w!\." src` | silenced drift |
| String-keyed maps over a union | `rg -n "Record<string," src` | use `satisfies Record<Owner["field"], ...>` |
| Copied union literals | `rg -n "\"in_transit\"" src`; outside the schema, a hit in a type is a copy | derive with `Owner["status"]` |
| Coercion at call sites | `rg -n "String\(\|Number\(" src/features` | a patch for a too-narrow prop |
| Annotated query results | `rg -n "useQuery<\|UseQueryResult<" src` | annotation that hides inference |
| Parallel shapes | `rg -n "(Dto\|DTO\|Model)\b" src`, `rg --files src \| rg "types\.ts$"` | a second declaration of a schema type |

## 3. Classify each hit

Apply the placement test to the file that holds the type:

- Feature adapter: derive from the owner (`Pick`, indexed access,
  `satisfies Record<...>`, `(typeof X)[number]`).
- Primitive or composable family: a UI-vocabulary prop (`value: Date | string`)
  is `owned on purpose`; a record import is a layer violation to remove.
- Left manual, with a reason: a third-party type you do not control, a value
  that is genuinely transformed before display, or `unknown` data before its
  schema parse.

## 4. Fix order

1. Owners first. Give each fact one schema-inferred type beside its schema,
   delete parallel DTOs, and parse unknown data at the boundary. Fixing the
   owner first makes the compiler list every drifted consumer.
2. Feature adapters next. Replace redeclared props with `Pick` or indexed
   access, string-keyed maps with `satisfies`, and casts or annotations with
   inference. Convert or format at the edge where the compiler points.
3. Reusable components last. Remove record imports, extend
   `ComponentProps<...>` with `Omit` for replaced keys, drop props types
   exported just in case, and make a component generic only when values flow
   back to the consumer.

Do not change runtime behavior while fixing types.

## 5. Verify

Run the repository's type check (its script, or `tsc --noEmit`) and fix every
error at the feature edge, never by widening a reusable prop or adding a cast.
Run existing tests in proportion to risk, then repeat the searches; every
remaining hit needs a report row.

## 6. Report

| Location | Type | Decision | Reason |
| --- | --- | --- | --- |
| `features/shipments/components/shipment-row.tsx` | `status: string` | derived | `Pick<Shipment, "status">` |
| `components/ui/timestamp.tsx` | `value: Date \| string` | owned on purpose | UI contract; no record import |
| `features/billing/api.ts` | `as Invoice` | left manual | no payload sample for a schema yet |

End with a count per decision, the type-check result, and
`React Skills v<version>`.
