# Comments API

Owner: Platform team. All routes are relative to `/api` and use the same
session cookie as the rest of the app.

## List a task's comments

`GET /tasks/{taskId}/comments`

| Query param | Type | Notes |
| --- | --- | --- |
| `limit` | integer, 1-50 | Optional. Defaults to 20. |
| `cursor` | string | Optional. Opaque value from the previous page's `nextCursor`. Omit for the first page. |

Comments are returned newest first.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `taskId` | string | |
| `authorId` | string | |
| `body` | string | Plain text. |
| `createdAt` | string | ISO 8601 timestamp. |

Responses may contain additional fields.

Example `200` response (first page):

```json
{
  "comments": [
    {
      "id": "cmt_81",
      "taskId": "tsk_12",
      "authorId": "usr_3",
      "body": "Shipped to staging.",
      "createdAt": "2026-09-30T08:14:22Z",
      "editedAt": null,
      "source": "web",
      "attachments": []
    },
    {
      "id": "cmt_80",
      "taskId": "tsk_12",
      "authorId": "usr_7",
      "body": "Can we get a screenshot of the new empty state?",
      "createdAt": "2026-09-29T16:40:03Z",
      "editedAt": "2026-09-29T17:02:10Z",
      "source": "email",
      "attachments": []
    }
  ],
  "nextCursor": "eyJpZCI6ImNtdF83OSJ9"
}
```

On the last page `nextCursor` is `null`.

## Add a comment

`POST /tasks/{taskId}/comments`

Request body:

```json
{ "body": "Looks good to me." }
```

`201` returns the created comment in the same shape as a list item.

## Delete a comment

`DELETE /comments/{commentId}`

`204` with no body. Only the author or a project owner may delete a comment;
others receive `403`.

## Comment counts

`Task.commentCount` (returned by `GET /projects/{projectId}/tasks` and
`GET /tasks/{taskId}`) is computed by the server from the task's current
comments.
