"use client";

import { useQuery } from "@tanstack/react-query";

import type {
  QueryData,
  QueryHookInput,
} from "@/server-state/types";
import { mergeQueryOptions } from "@/server-state/utils";

import { postsQueries } from "./options";

export function usePostDetailQuery<
  TData = QueryData<typeof postsQueries.detail>,
>({
  queryOptions,
  ...input
}: QueryHookInput<typeof postsQueries.detail, TData>) {
  return useQuery(
    mergeQueryOptions({
      baseOptions: postsQueries.detail(input),
      queryOptions,
    }),
  );
}
