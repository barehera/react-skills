# Browser and form UX

## Contents

- [Bind once in reusable fields](#bind-once-in-reusable-fields)
- [Choose semantic hints at the feature](#choose-semantic-hints-at-the-feature)
- [Make errors recoverable](#make-errors-recoverable)
- [Preserve browser behavior](#preserve-browser-behavior)
- [Verify real interaction](#verify-real-interaction)

## Bind once in reusable fields

Put relationships that can be derived without product knowledge in the shared
field foundation:

- generate a unique control ID and bind the visible label to it;
- forward the form-library `name`, value, disabled state, ref, change, and blur
  bindings to the actual interactive element;
- include only rendered instructions and visible errors in
  `aria-describedby`;
- set `aria-invalid` only after validation marks the field invalid;
- set `aria-errormessage` only while invalid and only when it references a
  visible error slot;
- when a native control receives `required`, preserve it and reflect
  `aria-required`; for a custom control, propagate required state to its
  interactive element without asking consumers to repeat it;
- keep required IDs and ARIA relationships authoritative while preserving
  compatible consumer props.

Use native semantics first. ARIA augments a custom or scripted experience; it
does not replace a real label, input, select, button, fieldset, or form.

## Choose semantic hints at the feature

Do not guess field meaning in a generic Input family. Keep these as natural
control props and choose them where the product meaning is known:

- Use the most accurate input `type`, such as `email`, `tel`, `url`, `search`,
  `date`, or `number`. Prefer it over using `inputMode` as validation.
- Add valid `autocomplete` tokens for user information. Keep stable `name` and
  `id` values, a real owning form, and a submit button so browsers can autofill
  reliably. Do not disable autocomplete globally or invent token values.
- Use `inputMode` to improve the virtual keyboard only when the semantic input
  type cannot express the expected characters.
- Use `enterKeyHint` only when its label matches what Enter actually does.
- Choose `autoCapitalize`, `spellCheck`, and autocorrection from the content:
  names and prose differ from usernames, codes, URLs, and identifiers.
- Mirror useful schema constraints with native `required`, `minLength`,
  `maxLength`, `min`, `max`, `step`, and `pattern` props when their semantics
  truly match. Continue validating on the server.
- Prefer a native input or select when its browser picker, autofill, or mobile
  behavior is central to the task. For a custom Select or combobox, verify the
  primitive's hidden form control actually supports the required `name`,
  required state, and autofill behavior instead of assuming native parity.

These props are supported by the compound Control slot already; do not add
root-level prop bags or universal defaults.

## Make errors recoverable

Write visible error text that identifies the problem and, when known, explains
how to correct it. Do not rely on color, an icon, or `aria-invalid` alone.

Focus the first invalid interactive control after a failed submit. For a long
form, also consider a focused error summary whose links move to each invalid
control. Use `role="alert"` for a dynamically inserted submission summary when
immediate announcement is needed; do not make every inline field error an
assertive alert because that can create repeated or disruptive announcements.

Retain entered values after validation or remote failure. In a multi-step
process, reuse or offer previously entered information rather than requiring
the user to type it again.

## Preserve browser behavior

- Render a real `<form>` and a real submit button so Enter submission, browser
  autofill, password managers, and form ownership continue to work.
- Give every non-submit button inside a form `type="button"`.
- Keep labels visible; placeholders are examples, not label replacements.
- Do not block paste or password managers.
- Prefer `readOnly` when a value must remain focusable and submitted. A disabled
  native control is not focusable and is omitted from native form submission.
- Avoid automatic focus unless the task clearly benefits; preserve visible
  `:focus-visible` styling and practical touch-target size/spacing.
- Do not set `aria-busy` merely because a request is pending. Use it only when
  the referenced region is actively being updated and announcements should
  wait until the update is complete.

## Verify real interaction

Test autofill, password-manager behavior, mobile keyboards, Enter submission,
Tab order, label clicking, blur validation, invalid-submit focus, zoom/reflow,
and value retention in supported browsers. Inspect the accessibility tree to
confirm every ID reference resolves and no valid field exposes an error.

Primary references: [MDN autocomplete](https://developer.mozilla.org/docs/Web/HTML/Reference/Attributes/autocomplete),
[MDN inputmode](https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/inputmode),
[MDN enterkeyhint](https://developer.mozilla.org/docs/Web/HTML/Reference/Global_attributes/enterkeyhint),
[MDN aria-errormessage](https://developer.mozilla.org/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-errormessage),
[W3C form instructions](https://www.w3.org/WAI/tutorials/forms/instructions/),
and [W3C form notifications](https://www.w3.org/WAI/tutorials/forms/notifications/).
