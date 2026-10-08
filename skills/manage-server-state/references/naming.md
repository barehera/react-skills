# Naming

Use one vocabulary inside a project. Inspect existing names before adding an
alias; a consistent established term beats these defaults, and a requested
naming migration updates definitions and consumers together. Keep one source
per vocabulary: the project's existing names mechanism, a small shared names
file extended per feature in a new multi-feature architecture, or local
constants in a compact project.

## Operation vocabulary

For a new convention, reads are `list`, `infiniteList`, and `detail`; writes
are `create`, `update`, and `delete` (`src/server-state/names.ts` in the
example). Extend only for real capabilities such as `related`, `comments`,
`preferences`, or `search`. Do not use `detail`, `byId`, `single`, and `item`
for the same operation in one project.

## Namespaces

For a `Post` entity in a `posts` domain:

| Concern | Default |
| --- | --- |
| Query scope | `postsQueryScope` |
| Operations | `postsOperationNames` |
| Transport namespace | `postsApi` |
| Query keys | `postsQueryKeys` |
| Query options | `postsQueries` |
| Cache factory | `createPostsCache` |
| Cache hook | `usePostsCache` |
| Bound cache instance | `postsCache` |
| Collection hook | `usePostsListQuery` |
| Single-resource hook | `usePostDetailQuery` |
| Mutation hook | `useCreatePostMutation` |
| Input | `PostDetailInput` or `PostDetailQueryInput` |

Collection namespaces and hooks use the plural resource; one-resource data and
mutations use the singular entity.

At call sites, name the result after the hook without `use`:

```ts
const postsListQuery = usePostsListQuery({ filters });
const postDetailQuery = usePostDetailQuery({ postId });
const postsCache = usePostsCache();
const createPostMutation = useCreatePostMutation();
```

## Inputs

- New public operations take one object input, even with one field.
- Use `Input`, not `Props`, outside React component props.
- Include the operation when names would be ambiguous: `PostRelatedQueryInput`.

Cache action verbs are defined in [mutations-cache.md](mutations-cache.md#cache-semantics).
