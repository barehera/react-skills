# Workflows and questions

## Contents

- [Questions](#questions)
- [Create from scratch](#create-from-scratch)
- [Create feature](#create-feature)
- [Add endpoint](#add-endpoint)
- [Refactor](#refactor)
- [Audit](#audit)

## Questions

Inspect first. Ask only when an unresolved answer changes routes, types,
placement, dependencies, authentication, pagination, cache behavior, or public
compatibility. Typical questions ask for the endpoint documentation, OpenAPI
or collection file, redacted cURL, or representative request and response
JSON; whether pagination is cursor, offset, or page based and which response
value indicates the next request; whether the endpoint is protected and which
existing auth hook or client gates it; whether a mutation returns the complete
entity and which visible collections or relationships it changes; and whether
to add a missing runtime-validation or key-factory dependency.

Do not ask users to choose between implementation details they delegated.
Recommend one option with a reason and proceed when the choice is reversible
and within scope.

## Create from scratch

1. Propose the smallest structure that supports the first real feature,
   without speculative shared abstractions.
2. Confirm only missing material decisions, especially contract source and
   allowed dependencies.
3. Establish naming and key rules, then implement the first vertical slice end
   to end.
4. Extract shared primitives only once they are actually shared or clearly
   project-wide.

## Create feature

1. Inspect a neighboring feature if one exists.
2. Confirm singular/plural names and every endpoint contract in scope.
3. Choose placement by project convention.
4. Implement contracts/types, transport, keys/options, hooks, mutations, and
   cache effects in dependency order, creating only files with real
   responsibilities.

## Add endpoint

1. Preserve the feature's vocabulary and placement.
2. Decide whether the operation is a root read, a child/context read, or a
   write.
3. Extend the smallest set of contract, transport, key, option, hook, and cache
   files, keeping existing public imports stable.

## Refactor

1. Inventory public imports and call sites before changing structure.
2. Name concrete problems: duplicated keys, inconsistent naming, unsafe
   responses, auth leaks, cache bugs, or mixed responsibilities. Fix them in
   the project's structure; a sound layer-based project with `byId`/`detail`
   aliases gets one vocabulary, not a move into feature folders.
3. Agree on migration scope when public APIs or many files will change.
4. Migrate in dependency order and update consumers before removing old entry
   points.
5. Preserve backend behavior unless a contract change is independently
   verified.

## Audit

Report findings with file and line locations; do not implement fixes unless
authorized. Check that:

- placement follows the project or has an explicit rationale;
- each operation has one name;
- routes, request fields, and response handling match the evidence, and
  contract facts are classified verified, observed, inferred, or unresolved;
- runtime requests were not used when documentation or repository evidence was
  sufficient;
- runtime validation or generated-type trust is deliberate, and failed
  response validation reports drift without rejecting the query;
- query keys include every discriminating input, and finite and infinite data
  do not share an identity;
- cancellation and auth gating prevent unintended requests;
- hooks and options expose a stable API that cannot replace identity;
- pagination stays backend-shaped;
- mutation cache effects are targeted and complete;
- defaults are centralized only where repetition exists;
- public imports stay compatible within the requested scope;
- available validation commands pass.
