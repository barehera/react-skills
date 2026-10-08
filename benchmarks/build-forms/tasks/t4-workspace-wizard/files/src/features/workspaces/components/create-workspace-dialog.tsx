import { Button } from "@/components/ui/button"

import type { Workspace } from "../server-state/use-create-workspace-mutation"

type CreateWorkspaceDialogProps = {
  onCreated: (workspace: Workspace) => void
}

export function CreateWorkspaceDialog({ onCreated }: CreateWorkspaceDialogProps) {
  // TODO: open the create workspace wizard; call onCreated after it saves
  void onCreated

  return <Button type="button">Create workspace</Button>
}
