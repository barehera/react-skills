import type { QueryClient } from "@tanstack/react-query";

import type {
  Post,
  PostCreateRequest,
  PostCursor,
  PostUpdateRequest,
} from "./schemas";

export interface PostFilters {
  search?: string;
  limit?: number;
}

export interface NormalizedPostFilters {
  search?: string;
  limit: number;
}

export interface NormalizePostFiltersInput {
  filters?: PostFilters;
  defaultLimit?: number;
}

export interface NormalizePostRelatedLimitInput {
  limit?: number;
}

export interface PostListQueryInput {
  filters?: PostFilters;
}

export interface NormalizedPostListQueryInput {
  filters: NormalizedPostFilters;
}

export interface PostDetailQueryInput {
  postId: string;
}

export interface PostRelatedQueryInput extends PostDetailQueryInput {
  limit?: number;
}

export interface PostRelatedContextQueryInput {
  limit: number;
}

export interface PostsCacheInput {
  queryClient: QueryClient;
}

export interface PostCacheDetailInput extends PostsCacheInput {
  postId: string;
}

export interface PostCacheSetDetailInput extends PostsCacheInput {
  post: Post;
}

export interface PostCachePatchDetailInput extends PostCacheDetailInput {
  patch: Partial<Omit<Post, "id">>;
}

export type PostCreateInput = PostCreateRequest;

export interface PostUpdateInput extends PostUpdateRequest {
  postId: string;
}

export interface PostListInput extends PostListQueryInput {
  pageParam?: PostCursor;
  signal?: AbortSignal;
}

export interface PostDetailInput extends PostDetailQueryInput {
  signal?: AbortSignal;
}

export interface PostRelatedInput extends PostRelatedQueryInput {
  signal?: AbortSignal;
}

export interface PostDeleteInput {
  postId: string;
}
