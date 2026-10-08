import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ProjectTabs({ projectId }: { projectId: string }) {
  return (
    <Tabs defaultValue="board">
      <TabsList>
        <TabsTrigger value="board">Board</TabsTrigger>
        <TabsTrigger value="list">List</TabsTrigger>
        <TabsTrigger value="timeline" disabled>
          Timeline
        </TabsTrigger>
      </TabsList>
      <TabsContent value="board">Board for {projectId}</TabsContent>
      <TabsContent value="list">List for {projectId}</TabsContent>
    </Tabs>
  )
}
