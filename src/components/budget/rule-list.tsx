"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
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
import { Badge } from "@/components/ui/badge"
import { RuleDialog } from "./add-rule-dialog"

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

  const queryClient = useQueryClient()
  const [editingRule, setEditingRule] = useState<RuleWithCategory | undefined>(undefined)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/budgets/rules/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete rule")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] })
    },
  })

  if (isLoading) return <div>Loading rules...</div>
  if (error) return <div>Error loading rules</div>

  const rules = data?.data || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Categorization Rules</h3>
        <RuleDialog />
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
                      <span className="text-xs font-semibold text-muted-foreground mb-1">
                        MATCH {(rule as any).logic || "AND"}
                      </span>
                      {(rule.conditions as any[]).map((cond, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs font-normal">
                            {cond.field} {cond.operator} &quot;{cond.value}&quot;
                          </Badge>
                          {idx < (rule.conditions as any[]).length - 1 && (
                            <span className="text-[10px] text-muted-foreground">
                              {(rule as any).logic || "AND"}
                            </span>
                          )}
                        </div>
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
                        <DropdownMenuItem onClick={() => {
                          setEditingRule(rule)
                          setIsEditDialogOpen(true)
                        }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this rule?")) {
                              deleteMutation.mutate(rule.id)
                            }
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <RuleDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        ruleToEdit={editingRule}
      />
    </div>
  )
}
