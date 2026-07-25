import { z } from "zod";

import type {
  ApiDataResponseSchemaInput,
  ApiPageResponseSchemaInput,
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

export function createApiPageResponseSchema<
  TItemSchema extends z.ZodType,
  TPageParamSchema extends z.ZodType,
>({
  itemSchema,
  pageParamSchema,
}: ApiPageResponseSchemaInput<TItemSchema, TPageParamSchema>) {
  return z.object({
    data: z.array(itemSchema),
    meta: z.object({
      nextCursor: pageParamSchema,
    }),
  });
}
