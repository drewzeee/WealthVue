"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useState, useEffect } from "react"
import { X } from "lucide-react"

interface TransactionFiltersProps {
  accounts: { id: string; name: string }[]
  categories: { id: string; name: string }[]
}

export function TransactionFilters({ accounts, categories }: TransactionFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [accountId, setAccountId] = useState(searchParams.get("accountId") || "")
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") || "")

  // Sync state with URL when URL changes
  useEffect(() => {
    setSearch(searchParams.get("search") || "")
    setAccountId(searchParams.get("accountId") || "")
    setCategoryId(searchParams.get("categoryId") || "")
  }, [searchParams])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== "all") {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      params.set("page", "1")
      return params.toString()
    },
    [searchParams]
  )

  const handleSearch = () => {
     router.push(pathname + "?" + createQueryString("search", search))
  }
  
  const handleAccountChange = (val: string) => {
    setAccountId(val)
    router.push(pathname + "?" + createQueryString("accountId", val))
  }

  const handleCategoryChange = (val: string) => {
    setCategoryId(val)
    router.push(pathname + "?" + createQueryString("categoryId", val))
  }

  const clearFilters = () => {
    setSearch("")
    setAccountId("")
    setCategoryId("")
    router.push(pathname)
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center">
      <Input
        placeholder="Search transactions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        onBlur={handleSearch}
        className="w-full md:w-[300px]"
      />
      <Select value={accountId || "all"} onValueChange={handleAccountChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="All Accounts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Accounts</SelectItem>
          {accounts.map((acc) => (
            <SelectItem key={acc.id} value={acc.id}>
              {acc.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={categoryId || "all"} onValueChange={handleCategoryChange}>
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {(accountId || categoryId || searchParams.get("search")) && (
        <Button variant="ghost" onClick={clearFilters} className="px-2 lg:px-3">
          Reset
          <X className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
