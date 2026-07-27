import axios from "axios";
import type { z } from "zod";

import { apiErrorResponseSchema } from "./schemas";
import type {
  InfiniteQueryOptionsSource,
  InfiniteQueryOptionsWithData,
  MergeInfiniteQueryOptionsInput,
  MergeQueryOptionsInput,
  QueryOptionsWithData,
  QueryOptionsSource,
} from "./types";

interface ApiRequestErrorOptions {
  message: string;
  code: string;
  status?: number;
  reason?: string;
  details?: unknown;
  cause?: unknown;
}

export class ApiRequestError extends Error {
  readonly status?: number;
  readonly code: string;
  readonly reason?: string;
  readonly details?: unknown;

  constructor({
    message,
    code,
    status,
    reason,
    details,
    cause,
  }: ApiRequestErrorOptions) {
    super(message, { cause });
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
    this.reason = reason;
    this.details = details;
  }
}

export function normalizeApiError(error: unknown): ApiRequestError {
  if (error instanceof ApiRequestError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const result = apiErrorResponseSchema.safeParse(error.response?.data);
    const payload = result.success ? result.data.error : undefined;

    return new ApiRequestError({
      message: payload?.message ?? error.message ?? "Request failed",
      code: payload?.code ?? "request_failed",
      status: error.response?.status,
      reason: payload?.reason,
      details: payload?.details,
      cause: error,
    });
  }

  return new ApiRequestError({
    message: error instanceof Error ? error.message : "Unknown request error",
    code: "unknown_error",
    cause: error,
  });
}

/**
 * Returns only schema-validated data. Invalid responses reject the request
 * instead of being cast to the expected output type.
 */
export function parseApiPayload<TOutput>(
  schema: z.ZodType<TOutput>,
  value: unknown,
): TOutput {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new ApiRequestError({
      message: "Server response did not match the expected schema",
      code: "invalid_response",
      details: result.error.issues,
      cause: result.error,
    });
  }

  return result.data;
}

export function mergeQueryOptions<
  TOptions extends QueryOptionsSource,
  TData,
>({
  baseOptions,
  queryOptions,
}: MergeQueryOptionsInput<TOptions, TData>) {
  return {
    ...baseOptions,
    ...queryOptions,
  } as QueryOptionsWithData<TOptions, TData>;
}

export function mergeInfiniteQueryOptions<
  TOptions extends InfiniteQueryOptionsSource,
  TData,
>({
  baseOptions,
  queryOptions,
}: MergeInfiniteQueryOptionsInput<TOptions, TData>) {
  return {
    ...baseOptions,
    ...queryOptions,
  } as InfiniteQueryOptionsWithData<TOptions, TData>;
}
