import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type ProjectSettingsPageProps = {
  projectId: string
  projectName: string
}

export function ProjectSettingsPage({
  projectId,
  projectName,
}: ProjectSettingsPageProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Project settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
          <CardDescription>{projectName}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Project ID: {projectId}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>People</CardTitle>
          <CardDescription>Who can work on {projectName}.</CardDescription>
        </CardHeader>
        <CardContent />
      </Card>
    </div>
  )
}
