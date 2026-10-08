import { z } from "zod";

import type {
  ApiCursorPageResponseSchemaInput,
  ApiDataResponseSchemaInput,
} from "./types";

export const apiErrorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    reason: z.string().optional(),
    details: z.unknown().optional(),
  }),
});

export function createApiDataResponseSchema<TSchema extends z.ZodType>(
  { dataSchema }: ApiDataResponseSchemaInput<TSchema>,
) {
  return z.object({ data: dataSchema });
}

export function createApiCursorPageResponseSchema<
  TItemSchema extends z.ZodType,
  TCursorSchema extends z.ZodType,
>({
  itemSchema,
  cursorSchema,
}: ApiCursorPageResponseSchemaInput<TItemSchema, TCursorSchema>) {
  return z.object({
    data: z.array(itemSchema),
    meta: z.object({
      nextCursor: cursorSchema,
    }),
  });
}
