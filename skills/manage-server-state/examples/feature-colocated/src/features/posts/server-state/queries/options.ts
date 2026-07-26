import {
  infiniteQueryOptions,
  queryOptions,
} from "@tanstack/react-query";

import { serverStateDefaults } from "@/server-state/constants";

import { postsApi } from "../api";
import { postsQueryDefaults } from "../constants";
import { postsOperationNames } from "../names";
import type { PostCursor } from "../schemas";
import type {
  PostDetailQueryInput,
  PostListQueryInput,
  PostRelatedQueryInput,
} from "../types";
import {
  normalizePostFilters,
  normalizePostRelatedLimit,
} from "../utils";
import { postsQueryKeys } from "./keys";

export const postsQueries = {
  [postsOperationNames.list]: ({
    filters = {},
  }: PostListQueryInput = {}) => {
    const normalizedFilters = normalizePostFilters({
      filters,
      defaultLimit: postsQueryDefaults.list.limit,
    });

    return queryOptions({
      queryKey: postsQueryKeys.list({ filters: normalizedFilters }).queryKey,
      queryFn: async ({ signal }) => {
        const response = await postsApi.list({
          filters: normalizedFilters,
          signal,
        });
        return response.data;
      },
      staleTime: serverStateDefaults.queryStaleTimeMs,
    });
  },

  [postsOperationNames.infiniteList]: ({
    filters = {},
  }: PostListQueryInput = {}) => {
    const normalizedFilters = normalizePostFilters({
      filters,
      defaultLimit: postsQueryDefaults.infiniteList.limit,
    });

    return infiniteQueryOptions({
      queryKey: postsQueryKeys.infiniteList({
        filters: normalizedFilters,
      }).queryKey,
      queryFn: ({ pageParam, signal }) =>
        postsApi.list({
          filters: normalizedFilters,
          cursor: pageParam,
          signal,
        }),
      initialPageParam: null as PostCursor,
      getNextPageParam: (lastPage) =>
        lastPage.meta.nextCursor ?? undefined,
      staleTime: serverStateDefaults.queryStaleTimeMs,
    });
  },

  [postsOperationNames.detail]: ({ postId }: PostDetailQueryInput) =>
    queryOptions({
      queryKey: postsQueryKeys.detail({ postId }).queryKey,
      queryFn: async ({ signal }) => {
        const response = await postsApi.detail({ postId, signal });
        return response.data;
      },
      staleTime: serverStateDefaults.queryStaleTimeMs,
    }),

  [postsOperationNames.related]: ({
    postId,
    limit,
  }: PostRelatedQueryInput) => {
    const normalizedLimit = normalizePostRelatedLimit({ limit });

    return queryOptions({
      queryKey: postsQueryKeys
        .detail({ postId })
        ._ctx.related({ limit: normalizedLimit }).queryKey,
      queryFn: async ({ signal }) => {
        const response = await postsApi.related({
          postId,
          limit: normalizedLimit,
          signal,
        });
        return response.data;
      },
      staleTime: serverStateDefaults.queryStaleTimeMs,
    });
  },
} as const;
