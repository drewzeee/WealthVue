import { Metadata } from "next"
import { Header } from "@/components/shared"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryList } from "@/components/budget/category-list"
import { RuleList } from "@/components/budget/rule-list"

export const metadata: Metadata = {
  title: "Budget & Rules | WealthVue",
  description: "Manage your budget categories and automation rules",
}

export default function BudgetPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <Header
        title="Budget & Categorization"
        description="Manage your spending categories and automation rules."
      />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="rounded-lg border p-8 text-center text-muted-foreground">
            Budget Overview Dashboard (Coming Soon)
          </div>
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
