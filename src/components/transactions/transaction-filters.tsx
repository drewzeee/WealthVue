"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useCallback, useState, useEffect } from "react"
import { X, Search } from "lucide-react"
import { FilterPopover } from "./filter-popover"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

interface TransactionFiltersProps {
  accounts: { id: string; name: string }[]
  categories: { id: string; name: string }[]
}

export function TransactionFilters({ accounts, categories }: TransactionFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get("search") || "")

  // Sync state with URL when URL changes
  useEffect(() => {
    setSearch(searchParams.get("search") || "")
  }, [searchParams])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
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

  const clearFilters = () => {
    setSearch("")
    router.push(pathname)
  }

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    params.set("page", "1")
    router.push(pathname + "?" + params.toString())
  }

  const getActiveFilters = () => {
    const active: { key: string; label: string; value: string }[] = []

    if (searchParams.get("accountId")) {
      const ids = searchParams.get("accountId")!.split(",")
      active.push({ key: "accountId", label: "Account", value: `${ids.length} selected` })
    }
    if (searchParams.get("categoryId")) {
      const ids = searchParams.get("categoryId")!.split(",")
      active.push({ key: "categoryId", label: "Category", value: `${ids.length} selected` })
    }
    if (searchParams.get("from")) {
      active.push({ key: "from", label: "From", value: format(new Date(searchParams.get("from")!), "MMM d, yyyy") })
    }
    if (searchParams.get("to")) {
      active.push({ key: "to", label: "To", value: format(new Date(searchParams.get("to")!), "MMM d, yyyy") })
    }
    if (searchParams.get("type")) {
      active.push({ key: "type", label: "Type", value: searchParams.get("type")!.charAt(0).toUpperCase() + searchParams.get("type")!.slice(1) })
    }
    if (searchParams.get("amountMin")) {
      active.push({ key: "amountMin", label: "Min", value: `$${searchParams.get("amountMin")}` })
    }
    if (searchParams.get("amountMax")) {
      active.push({ key: "amountMax", label: "Max", value: `$${searchParams.get("amountMax")}` })
    }
    if (searchParams.get("merchant")) {
      active.push({ key: "merchant", label: "Merchant", value: searchParams.get("merchant")! })
    }
    if (searchParams.get("uncategorized") === "true") {
      active.push({ key: "uncategorized", label: "Uncategorized", value: "Only" })
    }

    return active
  }

  const activeFilters = getActiveFilters()

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            onBlur={handleSearch}
            className="pl-9 bg-background/50 backdrop-blur-sm"
          />
        </div>

        <FilterPopover accounts={accounts} categories={categories} />

        {(searchParams.toString() && searchParams.toString() !== "page=1") && (
          <Button variant="ghost" onClick={clearFilters} className="px-2 lg:px-3 text-muted-foreground hover:text-foreground">
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant="secondary"
              className="px-2 py-1 flex items-center gap-1 bg-muted/50 border-transparent text-xs font-normal"
            >
              <span className="text-muted-foreground">{filter.label}:</span>
              <span>{filter.value}</span>
              <button
                onClick={() => removeFilter(filter.key)}
                className="ml-1 hover:text-foreground transition-colors"
                title={`Remove ${filter.label} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
