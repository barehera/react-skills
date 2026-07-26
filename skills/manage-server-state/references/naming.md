# Naming

## Consistency rule

Use one vocabulary inside a project. Inspect existing names before adding another alias. A consistent established project term beats the defaults below; a requested naming migration must update definitions and consumers together.

## Default operation vocabulary

Use this when starting a new convention:

```ts
export const resourceQueryNames = {
  list: "list",
  infiniteList: "infiniteList",
  detail: "detail",
} as const;

export const resourceMutationNames = {
  create: "create",
  update: "update",
  delete: "delete",
} as const;
```

Extend only for real capabilities such as `related`, `comments`, `preferences`, or `search`. Do not use `detail`, `byId`, `single`, and `item` for the same operation in one project. For a new vocabulary, prefer `detail`.

## Default namespace rules

For a `Post` entity in a `posts` domain:

| Concern | Default |
| --- | --- |
| Query scope | `postsQueryScope` |
| Operations | `postsOperationNames` |
| Transport namespace | `postsApi` |
| Query keys | `postsQueryKeys` |
| Query options | `postsQueries` |
| Cache actions | `postsCache` |
| Collection hook | `usePostsListQuery` |
| Single-resource hook | `usePostDetailQuery` |
| Mutation hook | `useCreatePostMutation` |
| Input | `PostDetailInput` or `PostDetailQueryInput` |

Use plural resource names for collection namespaces and hooks; use the singular entity for one-resource data and mutations.

At call sites, derive the result name from the hook by removing `use` and lowercasing the first letter:

```ts
const postsListQuery = usePostsListQuery({ filters });
const postDetailQuery = usePostDetailQuery({ postId });
const createPostMutation = useCreatePostMutation();
```

## Inputs and cache verbs

- Prefer one object input for new public operations, even with one field.
- Use `Input`, not `Props`, outside React component props.
- Include the operation when ambiguity exists: `PostRelatedQueryInput`.
- Use `setDetail` for a complete write and `patchDetail` for a partial merge.
- Use `invalidate*` to mark stale and `remove*` to erase cache entries.
- Reserve `delete` for a backend operation.

## Where names live

Use the project's existing central vocabulary mechanism. In a new multi-feature architecture, a small shared names file may define common operation words and each feature may extend it. In a compact project, local constants can be clearer. The invariant is a single source per vocabulary, not a mandatory filename.
