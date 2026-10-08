import { z } from "zod";

import {
  createApiCursorPageResponseSchema,
  createApiDataResponseSchema,
} from "@/server-state/schemas";

export const postSchema = z.object({
  id: z.string().min(1),
  title: z.string(),
  body: z.string(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});

export const postCursorSchema = z.number().int().nonnegative().nullable();

export const postDetailResponseSchema =
  createApiDataResponseSchema({ dataSchema: postSchema });

export const postRelatedResponseSchema = createApiDataResponseSchema({
  dataSchema: z.array(postSchema),
});

export const postListResponseSchema = createApiCursorPageResponseSchema({
  itemSchema: postSchema,
  cursorSchema: postCursorSchema,
});

export const postCreateRequestSchema = z.object({
  title: z.string().trim().min(1),
  body: z.string().trim().min(1),
});

export const postUpdateRequestSchema = postCreateRequestSchema.partial();

export type Post = z.infer<typeof postSchema>;
export type PostCursor = z.infer<typeof postCursorSchema>;
export type PostCreateRequest = z.input<typeof postCreateRequestSchema>;
export type PostUpdateRequest = z.input<typeof postUpdateRequestSchema>;
