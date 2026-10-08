"use client";

import { useInfiniteQuery } from "@tanstack/react-query";

import type {
  InfiniteQueryData,
  InfiniteQueryHookInput,
} from "@/server-state/types";
import { mergeInfiniteQueryOptions } from "@/server-state/utils";

import { postsQueries } from "./options";

export function usePostsInfiniteListQuery<
  TData = InfiniteQueryData<typeof postsQueries.infiniteList>,
>(
  {
    queryOptions,
    ...input
  }: InfiniteQueryHookInput<
    typeof postsQueries.infiniteList,
    TData
  > = {},
) {
  return useInfiniteQuery(
    mergeInfiniteQueryOptions({
      baseOptions: postsQueries.infiniteList(input),
      queryOptions,
    }),
  );
}
