import type * as z from "zod"

export function parseApiPayload<TSchema extends z.ZodType>(
  schema: TSchema,
  payload: unknown
): z.output<TSchema> {
  const result = schema.safeParse(payload)

  if (result.success) {
    return result.data
  }

  console.warn(
    "API payload did not match the expected schema.",
    result.error.issues
  )

  return payload as z.output<TSchema>
}
