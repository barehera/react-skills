"use client";

import {
  skipToken,
  useInfiniteQuery,
  useQuery,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
} from "@tanstack/react-query";

export interface AuthenticationState {
  isAuthenticated: boolean;
}

export interface CreateAuthenticatedQueryHooksInput {
  useAuthentication: () => AuthenticationState;
}

export function createAuthenticatedQueryHooks({
  useAuthentication,
}: CreateAuthenticatedQueryHooksInput) {
  function useAuthenticatedQuery<
    TQueryFnData,
    TError,
    TData,
    TQueryKey extends QueryKey,
  >(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
    const { isAuthenticated } = useAuthentication();

    return useQuery({
      ...options,
      enabled: isAuthenticated && (options.enabled ?? true),
      queryFn: isAuthenticated ? options.queryFn : skipToken,
    });
  }

  function useAuthenticatedInfiniteQuery<
    TQueryFnData,
    TError,
    TData,
    TQueryKey extends QueryKey,
    TPageParam,
  >(
    options: UseInfiniteQueryOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryKey,
      TPageParam
    >,
  ) {
    const { isAuthenticated } = useAuthentication();

    return useInfiniteQuery({
      ...options,
      enabled: isAuthenticated && (options.enabled ?? true),
      queryFn: isAuthenticated ? options.queryFn : skipToken,
    });
  }

  return {
    useAuthenticatedQuery,
    useAuthenticatedInfiniteQuery,
  } as const;
}
