export const fileKeys = {
  root: ["file"] as const,
  list: () => [...fileKeys.root, "list"] as const,
  activate: () => [...fileKeys.root, "activate"] as const,
  delete: () => [...fileKeys.root, "delete"] as const,
  updateName: () => [...fileKeys.root, "updateName"] as const,
}
