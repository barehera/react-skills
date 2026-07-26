import {
  postsQueryConstraints,
  postsQueryDefaults,
} from "./constants";
import type {
  NormalizedPostFilters,
  NormalizePostFiltersInput,
  NormalizePostRelatedLimitInput,
} from "./types";

export function normalizePostFilters({
  filters = {},
  defaultLimit = postsQueryDefaults.infiniteList.limit,
}: NormalizePostFiltersInput = {}): NormalizedPostFilters {
  const search = filters.search?.trim();
  const requestedLimit = Math.trunc(filters.limit ?? defaultLimit);

  return {
    search: search || undefined,
    limit: Math.min(
      Math.max(requestedLimit, postsQueryConstraints.minimumLimit),
      postsQueryConstraints.maximumListLimit,
    ),
  };
}

export function normalizePostRelatedLimit({
  limit = postsQueryDefaults.related.limit,
}: NormalizePostRelatedLimitInput = {}) {
  return Math.min(
    Math.max(Math.trunc(limit), postsQueryConstraints.minimumLimit),
    postsQueryConstraints.maximumRelatedLimit,
  );
}
