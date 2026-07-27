"use client";

import { useMutation } from "@tanstack/react-query";

import { postsApi } from "../api";
import { usePostsCache } from "../cache/use-cache";
import type { PostCreateInput } from "../types";

export function useCreatePostMutation() {
  const postsCache = usePostsCache();

  return useMutation({
    mutationFn: async (input: PostCreateInput) =>
      (await postsApi.create(input)).data,
    onSuccess: (createdPost) => {
      postsCache.setDetail({ post: createdPost });
      return postsCache.invalidateLists();
    },
  });
}
