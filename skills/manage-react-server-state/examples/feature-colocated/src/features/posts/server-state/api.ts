import { api } from "@/server-state/api";
import { parseApiPayload } from "@/server-state/utils";

import { postsOperationNames } from "./names";
import {
  postDetailResponseSchema,
  postListResponseSchema,
  postRelatedResponseSchema,
} from "./schemas";
import type {
  PostCreateInput,
  PostDeleteInput,
  PostDetailInput,
  PostListInput,
  PostRelatedInput,
  PostUpdateInput,
} from "./types";

const postsRoutes = {
  collection: "/posts",
  detail: (postId: string) =>
    `/posts/${encodeURIComponent(postId)}`,
  related: (postId: string) =>
    `/posts/${encodeURIComponent(postId)}/related`,
} as const;

export const postsApi = {
  async [postsOperationNames.list]({
    filters,
    cursor,
    signal,
  }: PostListInput) {
    const response = await api.get<unknown>(postsRoutes.collection, {
      params: {
        ...filters,
        cursor: cursor ?? undefined,
      },
      signal,
    });

    return parseApiPayload(postListResponseSchema, response.data);
  },

  async [postsOperationNames.detail]({ postId, signal }: PostDetailInput) {
    const response = await api.get<unknown>(postsRoutes.detail(postId), {
      signal,
    });

    return parseApiPayload(postDetailResponseSchema, response.data);
  },

  async [postsOperationNames.related]({
    postId,
    limit,
    signal,
  }: PostRelatedInput) {
    const response = await api.get<unknown>(postsRoutes.related(postId), {
      params: { limit },
      signal,
    });

    return parseApiPayload(postRelatedResponseSchema, response.data);
  },

  async [postsOperationNames.create](input: PostCreateInput) {
    const response = await api.post<unknown>(postsRoutes.collection, input);
    return parseApiPayload(postDetailResponseSchema, response.data);
  },

  async [postsOperationNames.update]({
    postId,
    ...post
  }: PostUpdateInput) {
    const response = await api.patch<unknown>(postsRoutes.detail(postId), {
      post,
    });
    return parseApiPayload(postDetailResponseSchema, response.data);
  },

  async [postsOperationNames.delete]({ postId }: PostDeleteInput) {
    await api.delete(postsRoutes.detail(postId));
  },
} as const;
