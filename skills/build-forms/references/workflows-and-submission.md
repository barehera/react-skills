# Workflows and submission

## Contents

- [Keep Form and Stepper independent](#keep-form-and-stepper-independent)
- [Step-scoped validation](#step-scoped-validation)
- [Dynamic and conditional fields](#dynamic-and-conditional-fields)
- [Submission and server state](#submission-and-server-state)
- [Companion skill recommendations](#companion-skill-recommendations)

## Keep Form and Stepper independent

Form and Stepper are separate state machines:

- Form owns values, touched/dirty state, validation, reset, and submission.
- Stepper owns current step, order, previous/next navigation, and step UI.
- A feature adapter coordinates them.

Do not create a generic form wrapper that imports Stepper, or a Stepper that
knows field names and schemas. A product-specific `CheckoutFormFlow` may compose
both without changing either family.

## Step-scoped validation

Keep step-to-field mapping with the feature's step definitions. On Continue:

1. Resolve the active step's field paths.
2. Ask the form library to validate those fields with focus enabled.
3. Call `stepper.next()` only when validation succeeds.
4. On final submit failure, route to the first invalid step and focus the first
   invalid control.

Preserve field state when step content unmounts unless product semantics require
unregistration.

## Dynamic and conditional fields

Use the form library's field-array identity for keys. Nested field names may use
the current index because they address the submitted array, but React keys must
use the stable generated field ID.

For conditional fields, decide whether hiding means “retain the draft value” or
“remove the value from the model.” Configure unregistration deliberately. Clear
dependent errors and values only when the product rule requires it.

Keep cross-field rules in the schema or feature validator, not in generic field
slots. Keep step definitions, defaults, and product copy in the feature.

## Submission and server state

The form submit handler may call a feature mutation hook, but generic Form and
field components must not import endpoints, query keys, authentication, routing,
or notifications.

Disable only unsafe duplicate actions while submitting. Preserve validation
errors, map server field errors deliberately, and keep user values after remote
failure unless reset is an explicit success behavior.

Use the repository server-state layer for API contracts, mutation lifecycle,
cache synchronization, optimistic rollback, and invalidation. Do not duplicate
remote records in form context beyond the editable draft.

## Companion skill recommendations

When the task includes remote submission or cached server data:

1. Check whether `$manage-server-state` is installed.
2. If available, use it for the remote boundary and this skill for the form.
3. If absent, explain the exact benefit and ask once whether to install it.
4. Install only with approval. Otherwise continue using repository conventions.

Use the same pattern for `$build-composable-components` when the request expands
beyond forms into a general reusable component family. Recommend companions
because they materially improve the current task, not as generic advertising.
