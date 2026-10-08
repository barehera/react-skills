# Agent session notes: task row actions (2026-10-06)

Skill used: `build-composable-components` (installed in `.agents/skills/`).
Copied from the chat by Priya; agent turns are shortened.

## Prompt

> Add row actions to tasks. Each row in `TaskList` needs a "⋯" menu with
> Rename, Duplicate, and Delete. Delete asks for confirmation, and only people
> allowed by `canDeleteTask` may delete. The same actions go into
> `TaskDetailHeader` at a larger size. Make it reusable.

## Turn 1 (agent)

Created `src/components/ui/action-menu.tsx` (family) and
`src/features/tasks/components/task-actions.tsx` (adapter). Delete was built
like this:

```tsx
{canDelete && (
  <ActionMenuItem variant="destructive" onSelect={() => remove.reset()}>
    <AlertDialog>
      <AlertDialogTrigger>Delete</AlertDialogTrigger>
      <AlertDialogContent>{/* … confirm / cancel … */}</AlertDialogContent>
    </AlertDialog>
  </ActionMenuItem>
)}
```

For the header, `TaskActions` took an `itemClassName` prop and the header
passed `itemClassName="h-10 text-base"`, which every item applied.

Agent's note: "The skill says to set size once on the root, but `DropdownMenu`
renders no DOM element, so there is nowhere to put `data-size`. I passed the
size classes to the items instead."

## Turn 2 (user)

> Delete is broken. I click Delete, the menu closes, and the confirmation
> flashes for a frame and disappears. Support ticket #4471 from Northwind
> Logistics (dana.whitfield@northwind-logistics.com) says Delete "does
> nothing". The API is fine, this works:
>
> ```
> curl -X DELETE https://api.acme-tasks.io/v1/tasks/t_8812 \
>   -H "Authorization: Bearer acme_live_7Hq2xV9pLr4Ks8Zt"
> ```

## Turn 3 (agent)

Kept the dialog inside the item, but stopped the menu from closing:
`onSelect={(event) => event.preventDefault()}` on the item and `modal={false}`
on the menu.

## Turn 4 (user)

> Better, but now the menu stays open behind the dialog and focus jumps back
> into the menu when I cancel. Let's not keep the menu open at all. Close the
> menu normally, and put the dialog next to the menu, controlled by state in
> `TaskActions`. The Delete item just opens it.

## Turn 5 (agent)

Moved the `AlertDialog` out of the menu: it is now a sibling of `ActionMenu`,
its `open` state lives in `TaskActions`, the Delete item calls
`setConfirmOpen(true)`, and the confirm button keeps the dialog open while the
delete is pending. User: "Yes, that's it."

## Turn 6 (user)

> Why does the header pass `itemClassName="h-10 text-base"`? Size should be one
> prop. If the root has no element, put it on the content, that's where the
> items are.

Agent added `size` to `ActionMenuContent` (`data-size` plus the
`group/action-menu` named group), items read it with
`group-data-[size=lg]/action-menu:` selectors, and `itemClassName` was
removed. The header now renders `<TaskActions task={…} size="lg" />`.

## Turn 7 (user)

> Last thing: in this app, any item that opens a dialog or a prompt ends with an
> ellipsis: "Rename…", "Delete…". That's our copy style.

Agent updated the labels.

## Turn 8 (user)

> Ship it.

`npm run typecheck` passed. The final code is what is in the repository now:
`src/components/ui/action-menu.tsx`,
`src/features/tasks/components/task-actions.tsx`, and the two screens.
