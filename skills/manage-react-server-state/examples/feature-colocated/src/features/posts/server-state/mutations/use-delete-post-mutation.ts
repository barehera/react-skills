"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { postsApi } from "../api";
import { postsCache } from "../cache";

export function useDeletePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postsApi.delete,
    onSuccess: (_, { postId }) => {
      postsCache.removeDetailTree({ queryClient, postId });
      return postsCache.invalidateLists({ queryClient });
    },
  });
}
