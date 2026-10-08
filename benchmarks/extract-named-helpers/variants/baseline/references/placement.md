# Place by ownership, then reuse

Search current callers and the domain's existing modules before adding a file.
For a single consuming module, put the helper at module scope without `export`.
Two exported functions in that file may share the same private predicate.

When a component and a utility need the same stable business rule, move it into
the existing domain module and import it directly from both. Keep sibling
predicates/getters together so the file expresses one vocabulary. Do not create
`helpers.ts`, a re-export barrel, or an empty utility hierarchy.

An independently testable policy, a server-only dependency, or an existing
public contract may justify a dedicated named module even with one production
caller. Consumer count is a default, not a ban on meaningful boundaries.

An export is speculative only when no current or recorded consumer outside its
module exists. When a roadmap, backlog, plan, design, or sibling screen records
a consumer in another module, and the helper is business-agnostic or owned by
the lower domain module, keep it exported from that lower module:

```text
Helper: toDayStartDateTime(day) -> "YYYY-MM-DDT00:00:00" (API period bound)
Current callers: one list filter module.
Recorded consumers: two more lists with period filters (backlog items).
Previous placement: make it module-private in the one list module.
Improved placement: keep it exported from the business-agnostic date library,
because recorded consumers in other slices need it and it encodes no product
rule of one slice.
```

A record never promotes a slice's product rule to shared code. A helper that
encodes one slice's pricing exception stays in that slice even if another
slice might someday show prices.

"One file per tiny helper" means splitting helpers of one concern across
files. A small module for a different purpose is a legitimate boundary, even
with one function today:

```text
Avoid:  date/format-short-date.ts, date/format-long-date.ts
        (one formatting concern, one helper per file)
Fine:   date/format.ts (formatting) + i18n/date-locale.ts (locale resolution)
        (two purposes; more locale helpers belong beside the first)
```

Use `$feature-sliced-design` for cross-slice and purpose placement. Shared only
receives business-agnostic foundations; a reused inspection policy may belong
to an entity, not `shared/utils`. Preserve existing paths in a scoped
extraction. Do not move a helper from a lower layer into a feature merely
because that feature happens to have the most callers; with one consumer and
no record, report an existing lower-layer export as `revisit` instead of
moving it.
