import type { QueryClient } from "@tanstack/react-query";

import { postsQueryKeys } from "../queries/keys";
import { postsQueries } from "../queries/options";
import type {
  PostCacheDetailInput,
  PostCachePatchDetailInput,
  PostCacheSetDetailInput,
} from "../types";

export function createPostsCache(queryClient: QueryClient) {
  function invalidateLists() {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: postsQueryKeys.list._def,
      }),
      queryClient.invalidateQueries({
        queryKey: postsQueryKeys.infiniteList._def,
      }),
    ]);
  }

  function setDetail({ post }: PostCacheSetDetailInput) {
    queryClient.setQueryData(
      postsQueries.detail({ postId: post.id }).queryKey,
      post,
    );
  }

  function patchDetail({ postId, patch }: PostCachePatchDetailInput) {
    queryClient.setQueryData(
      postsQueries.detail({ postId }).queryKey,
      (current) => (current ? { ...current, ...patch } : current),
    );
  }

  function removeDetail({ postId }: PostCacheDetailInput) {
    queryClient.removeQueries({
      queryKey: postsQueries.detail({ postId }).queryKey,
      exact: false,
    });
  }

  return {
    invalidateLists,
    setDetail,
    patchDetail,
    removeDetail,
  } as const;
}
