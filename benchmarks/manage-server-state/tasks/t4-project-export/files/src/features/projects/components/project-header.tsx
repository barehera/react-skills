export function ProjectHeader({
  projectId,
  name,
}: {
  projectId: string
  name: string
}) {
  return (
    <header className="flex flex-col gap-4 border-b pb-4">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 text-2xl font-semibold">{name}</h1>
        {/* TODO: export (project {projectId}) */}
      </div>
    </header>
  )
}
