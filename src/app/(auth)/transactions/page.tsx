import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { transactionRepository } from "@/lib/db/repositories/transactions"
import { TransactionsTableShell } from "@/components/transactions/transactions-table-shell"
import { TransactionFilters } from "@/components/transactions/transaction-filters"
import { ImportCSVDialog } from "@/components/transactions/import-csv-dialog"
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog"

export const metadata: Metadata = {
  title: "Transactions",
  description: "View and manage your transactions",
}

interface TransactionsPageProps {
  searchParams: {
    page?: string
    from?: string
    to?: string
    accountId?: string
    categoryId?: string
    search?: string
  }
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect("/login")
  }

  const page = Number(searchParams.page) || 1
  const limit = 50
  const offset = (page - 1) * limit

  // Fetch data in parallel
  const [
    { transactions, total },
    accounts,
    categories
  ] = await Promise.all([
    transactionRepository.findMany({
      userId: session.user.id,
      startDate: searchParams.from ? new Date(searchParams.from) : undefined,
      endDate: searchParams.to ? new Date(searchParams.to) : undefined,
      accountId: searchParams.accountId,
      categoryId: searchParams.categoryId,
      search: searchParams.search,
      limit,
      offset,
    }),
    prisma.account.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: { userId: session.user.id },
      select: { id: true, name: true, color: true },
      orderBy: { name: "asc" },
    }),
  ])

  const pageCount = Math.ceil(total / limit)

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            View and manage your financial transactions.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <ImportCSVDialog accounts={accounts} />
          <AddTransactionDialog accounts={accounts} categories={categories} />
        </div>
      </div>
      
      <div className="space-y-4">
        <TransactionFilters accounts={accounts} categories={categories} />
        <TransactionsTableShell 
          data={transactions} 
          pageCount={pageCount} 
          categories={categories}
        />
      </div>
    </div>
  )
}
