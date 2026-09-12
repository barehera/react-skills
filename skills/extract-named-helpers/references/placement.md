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

Use `$feature-sliced-design` for cross-slice placement. Shared only receives
business-agnostic foundations; a reused inspection policy may belong to an
entity, not `shared/utils`. Preserve existing paths in a scoped extraction.
Do not move a helper from a lower layer into a feature merely because that
feature happens to have the most callers.
