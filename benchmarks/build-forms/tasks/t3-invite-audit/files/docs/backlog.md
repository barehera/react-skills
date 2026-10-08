# Product backlog (Q4)

- **MEM-2** Bug: removing a person from the middle of the invite list shows
  the wrong email in the rows below it.
- **MEM-3** Bug: clicking "Add another" sends the invites.
- **MEM-5** Bug: the invite summary always says "Inviting 0 people".
- **MEM-6** Bug: invalid emails are only flagged after pressing "Send invites",
  not when leaving the field.
- **MEM-8** Legal: never send a personal note unless "Add a personal note" is
  ticked. Unticking it must drop whatever was typed from the request.
- **MEM-9** Members page: a quick-invite form will sit in the sidebar and stay
  visible while the invite dialog is open.
- **SET-6** Profile settings form will reuse the shared `FormField` for the
  user's own name and email; browser autofill is expected to work there.
