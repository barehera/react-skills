export type MemberRole = "owner" | "editor" | "viewer"

export const roleLabel: Record<MemberRole, string> = {
  owner: "Owner",
  editor: "Editor",
  viewer: "Viewer",
}
