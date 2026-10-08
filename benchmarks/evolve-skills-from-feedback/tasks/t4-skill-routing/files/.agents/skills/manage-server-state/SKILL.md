---
name: manage-server-state
description: Fetch, cache, and mutate server data with TanStack Query and the app's API client. Use when adding queries, mutations, cache updates, optimistic updates, or invalidation.
---

# Manage Server State

## Version

Read `../VERSION` and include `React Skills v<version>` in the final handoff.

## Layer placement

Everything here is **feature adapter** code. Query and mutation hooks live in
`src/features/<feature>/server-state/`; components call the hooks and never
reach the cache themselves. Composable families never import these hooks.

## Companion skill routing

- `$build-composable-components` for the reusable UI that displays the data.
- `$document-business-logic` for comments that explain product policy.

## Rules

1. Query keys come from the feature's key factory in `server-state/keys.ts`;
   never hand-write key arrays, because hand-written keys drift from the
   factory and miss invalidations.
2. Each mutation hook owns its cache effects (`setQueryData`, invalidation,
   rollback) in its own callbacks. Components call `mutate` or `mutateAsync`
   and only update UI state.
3. Update the cache optimistically when the server result is predictable from
   the input, and roll back on error. Otherwise wait for the server and
   invalidate.
4. All requests go through `api` in `src/lib/api.ts`.

## Example

```ts
export function useRenameTaskMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ task, title }: { task: Task; title: string }) =>
      api.patch<Task>(`/tasks/${task.id}`, { title }),
    onSuccess: (updated) => {
      queryClient.setQueryData(taskKeys.detail(updated.id), updated)
      queryClient.invalidateQueries({ queryKey: taskKeys.list(updated.projectId) })
    },
  })
}
```
