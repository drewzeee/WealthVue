"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { DataTable } from "./data-table"
import { columns, TransactionWithRelations } from "./columns"
import { useCallback } from "react"

interface TransactionsTableShellProps {
  data: TransactionWithRelations[]
  pageCount: number
}

export function TransactionsTableShell({ data, pageCount }: TransactionsTableShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const page = Number(searchParams.get("page")) || 1

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const onPageChange = (newPage: number) => {
    router.push(pathname + "?" + createQueryString("page", String(newPage)))
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      pageCount={pageCount}
      pageIndex={page}
      onPageChange={onPageChange}
    />
  )
}
