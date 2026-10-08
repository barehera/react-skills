import { createQueryKeys } from "@lukemorales/query-key-factory";

import { postsOperationNames, postsQueryScope } from "../names";
import type {
  NormalizedPostListQueryInput,
  PostDetailQueryInput,
  PostRelatedContextQueryInput,
} from "../types";

export const postsQueryKeys = createQueryKeys(postsQueryScope, {
  [postsOperationNames.list]: ({
    filters,
  }: NormalizedPostListQueryInput) => [{ filters }] as const,
  [postsOperationNames.infiniteList]: ({
    filters,
  }: NormalizedPostListQueryInput) => [{ filters }] as const,
  [postsOperationNames.detail]: ({ postId }: PostDetailQueryInput) => ({
    queryKey: [postId] as const,
    contextQueries: {
      [postsOperationNames.related]: ({
        limit,
      }: PostRelatedContextQueryInput) => [{ limit }] as const,
    },
  }),
});
