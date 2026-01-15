import { Metadata } from "next"
import { Suspense } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryList } from "@/components/budget/category-list"
import { RuleList } from "@/components/budget/rule-list"
import { BudgetOverview } from "@/components/budget/budget-overview"

export const metadata: Metadata = {
  title: "Budget & Rules | WealthVue",
  description: "Manage your budget categories and automation rules",
}

export default function BudgetPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Budget & Categorization</h2>
        <p className="text-muted-foreground">
          Manage your spending categories and automation rules.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<div>Loading overview...</div>}>
            <BudgetOverview />
          </Suspense>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <CategoryList />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <RuleList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
