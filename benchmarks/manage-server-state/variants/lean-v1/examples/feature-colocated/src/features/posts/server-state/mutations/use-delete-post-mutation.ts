"use client";

import { useMutation } from "@tanstack/react-query";

import { postsApi } from "../api";
import { usePostsCache } from "../cache/use-cache";

export function useDeletePostMutation() {
  const postsCache = usePostsCache();

  return useMutation({
    mutationFn: postsApi.delete,
    onSuccess: (_, { postId }) => {
      postsCache.removeDetail({ postId });
      return postsCache.invalidateLists();
    },
  });
}
