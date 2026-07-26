"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postsApi } from "../api";
import { postsCache } from "../cache";
import type { PostUpdateInput } from "../types";

export function useUpdatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PostUpdateInput) =>
      (await postsApi.update(input)).data,
    onSuccess: (updatedPost) => {
      postsCache.setDetail({ queryClient, post: updatedPost });
      return postsCache.invalidateLists({ queryClient });
    },
  });
}
