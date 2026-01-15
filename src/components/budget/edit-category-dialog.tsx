"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Category } from "@prisma/client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { updateCategorySchema, UpdateCategorySchema } from "@/lib/validations/budget"
import { useEffect } from "react"

interface EditCategoryDialogProps {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCategoryDialog({ category, open, onOpenChange }: EditCategoryDialogProps) {
  const queryClient = useQueryClient()

  const form = useForm<UpdateCategorySchema>({
    resolver: zodResolver(updateCategorySchema) as any,
    defaultValues: {
      name: "",
      monthlyBudget: 0,
      color: "#3B82F6",
      carryOver: false,
    },
  })

  // Reset form when category changes
  useEffect(() => {
    if (category) {
      form.reset({
        name: category.name,
        monthlyBudget: Number(category.monthlyBudget),
        color: category.color,
        carryOver: category.carryOver,
      })
    }
  }, [category, form])

  const mutation = useMutation({
    mutationFn: async (values: UpdateCategorySchema) => {
      if (!category) return

      const response = await fetch(`/api/budgets/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Failed to update category")
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success("Category updated")
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      onOpenChange(false)
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update category")
    }
  })

  function onSubmit(values: UpdateCategorySchema) {
    mutation.mutate(values)
  }

  if (!category) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update category details and budget allocation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Groceries" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="monthlyBudget"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Budget ($)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input type="color" className="w-12 p-1" {...field} />
                    </FormControl>
                    <Input {...field} placeholder="#000000" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="carryOver"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Carry Over</FormLabel>
                    <FormDescription>
                      Roll unused budget to next month
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
