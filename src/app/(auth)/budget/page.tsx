import { Metadata } from "next"
import { Suspense } from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CategoryList } from "@/components/budget/category-list"
import { RuleList } from "@/components/budget/rule-list"
import { BudgetOverview } from "@/components/budget/budget-overview"
import { TransactionsView } from "@/components/transactions/transactions-view"

export const metadata: Metadata = {
  title: "Budget & Transactions | WealthVue",
  description: "Manage your budget categories, transactions, and automation rules",
}

interface BudgetPageProps {
  searchParams: {
    tab?: string
    page?: string
    from?: string
    to?: string
    accountId?: string
    categoryId?: string
    search?: string
    type?: 'income' | 'expense' | 'all'
    amountMin?: string
    amountMax?: string
    merchant?: string
    isTransfer?: string
    uncategorized?: string
  }
}

export default function BudgetPage({ searchParams }: BudgetPageProps) {
  const defaultTab = searchParams.tab || "overview"

  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Budget & Transactions</h2>
        <p className="text-muted-foreground">
          Manage your spending categories, transactions, and automation rules.
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="rules">Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<div>Loading overview...</div>}>
            <BudgetOverview />
          </Suspense>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Suspense fallback={<div>Loading transactions...</div>}>
            <TransactionsView searchParams={searchParams} />
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
