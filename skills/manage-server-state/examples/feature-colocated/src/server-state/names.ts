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
