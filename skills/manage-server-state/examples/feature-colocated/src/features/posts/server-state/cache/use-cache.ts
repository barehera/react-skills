"use client";

import { useQueryClient } from "@tanstack/react-query";

import { createPostsCache } from ".";

export function usePostsCache() {
  const queryClient = useQueryClient();

  return createPostsCache(queryClient);
}
