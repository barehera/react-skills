import { postsOperationNames } from "./names";

export const postsQueryDefaults = {
  [postsOperationNames.list]: {
    limit: 50,
  },
  [postsOperationNames.infiniteList]: {
    limit: 20,
  },
  [postsOperationNames.related]: {
    limit: 5,
  },
} as const;

export const postsQueryConstraints = {
  minimumLimit: 1,
  maximumListLimit: 100,
  maximumRelatedLimit: 20,
} as const;
