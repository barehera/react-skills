"use client";

import { useQuery } from "@tanstack/react-query";

import type {
  QueryData,
  QueryHookInput,
} from "@/server-state/types";
import { mergeQueryOptions } from "@/server-state/utils";

import { postsQueries } from "./options";

export function usePostsListQuery<
  TData = QueryData<typeof postsQueries.list>,
>({
  queryOptions,
  ...input
}: QueryHookInput<typeof postsQueries.list, TData> = {}) {
  return useQuery(
    mergeQueryOptions({
      baseOptions: postsQueries.list(input),
      queryOptions,
    }),
  );
}
