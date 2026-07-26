import type { Post } from "./schemas";
import { postsQueryKeys } from "./queries/keys";
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
    queryClient.setQueryData<Post>(
      postsQueryKeys.detail({ postId: post.id }).queryKey,
      post,
    );
  },

  patchDetail({
    queryClient,
    postId,
    patch,
  }: PostCachePatchDetailInput) {
    queryClient.setQueryData<Post>(
      postsQueryKeys.detail({ postId }).queryKey,
      (current) => (current ? { ...current, ...patch } : current),
    );
  },

  removeDetailTree({
    queryClient,
    postId,
  }: PostCacheDetailInput) {
    queryClient.removeQueries({
      queryKey: postsQueryKeys.detail({ postId }).queryKey,
      exact: false,
    });
  },
} as const;
