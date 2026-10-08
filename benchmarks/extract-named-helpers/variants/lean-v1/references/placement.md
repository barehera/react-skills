# Placement examples

When a recorded consumer exists in another module, and the helper is business-agnostic or owned by the lower
domain module, keep it exported from that lower module:

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

Do not move a helper from a lower layer into a feature merely because that
feature happens to have the most callers; with one consumer and no record,
report an existing lower-layer export as `revisit` instead of moving it.

"One file per tiny helper" means splitting helpers of one concern across
files. A small module for a different purpose is a legitimate boundary, even
with one function today:

```text
Avoid:  date/format-short-date.ts, date/format-long-date.ts
        (one formatting concern, one helper per file)
Fine:   date/format.ts (formatting) + i18n/date-locale.ts (locale resolution)
        (two purposes; more locale helpers belong beside the first)
```
