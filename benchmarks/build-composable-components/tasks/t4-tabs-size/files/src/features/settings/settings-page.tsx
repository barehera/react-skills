import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <Tabs defaultValue="profile">
        <TabsList className="h-11 w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="profile"
            className="h-10 flex-none rounded-none border-0 border-b-2 border-transparent px-4 text-base data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="h-10 flex-none rounded-none border-0 border-b-2 border-transparent px-4 text-base data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="h-10 flex-none rounded-none border-0 border-b-2 border-transparent px-4 text-base data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
          >
            Billing
          </TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="pt-4">
          Profile settings
        </TabsContent>
        <TabsContent value="notifications" className="pt-4">
          Notification settings
        </TabsContent>
        <TabsContent value="billing" className="pt-4">
          Billing settings
        </TabsContent>
      </Tabs>
    </div>
  )
}
