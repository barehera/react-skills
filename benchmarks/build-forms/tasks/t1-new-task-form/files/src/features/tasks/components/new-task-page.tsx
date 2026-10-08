import type { Task } from "../types"

type NewTaskPageProps = {
  projectId: string
  onCreated: (task: Task) => void
}

export function NewTaskPage({ projectId, onCreated }: NewTaskPageProps) {
  // TODO: build the new task form, then call onCreated with the saved task
  void onCreated

  return (
    <p className="text-sm text-muted-foreground">
      New task form for project {projectId} goes here.
    </p>
  )
}
