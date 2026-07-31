# Worked examples

Use these examples as API-shape references. Adapt names, primitives, state
libraries, and file placement to the repository.

## Contents

- [Root-owned controlled collection](#root-owned-controlled-collection)
- [Remote result collection](#remote-result-collection)
- [Controlled optional value](#controlled-optional-value)
- [Scoped Zustand transport](#scoped-zustand-transport)
- [Composable persistent overlay](#composable-persistent-overlay)
- [Root-owned visual configuration](#root-owned-visual-configuration)
- [Optimistic mutation boundary](#optimistic-mutation-boundary)

## Root-owned controlled collection

The parent remains authoritative through `steps` and `onStepsChange`. Because
the workflow root receives `steps`, the collection boundary enumerates the
accepted root snapshot. Each returned step keeps fully consumer-owned anatomy.

```tsx
<ApprovalWorkflowRoot
  steps={steps}
  onStepsChange={setSteps}
  onSave={saveSteps}
  size="lg"
>
  <ApprovalWorkflowToolbar>
    <ApprovalWorkflowUndoButton />
    <ApprovalWorkflowRedoButton />
    <ApprovalWorkflowAddButton />
    <ApprovalWorkflowSaveButton className="ml-auto" />
  </ApprovalWorkflowToolbar>

  <ApprovalWorkflowStepCollection>
    {(step) => (
      <ApprovalWorkflowStep key={step.id} stepId={step.id}>
        <ApprovalWorkflowStepHeader>
          <ApprovalWorkflowStepTitle>
            <ApprovalWorkflowStepPosition />
            <ApprovalWorkflowStepName />
          </ApprovalWorkflowStepTitle>
          <ApprovalWorkflowStepDescription />
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
  size="lg"
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
            <ReviewerPickerItemIndicator />
            <ReviewerPickerItemContent>
              <ReviewerPickerItemName />
              <ReviewerPickerItemDescription />
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

## Controlled optional value

A clearable selection can be controlled while its current value is
`undefined`. Record controlledness independently of the value:

```tsx
function PickerRoot(props: PickerRootProps) {
  const controlled = Object.prototype.hasOwnProperty.call(props, "value")
  const [internalValue, setInternalValue] = React.useState(props.defaultValue)
  const value = controlled ? props.value : internalValue

  function setValue(nextValue: string | undefined) {
    if (!controlled) setInternalValue(nextValue)
    if (!Object.is(value, nextValue)) props.onValueChange?.(nextValue)
  }

  // Provide value and setValue to the family.
}
```

Do not let a consumer prop override a required internal binding:

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

Use a small item context for stable item identity. Do not put the whole mutable
store state into ordinary React context and do not share one module-global store
between repeated roots.

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
          <AlertDialogTitle>
            Delete “<TaskActionsTaskTitle />”?
          </AlertDialogTitle>
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

## Root-owned visual configuration

Use DOM propagation for connected non-portaled slots:

```tsx
function Tabs({ size = "default", variant = "default", ...props }: TabsProps) {
  return (
    <TabsPrimitive.Root
      data-size={size}
      data-variant={variant}
      className={cn(
        "group/tabs [--tabs-trigger-height:--spacing(8)]",
        "data-[size=lg]:[--tabs-trigger-height:--spacing(10)]"
      )}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsTriggerProps) {
  return (
    <TabsPrimitive.Trigger
      className={cn("h-(--tabs-trigger-height)", className)}
      {...props}
    />
  )
}
```

For a portaled slot such as `SelectContent`, a small React context may transport
the root size because CSS ancestry is unavailable. The trigger and content map
the same semantic value to different slot styles. Keep consumer page placement,
such as `className="ml-auto"`, outside the family.

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
