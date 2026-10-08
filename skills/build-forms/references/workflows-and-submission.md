# Workflows and submission

## Contents

- [Form and Stepper](#form-and-stepper)
- [Step-scoped validation](#step-scoped-validation)
- [Dynamic and conditional fields](#dynamic-and-conditional-fields)
- [Recoverable errors](#recoverable-errors)
- [Field-shaped values](#field-shaped-values)
- [Submission and server state](#submission-and-server-state)

## Form and Stepper

Form owns values, touched/dirty state, validation, reset, and submission.
Stepper owns the current step, order, previous/next navigation, and step UI. A
feature adapter coordinates them: a feature action component may call the
typed form hook, validate the active step's fields, and then call the separate
Stepper API. A generic form wrapper never imports Stepper, a Stepper never
knows field names or schemas, and `createForm` holds no step state or step
definitions.

## Step-scoped validation

Keep the step-to-field mapping with the feature's step definitions. On
Continue:

1. Resolve the active step's field paths.
2. Ask the form library to validate those fields with focus enabled.
3. Call `stepper.next()` only when validation succeeds.
4. On final submit failure, route to the first invalid step and focus the
   first invalid control.

Preserve field state when step content unmounts unless product semantics
require unregistration.

## Dynamic and conditional fields

Nested field names may use the current index because they address the
submitted array, but React keys use the field array's stable generated ID.

For a conditional field, decide whether hiding means "retain the draft value"
or "remove the value from the model", and configure unregistration to match.
Clear dependent errors and values only when the product rule requires it.

Cross-field rules live in the schema or feature validator; step definitions,
defaults, and product copy live in the feature.

## Recoverable errors

Visible error text names the problem and, when known, how to correct it; color,
an icon, or `aria-invalid` alone is not enough.

Focus the first invalid interactive control after a failed submit. A long form
may add a focused error summary whose links move to each invalid control. Use
`role="alert"` for a dynamically inserted submission summary that needs
immediate announcement, but not on every inline field error, because repeated
assertive announcements disrupt users.

Retain entered values after validation or remote failure unless reset is an
explicit success behavior. In a multi-step process, reuse previously entered
information rather than asking for it again.

## Field-shaped values

Check the root's schema typing before writing a `transform` or `z.coerce`.
The example's `Form` accepts distinct input and output types
(`TTransformedValues`), so a transform is fine there. A root typed
`ZodType<T, T>` requires input to equal output: keep the value in the shape
the control produces, such as a string for a number typed into a text input
so tiny decimals are not rounded, and convert in the submit payload mapper in
the feature's form module.

```ts
const priceFormSchema = z.object({
  amount: z.string().trim().regex(/^\d+(\.\d+)?$/, "Enter a number such as 0.25"),
})

type PriceFormValues = z.infer<typeof priceFormSchema>

export function createPricePayload(values: PriceFormValues) {
  return { amount: Number(values.amount) }
}
```

Lock the mapper with a case table in the repository's test runner
(`$write-feature-tests` owns the table style):

```ts
it.each([
  { amount: "0.000001", expected: 0.000001 },
  { amount: "12", expected: 12 },
])("maps $amount to a numeric amount", ({ amount, expected }) => {
  expect(createPricePayload({ amount })).toEqual({ amount: expected })
})
```

Dates that several descendant sections need as `Date` objects may justify
extending the root's generics instead of keeping strings.

## Submission and server state

The form submit handler may call a feature mutation hook, but generic Form and
field components never import endpoints, query keys, authentication, routing,
or notifications.

Disable only unsafe duplicate actions while submitting. Map server field
errors deliberately. The server-state layer owns API contracts, mutation
lifecycle, cache synchronization, optimistic rollback, and invalidation; form
state holds no remote records beyond the editable draft.
