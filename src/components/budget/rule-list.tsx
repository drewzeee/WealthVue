"use client"

import { useQuery } from "@tanstack/react-query"
import { CategorizationRule } from "@prisma/client"
import { MoreHorizontal } from "lucide-react"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddRuleDialog } from "./add-rule-dialog"

type RuleWithCategory = CategorizationRule & {
  category: { name: string; color: string }
}

export function RuleList() {
  const { data, isLoading, error } = useQuery<{ success: boolean; data: RuleWithCategory[] }>({
    queryKey: ["rules"],
    queryFn: async () => {
      const res = await fetch("/api/budgets/rules")
      if (!res.ok) throw new Error("Failed to fetch rules")
      return res.json()
    },
  })

  if (isLoading) return <div>Loading rules...</div>
  if (error) return <div>Error loading rules</div>

  const rules = data?.data || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Categorization Rules</h3>
        <AddRuleDialog />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Priority</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Conditions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  No rules found. Create a rule to automate categorization.
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>{rule.priority}</TableCell>
                  <TableCell>
                    <span
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: rule.category.color + "20", color: rule.category.color }}
                    >
                      {rule.category.name}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                        {(rule.conditions as any[]).map((cond, idx) => (
                            <span key={idx} className="text-sm">
                                {cond.field} {cond.operator} "{cond.value}"
                            </span>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
