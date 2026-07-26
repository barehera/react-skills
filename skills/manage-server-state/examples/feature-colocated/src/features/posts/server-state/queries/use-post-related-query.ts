"use client";

import { useQuery } from "@tanstack/react-query";
import type {
  QueryData,
  QueryHookInput,
} from "@/server-state/types";
import { mergeQueryOptions } from "@/server-state/utils";

import { postsQueries } from "./options";

export function usePostRelatedQuery<
  TData = QueryData<typeof postsQueries.related>,
>({
  queryOptions,
  ...input
}: QueryHookInput<typeof postsQueries.related, TData>) {
  return useQuery(
    mergeQueryOptions({
      baseOptions: postsQueries.related(input),
      queryOptions,
    }),
  );
}
