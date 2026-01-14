"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Category } from "@prisma/client"
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
import { AddCategoryDialog } from "./add-category-dialog"
import { EditCategoryDialog } from "./edit-category-dialog"
import { formatCurrency } from "@/lib/utils"

export function CategoryList() {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/budgets/categories")
      if (!res.ok) throw new Error("Failed to fetch categories")
      return res.json()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/budgets/categories/${id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to delete category")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
    },
  })

  if (isLoading) return <div>Loading categories...</div>
  if (error) return <div>Error loading categories</div>

  const categories = data?.data || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Categories</h3>
        <AddCategoryDialog />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Color</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Monthly Budget</TableHead>
              <TableHead>Carry Over</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No categories found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <div
                      className="h-6 w-6 rounded-full border"
                      style={{ backgroundColor: category.color }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {category.monthlyBudget 
                      ? formatCurrency(Number(category.monthlyBudget)) 
                      : formatCurrency(0)}
                  </TableCell>
                  <TableCell>{category.carryOver ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setEditingCategory(category)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => {
                            if (confirm("Are you sure you want to delete this category?")) {
                              deleteMutation.mutate(category.id)
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

      <EditCategoryDialog 
        category={editingCategory} 
        open={!!editingCategory} 
        onOpenChange={(open) => !open && setEditingCategory(null)} 
      />
    </div>
  )
}