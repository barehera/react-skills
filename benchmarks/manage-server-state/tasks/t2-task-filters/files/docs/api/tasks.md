# Tasks API (excerpt)

All routes are relative to `/api`.

## List a project's tasks

`GET /projects/{projectId}/tasks`

Returns `Task[]` (see `src/features/tasks/types.ts`), newest first. The list is
not paginated.

New in API v14 — optional filters, combined with AND:

| Query param | Type | Notes |
| --- | --- | --- |
| `status` | `todo` \| `in_progress` \| `done` | Only tasks with this status. |
| `assigneeId` | string | Only tasks assigned to this member. Use the literal value `none` for unassigned tasks. |
| `search` | string | Case-insensitive match on the title. An empty string is the same as no filter. |

Unknown or empty parameters are ignored by the server.

Example: `GET /projects/prj_1/tasks?status=todo&search=release%20notes`

## Other task routes (unchanged)

- `GET /tasks/{taskId}` → `Task`
- `PATCH /tasks/{taskId}` with `{ "title": string }` → `Task`
- `POST /tasks/{taskId}/duplicate` → `Task`
- `DELETE /tasks/{taskId}` → `204`
