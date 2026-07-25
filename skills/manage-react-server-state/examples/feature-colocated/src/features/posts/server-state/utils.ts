import type { QueryKey } from "@tanstack/react-query";

import {
  postsQueryConstraints,
  postsQueryDefaults,
} from "./constants";
import { postsOperationNames, postsQueryScope } from "./names";
import type {
  NormalizedPostFilters,
  NormalizePostFiltersInput,
  NormalizePostRelatedLimitInput,
} from "./types";

function normalizeLimit({
  value,
  fallback,
  maximum,
}: {
  value: number | undefined;
  fallback: number;
  maximum: number;
}) {
  const finiteValue =
    typeof value === "number" && Number.isFinite(value)
      ? value
      : fallback;
  const integerValue = Math.trunc(finiteValue);

  return Math.min(
    Math.max(integerValue, postsQueryConstraints.minimumLimit),
    maximum,
  );
}

export function normalizePostFilters({
  filters = {},
  defaultLimit,
}: NormalizePostFiltersInput): NormalizedPostFilters {
  const search = filters.search?.trim();

  return {
    search: search || undefined,
    limit: normalizeLimit({
      value: filters.limit,
      fallback: defaultLimit,
      maximum: postsQueryConstraints.maximumListLimit,
    }),
  };
}

export function normalizePostRelatedLimit({
  limit,
}: NormalizePostRelatedLimitInput = {}) {
  return normalizeLimit({
    value: limit,
    fallback: postsQueryDefaults.related.limit,
    maximum: postsQueryConstraints.maximumRelatedLimit,
  });
}

export function isPostsRelatedQueryKey(queryKey: QueryKey) {
  const [scope, operation, postId, contextOperation] = queryKey;

  return (
    scope === postsQueryScope &&
    operation === postsOperationNames.detail &&
    typeof postId === "string" &&
    contextOperation === postsOperationNames.related
  );
}
