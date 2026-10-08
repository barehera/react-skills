# Worked examples

API-shape references: copy the shape, not the domain names. For a complete,
type-checked composition of a generic family, a feature adapter, and an
optimistic mutation, read [../examples/layered-family](../examples/layered-family).
Visual configuration is shown in
[variants-and-styling.md](variants-and-styling.md#variant-implementation-pattern).

## Contents

- [Open composition and presentational collection](#open-composition-and-presentational-collection)
- [Root-owned controlled collection](#root-owned-controlled-collection)
- [Remote result collection](#remote-result-collection)
- [Required bindings after a spread](#required-bindings-after-a-spread)
- [Scoped Zustand transport](#scoped-zustand-transport)
- [Composable persistent overlay](#composable-persistent-overlay)
- [Optimistic mutation boundary](#optimistic-mutation-boundary)

## Open composition and presentational collection

Keep slot copy and independently variable actions at the call site. When the
consumer already owns a presentational array, map it inside a structural list
slot rather than hoisting it to the root:

```tsx
<ResourceCard>
  <ResourceCardHeader>
    <ResourceCardTitle>{title}</ResourceCardTitle>
    <ResourceCardDescription>{description}</ResourceCardDescription>
  </ResourceCardHeader>

  <ResourceCardContent>
    <ResourceCardItemList>
      {items.map((item) => (
        <ResourceCardItemListItem key={item.id} status={item.status}>
          <ResourceCardItemTitle>{item.title}</ResourceCardItemTitle>
        </ResourceCardItemListItem>
      ))}
    </ResourceCardItemList>
  </ResourceCardContent>

  <ResourceCardFooter>
    <ResourceCardCancel onClick={onCancel} />
    <ResourceCardConfirm
      disabled={confirmLocked}
      isLoading={confirmPending}
      onClick={onConfirm}
    />
  </ResourceCardFooter>
</ResourceCard>
```

The root may still generate a title ID and share that wiring through context;
it should not store `title`, `items`, or per-action props merely so the visible
parts can be empty. A default label inside `Cancel` or `Confirm` is acceptable
when custom `children` replace it.

Do not teach closed mode wrappers as the only public API:

```tsx
// Wrong: consumers cannot recompose the underlying family.
<ResourceCardReview {...rootProps} />
<ResourceCardInProgress {...rootProps} />
```

Such wrappers may exist as secondary conveniences only when the exported root
and slots remain directly composable.

## Root-owned controlled collection

The parent remains authoritative through `steps` and `onStepsChange`. Because
the workflow root receives `steps`, the collection boundary enumerates the
accepted root snapshot. Each returned step keeps fully consumer-owned anatomy.

```tsx
<ApprovalWorkflowRoot
  steps={steps}
  onStepsChange={setSteps}
  size="lg"
>
  <ApprovalWorkflowToolbar>
    <ApprovalWorkflowUndoButton />
    <ApprovalWorkflowRedoButton />
    <ApprovalWorkflowAddButton />
    <ApprovalWorkflowSaveButton
      className="ml-auto"
      disabled={!canSave}
      onClick={saveSteps}
    />
  </ApprovalWorkflowToolbar>

  <ApprovalWorkflowStepCollection>
    {(step) => (
      <ApprovalWorkflowStep key={step.id} stepId={step.id}>
        <ApprovalWorkflowStepHeader>
          <ApprovalWorkflowStepTitle>
            <ApprovalWorkflowStepPosition />
            <ApprovalWorkflowStepName>
              {step.name}
            </ApprovalWorkflowStepName>
          </ApprovalWorkflowStepTitle>
          <ApprovalWorkflowStepDescription>
            {step.description}
          </ApprovalWorkflowStepDescription>
          <ApprovalWorkflowStepHeaderActions>
            <ApprovalWorkflowStepEditButton />
          </ApprovalWorkflowStepHeaderActions>
        </ApprovalWorkflowStepHeader>
        <ApprovalWorkflowStepControls>
          <ApprovalWorkflowStepRequiredField />
          <ApprovalWorkflowStepControlActions>
            <ApprovalWorkflowStepMoveUpButton />
            <ApprovalWorkflowStepMoveDownButton />
            {!step.required && <ApprovalWorkflowStepRemoveButton />}
          </ApprovalWorkflowStepControlActions>
        </ApprovalWorkflowStepControls>
      </ApprovalWorkflowStep>
    )}
  </ApprovalWorkflowStepCollection>
</ApprovalWorkflowRoot>
```

The consumer can remove the description, move the edit action, add a separator,
or replace the status layout. Nested leaves derive identity and current index
from `ApprovalWorkflowStep`; they never receive a repeated positional prop.

## Remote result collection

The adapter owns remote policy. It passes the result array once to the picker
root. `ReviewerPickerItems` suppresses results while loading, failed, or empty,
then exposes each valid reviewer without hardcoding presentation.

```tsx
<ReviewerPickerRoot
  reviewers={reviewers}
  value={reviewerId}
  onValueChange={setReviewerId}
  query={query}
  onQueryChange={setQuery}
  loading={loading}
  error={error}
>
  <ReviewerPickerTrigger />
  <ReviewerPickerContent>
    <ReviewerPickerInput />
    <ReviewerPickerList>
      <ReviewerPickerLoading />
      <ReviewerPickerError />
      <ReviewerPickerEmpty />
      <ReviewerPickerItems>
        {(reviewer) => (
          <ReviewerPickerItem key={reviewer.id} reviewerId={reviewer.id}>
            <ReviewerPickerItemContent>
              <ReviewerPickerItemName>
                {reviewer.name}
              </ReviewerPickerItemName>
              <ReviewerPickerItemDescription>
                {reviewer.description}
              </ReviewerPickerItemDescription>
            </ReviewerPickerItemContent>
            <ReviewerPickerItemSelectionIndicator />
          </ReviewerPickerItem>
        )}
      </ReviewerPickerItems>
    </ReviewerPickerList>
  </ReviewerPickerContent>
</ReviewerPickerRoot>
```

Keep loading, error, and empty components focused and independently replaceable.
Let the items boundary coordinate when results may render. Do not repeat
`!loading && !error && reviewers.map(...)` in every consumer.

## Required bindings after a spread

Spread consumer props first and apply the required binding last, composing the
consumer's handler, so a consumer prop cannot override it:

```tsx
function PickerInput({ onValueChange, ...props }: PickerInputProps) {
  const query = usePicker((state) => state.query)
  const setQuery = usePicker((state) => state.setQuery)

  return (
    <CommandInput
      {...props}
      value={query}
      onValueChange={(nextQuery) => {
        onValueChange?.(nextQuery)
        setQuery(nextQuery)
      }}
    />
  )
}
```

## Scoped Zustand transport

Create one vanilla store per root. Carry only the stable store handle through
React context and let each leaf select the smallest reactive slice.

```tsx
type PickerState = {
  query: string
  open: boolean
  setQuery: (query: string) => void
  setOpen: (open: boolean) => void
}

const PickerStoreContext =
  React.createContext<StoreApi<PickerState> | null>(null)

function PickerRoot({ children }: { children: React.ReactNode }) {
  const [store] = React.useState(() =>
    createStore<PickerState>((set) => ({
      query: "",
      open: false,
      setQuery: (query) => set({ query }),
      setOpen: (open) => set({ open }),
    }))
  )

  return (
    <PickerStoreContext.Provider value={store}>
      {children}
    </PickerStoreContext.Provider>
  )
}

function PickerQueryLabel() {
  const store = useRequiredPickerStore()
  const query = useStore(store, (state) => state.query)
  return <span>{query}</span>
}
```

Use a small item context for stable item identity, and do not put the whole
mutable store state into ordinary React context.

## Composable persistent overlay

The menu item requests a capability. The state-bound dialog remains an explicit
sibling of transient menu content, while repository primitives define its
visible anatomy.

```tsx
<TaskActionsRoot task={task} size="lg">
  <TaskActionsDropdownMenu>
    <TaskActionsDropdownMenuTriggerButton />
    <TaskActionsDropdownMenuContent>
      <TaskActionsRenameDropdownMenuItem />
      {canDelete && <TaskActionsDeleteDropdownMenuItem />}
    </TaskActionsDropdownMenuContent>
  </TaskActionsDropdownMenu>

  {canDelete && (
    <TaskActionsDeleteAlertDialog>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete “{task.title}”?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <TaskActionsDeleteCancelButton />
          <TaskActionsDeleteAction />
        </AlertDialogFooter>
      </AlertDialogContent>
    </TaskActionsDeleteAlertDialog>
  )}
</TaskActionsRoot>
```

The family owns open state, pending state, mutation behavior, and safe closure.
The consumer can add media, warnings, or alternate footer layout without
duplicating deletion logic.

## Optimistic mutation boundary

Keep raw cache keys and rollback mechanics in server state. A focused domain
action calls one mutation hook and reacts at lifecycle-safe points:

```tsx
function TaskActionsDeleteAction(props: AlertDialogActionProps) {
  const task = useTaskActionsTask()
  const close = useTaskActionsStore((state) => state.closeDelete)
  const mutation = useDeleteTaskMutation()

  return (
    <AlertDialogAction
      {...props}
      disabled={mutation.isPending || props.disabled}
      onClick={(event) => {
        props.onClick?.(event)
        if (event.defaultPrevented) return
        event.preventDefault()
        void mutation
          .mutateAsync(task.id)
          .then(close)
          .catch(reportMutationError)
      }}
    />
  )
}
```

The mutation layer must cancel, snapshot, update, roll back, and reconcile every
affected list, detail, aggregate, and scoped representation. The component
should not know the raw query keys.
