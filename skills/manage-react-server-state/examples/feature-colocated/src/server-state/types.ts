import type {
  UseInfiniteQueryOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import type { z } from "zod";

export interface ApiRequestErrorOptions {
  message: string;
  code: string;
  status?: number;
  reason?: string;
  details?: unknown;
  cause?: unknown;
}

export interface ApiErrorResponseInput {
  status: number;
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiDataResponseSchemaInput<
  TSchema extends z.ZodType,
> {
  dataSchema: TSchema;
}

export interface ApiPageResponseSchemaInput<
  TItemSchema extends z.ZodType,
  TPageParamSchema extends z.ZodType,
> {
  itemSchema: TItemSchema;
  pageParamSchema: TPageParamSchema;
}

type QueryOptionsParts<TOptions> =
  TOptions extends UseQueryOptions<
    infer TQueryFnData,
    infer TError,
    infer TData,
    infer TQueryKey
  >
    ? {
        queryFnData: TQueryFnData;
        error: TError;
        data: TData;
        queryKey: TQueryKey;
      }
    : never;

type InfiniteQueryOptionsParts<TOptions> =
  TOptions extends UseInfiniteQueryOptions<
    infer TQueryFnData,
    infer TError,
    infer TData,
    infer TQueryKey,
    infer TPageParam
  >
    ? {
        queryFnData: TQueryFnData;
        error: TError;
        data: TData;
        queryKey: TQueryKey;
        pageParam: TPageParam;
      }
    : never;

export type QueryOptionsData<TOptions> =
  QueryOptionsParts<TOptions>["data"];

export type InfiniteQueryOptionsData<TOptions> =
  InfiniteQueryOptionsParts<TOptions>["data"];

type QueryFactoryOptions<TFactory> =
  TFactory extends (...args: never[]) => infer TOptions
    ? TOptions
    : never;

type QueryFactoryInput<TFactory> =
  TFactory extends (input: infer TInput) => unknown
    ? NonNullable<TInput>
    : never;

export type QueryData<TFactory> =
  QueryOptionsData<QueryFactoryOptions<TFactory>>;

export type InfiniteQueryData<TFactory> =
  InfiniteQueryOptionsData<QueryFactoryOptions<TFactory>>;

type QueryHookOptionName =
  | "enabled"
  | "select"
  | "placeholderData"
  | "refetchInterval"
  | "refetchIntervalInBackground"
  | "refetchOnMount"
  | "refetchOnReconnect"
  | "refetchOnWindowFocus"
  | "notifyOnChangeProps"
  | "subscribed"
  | "throwOnError";

export type QueryOptionsOverride<
  TOptions,
  TData = QueryOptionsData<TOptions>,
> = Pick<
  UseQueryOptions<
    QueryOptionsParts<TOptions>["queryFnData"],
    QueryOptionsParts<TOptions>["error"],
    TData,
    QueryOptionsParts<TOptions>["queryKey"]
  >,
  QueryHookOptionName
>;

export type InfiniteQueryOptionsOverride<
  TOptions,
  TData = InfiniteQueryOptionsData<TOptions>,
> = Pick<
  UseInfiniteQueryOptions<
    InfiniteQueryOptionsParts<TOptions>["queryFnData"],
    InfiniteQueryOptionsParts<TOptions>["error"],
    TData,
    InfiniteQueryOptionsParts<TOptions>["queryKey"],
    InfiniteQueryOptionsParts<TOptions>["pageParam"]
  >,
  QueryHookOptionName
>;

export type QueryOptionsWithData<TOptions, TData> =
  UseQueryOptions<
    QueryOptionsParts<TOptions>["queryFnData"],
    QueryOptionsParts<TOptions>["error"],
    TData,
    QueryOptionsParts<TOptions>["queryKey"]
  >;

export type InfiniteQueryOptionsWithData<TOptions, TData> =
  UseInfiniteQueryOptions<
    InfiniteQueryOptionsParts<TOptions>["queryFnData"],
    InfiniteQueryOptionsParts<TOptions>["error"],
    TData,
    InfiniteQueryOptionsParts<TOptions>["queryKey"],
    InfiniteQueryOptionsParts<TOptions>["pageParam"]
  >;

export interface QueryOptionsSource {
  queryKey: readonly unknown[];
}

export interface InfiniteQueryOptionsSource extends QueryOptionsSource {
  initialPageParam: unknown;
  getNextPageParam: unknown;
}

export interface MergeQueryOptionsInput<
  TOptions extends QueryOptionsSource,
  TData,
> {
  baseOptions: TOptions;
  queryOptions?: QueryOptionsOverride<TOptions, TData>;
}

export interface MergeInfiniteQueryOptionsInput<
  TOptions extends InfiniteQueryOptionsSource,
  TData,
> {
  baseOptions: TOptions;
  queryOptions?: InfiniteQueryOptionsOverride<TOptions, TData>;
}

export type QueryHookInput<
  TFactory,
  TData = QueryData<TFactory>,
> = QueryFactoryInput<TFactory> & {
  queryOptions?: QueryOptionsOverride<
    QueryFactoryOptions<TFactory>,
    TData
  >;
};

export type InfiniteQueryHookInput<
  TFactory,
  TData = InfiniteQueryData<TFactory>,
> = QueryFactoryInput<TFactory> & {
  queryOptions?: InfiniteQueryOptionsOverride<
    QueryFactoryOptions<TFactory>,
    TData
  >;
};
