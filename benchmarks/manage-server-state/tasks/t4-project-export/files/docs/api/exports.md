# Project exports API

All routes are relative to `/api`. Exports are generated in the background by
a worker; a typical export finishes within 5-60 seconds.

## Export

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | |
| `projectId` | string | |
| `format` | `csv` \| `json` | |
| `status` | `queued` \| `running` \| `succeeded` \| `failed` | `succeeded` and `failed` are final. |
| `progress` | integer 0-100 | |
| `downloadUrl` | string \| null | Set only when `status` is `succeeded`. Signed URL, valid for 15 minutes after it is issued; fetching the export again issues a fresh URL. |
| `error` | `{ "message": string }` \| null | Set only when `status` is `failed`. |
| `createdAt` | string | ISO 8601 timestamp. |

## Start an export

`POST /projects/{projectId}/exports`

```json
{ "format": "csv" }
```

`202` returns the new Export (status `queued`, progress `0`).

`409` when the project already has an export that is `queued` or `running`.

## Get one export

`GET /exports/{exportId}` → `200` Export. Poll this route for progress; the
worker updates it at most once per second.

## Recent exports

`GET /projects/{projectId}/exports?limit={limit}` → `200`

```json
{ "exports": [ /* Export, newest first */ ] }
```

`limit` is 1-20 and defaults to 10.
