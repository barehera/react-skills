# Notifications API

All routes are relative to `/api`. Every route requires a signed-in session
and returns `401` without one.

## Notification

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `projectId` | string | |
| `type` | string | Current values include `assigned`, `commented`, and `status_changed`. New types are added without a client release; clients must show unknown types with a generic fallback instead of failing. |
| `title` | string | Ready-to-display text. |
| `read` | boolean | |
| `actorId` | string \| null | `null` for system notifications. |
| `createdAt` | string | ISO 8601 timestamp. |

## List notifications

`GET /projects/{projectId}/notifications`

| Query param | Type | Notes |
| --- | --- | --- |
| `filter` | `all` \| `unread` | Defaults to `all`. |
| `limit` | integer, 1-50 | Defaults to 20. |
| `cursor` | string | Opaque value from the previous response's `nextCursor`. Omit for the first page. |

`200`:

```json
{
  "notifications": [
    {
      "id": "ntf_204",
      "projectId": "prj_1",
      "type": "assigned",
      "title": "Ada assigned you to \"Release notes\"",
      "read": false,
      "actorId": "usr_2",
      "createdAt": "2026-10-02T09:12:00Z"
    }
  ],
  "nextCursor": "ntf_203"
}
```

`nextCursor` is `null` on the last page. Page numbers are not supported; a
`page` parameter is ignored.

## Unread count

`GET /projects/{projectId}/notifications/unread-count` → `200 { "count": number }`

The count covers the whole project, not only the loaded pages.

## Mark one as read

`POST /notifications/{notificationId}/read` → `200` with the updated
Notification.

## Mark all as read

`POST /projects/{projectId}/notifications/read-all` → `204`
