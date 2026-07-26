"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postsApi } from "../api";
import { postsCache } from "../cache";
import type { PostCreateInput } from "../types";

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PostCreateInput) =>
      (await postsApi.create(input)).data,
    onSuccess: (createdPost) => {
      postsCache.setDetail({ queryClient, post: createdPost });
      return postsCache.invalidateLists({ queryClient });
    },
  });
}
