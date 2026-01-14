"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, Trash2 } from "lucide-react"
import { Category } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createRuleSchema, CreateRuleSchema } from "@/lib/validations/budget"

export function RuleDialog({
  ruleToEdit,
  open,
  onOpenChange
}: {
  ruleToEdit?: any, // Using any for simplicity with complex Prisma types, can be strict Typed if we export RuleWithCategory
  open?: boolean,
  onOpenChange?: (open: boolean) => void
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = open !== undefined
  const showModal = isControlled ? open : internalOpen
  const setShowModal = isControlled ? onOpenChange! : setInternalOpen

  const queryClient = useQueryClient()
  const isEditing = !!ruleToEdit

  // Fetch categories for selection
  const { data: categoriesData } = useQuery<{ data: Category[] }>({
    queryKey: ["categories"],
    queryFn: async () => (await fetch("/api/budgets/categories")).json(),
  })
  const categories = categoriesData?.data || []

  // useMemo to prevent infinite loop in useEffect
  const defaultValues: CreateRuleSchema = useMemo(() => ({
    categoryId: ruleToEdit?.categoryId || "",
    priority: ruleToEdit?.priority || 1,
    isActive: ruleToEdit?.isActive ?? true,
    logic: ruleToEdit?.logic || "AND",
    conditions: ruleToEdit?.conditions ? (ruleToEdit.conditions as any[]) : [{ field: "description", operator: "contains", value: "" }],
  }), [ruleToEdit])

  const form = useForm({
    resolver: zodResolver(createRuleSchema),
    defaultValues,
  })

  // Ensure field array is initialized cleanly
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "conditions",
  })

  // Reset form when ruleToEdit changes or dialog opens
  useEffect(() => {
    if (showModal) {
      form.reset(defaultValues)
    }
  }, [showModal, defaultValues, form])

  const mutation = useMutation({
    mutationFn: async (values: CreateRuleSchema) => {
      // Ensure priority is number
      const payload = { ...values, priority: Number(values.priority) }

      const url = isEditing
        ? `/api/budgets/rules/${ruleToEdit.id}`
        : "/api/budgets/rules"

      const method = isEditing ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} rule`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] })
      setShowModal(false)
      form.reset()
    },
  })

  function onSubmit(values: CreateRuleSchema) {
    mutation.mutate(values)
  }

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit" : "Create"} Categorization Rule</DialogTitle>
          <DialogDescription>
            Automatically categorize transactions based on conditions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormDescription>Lower runs first</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 border rounded-md p-4 bg-slate-50 dark:bg-slate-900">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium">Conditions</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ field: "description", operator: "contains", value: "" })}
                >
                  <Plus className="h-3 w-3 mr-1" /> Add Condition
                </Button>
              </div>

              <FormField
                control={form.control}
                name="logic"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel>Match Logic</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Logic" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AND">Match All (AND)</SelectItem>
                        <SelectItem value="OR">Match Any (OR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex gap-2 items-start group">
                    <div className="grid grid-cols-3 gap-2 flex-1">
                      <FormField
                        control={form.control}
                        name={`conditions.${index}.field`}
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Field" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="description">Description</SelectItem>
                                <SelectItem value="merchant">Merchant</SelectItem>
                                <SelectItem value="amount">Amount</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`conditions.${index}.operator`}
                        render={({ field }) => (
                          <FormItem>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Operator" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="gt">Greater Than</SelectItem>
                                <SelectItem value="lt">Less Than</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`conditions.${index}.value`}
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input placeholder="Value" {...field} value={field.value?.toString() ?? ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Saving..." : (isEditing ? "Update Rule" : "Create Rule")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
