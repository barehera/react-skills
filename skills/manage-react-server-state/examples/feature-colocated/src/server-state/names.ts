export const resourceQueryNames = {
  list: "list",
  infiniteList: "infiniteList",
  detail: "detail",
} as const;

export const resourceMutationNames = {
  create: "create",
  update: "update",
  delete: "delete",
} as const;

export const resourceOperationNames = {
  ...resourceQueryNames,
  ...resourceMutationNames,
} as const;

export type ResourceQueryName =
  (typeof resourceQueryNames)[keyof typeof resourceQueryNames];
export type ResourceMutationName =
  (typeof resourceMutationNames)[keyof typeof resourceMutationNames];
export type ResourceOperationName =
  (typeof resourceOperationNames)[keyof typeof resourceOperationNames];
