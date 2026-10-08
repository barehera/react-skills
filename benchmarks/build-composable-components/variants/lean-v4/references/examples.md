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

## Root-owned controlled collection

The parent remains authoritative through `steps` and `onStepsChange`. Because
the workflow root receives `steps`, the collection boundary enumerates the
accepted root snapshot. Each returned step keeps fully consumer-owned anatomy.

```tsx
<ApprovalWorkflow
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
</ApprovalWorkflow>
```

The consumer can remove the description, move the edit action, add a separator,
or replace the status layout. Nested leaves derive identity and current index
from `ApprovalWorkflowStep`; they never receive a repeated positional prop.

## Remote result collection

The adapter owns remote policy. It passes the result array once to the `Combobox`
root. `ComboboxItems` suppresses results while loading, failed, or empty,
then exposes each valid item without hardcoding presentation.

```tsx
<Combobox
  items={items}
  value={value}
  onValueChange={setValue}
  query={query}
  onQueryChange={setQuery}
  loading={loading}
  error={error}
>
  <ComboboxTrigger />
  <ComboboxContent>
    <ComboboxInput />
    <ComboboxList>
      <ComboboxLoading />
      <ComboboxError />
      <ComboboxEmpty />
      <ComboboxItems>
        {(item) => (
          <ComboboxItem key={item.id} value={item.id}>
            <ComboboxItemContent>
              <ComboboxItemLabel>
                {item.label}
              </ComboboxItemLabel>
              <ComboboxItemDescription>
                {item.description}
              </ComboboxItemDescription>
            </ComboboxItemContent>
            <ComboboxItemIndicator />
          </ComboboxItem>
        )}
      </ComboboxItems>
    </ComboboxList>
  </ComboboxContent>
</Combobox>
```

Keep loading, error, and empty components focused and independently replaceable.
Let the items boundary coordinate when results may render. Do not repeat
`!loading && !error && items.map(...)` in every consumer. A picker for one
record type, such as members, is a composition of this family in
`features/<feature>/components`, not a family in `components/`.

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

function Picker({ children }: { children: React.ReactNode }) {
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
