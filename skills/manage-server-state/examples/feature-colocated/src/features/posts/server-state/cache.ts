import { postsQueryKeys } from "./queries/keys";
import { postsQueries } from "./queries/options";
import type {
  PostCacheDetailInput,
  PostCachePatchDetailInput,
  PostCacheSetDetailInput,
  PostsCacheInput,
} from "./types";

export const postsCache = {
  invalidateLists({ queryClient }: PostsCacheInput) {
    return Promise.all([
      queryClient.invalidateQueries({
        queryKey: postsQueryKeys.list._def,
      }),
      queryClient.invalidateQueries({
        queryKey: postsQueryKeys.infiniteList._def,
      }),
    ]);
  },

  setDetail({
    queryClient,
    post,
  }: PostCacheSetDetailInput) {
    queryClient.setQueryData(
      postsQueries.detail({ postId: post.id }).queryKey,
      post,
    );
  },

  patchDetail({
    queryClient,
    postId,
    patch,
  }: PostCachePatchDetailInput) {
    queryClient.setQueryData(
      postsQueries.detail({ postId }).queryKey,
      (current) => (current ? { ...current, ...patch } : current),
    );
  },

  removeDetail({
    queryClient,
    postId,
  }: PostCacheDetailInput) {
    queryClient.removeQueries({
      queryKey: postsQueries.detail({ postId }).queryKey,
      exact: false,
    });
  },
} as const;
