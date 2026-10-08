import { resourceOperationNames } from "@/server-state/names";

export const postsQueryScope = "posts";

export const postsOperationNames = {
  ...resourceOperationNames,
  related: "related",
} as const;
