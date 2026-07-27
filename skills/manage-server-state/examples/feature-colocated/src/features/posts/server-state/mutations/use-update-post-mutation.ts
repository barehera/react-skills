"use client";

import { useMutation } from "@tanstack/react-query";

import { postsApi } from "../api";
import { usePostsCache } from "../cache/use-cache";
import type { PostUpdateInput } from "../types";

export function useUpdatePostMutation() {
  const postsCache = usePostsCache();

  return useMutation({
    mutationFn: async (input: PostUpdateInput) =>
      (await postsApi.update(input)).data,
    onSuccess: (updatedPost) => {
      postsCache.setDetail({ post: updatedPost });
      return postsCache.invalidateLists();
    },
  });
}
