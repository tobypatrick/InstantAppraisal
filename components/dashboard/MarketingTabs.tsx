'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { MarketingKit } from '@/components/dashboard/MarketingKit'
import { MarketingAnalytics } from '@/components/dashboard/MarketingAnalytics'

export function MarketingTabs({ agentSlug }: { agentSlug: string }) {
  return (
    <Tabs defaultValue="links" className="w-full">
      <TabsList>
        <TabsTrigger value="links">Campaign Links</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="links" className="pt-4">
        <MarketingKit agentSlug={agentSlug} />
      </TabsContent>
      <TabsContent value="analytics" className="pt-4">
        <MarketingAnalytics />
      </TabsContent>
    </Tabs>
  )
}
