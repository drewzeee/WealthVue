"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateTransactionSchema, UpdateTransactionSchema } from "@/lib/validations/transaction"
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
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { TransactionWithRelations } from "./columns"

interface EditTransactionDialogProps {
    transaction: TransactionWithRelations
    accounts: { id: string; name: string }[]
    categories: { id: string; name: string }[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditTransactionDialog({
    transaction,
    accounts,
    categories,
    open,
    onOpenChange,
}: EditTransactionDialogProps) {
    const router = useRouter()

    const form = useForm<UpdateTransactionSchema>({
        resolver: zodResolver(updateTransactionSchema) as any,
        defaultValues: {
            date: new Date(transaction.date),
            description: transaction.description,
            amount: Number(transaction.amount),
            accountId: transaction.accountId,
            categoryId: transaction.categoryId,
            notes: transaction.notes,
            merchant: transaction.merchant,
        },
    })

    const onSubmit = async (data: UpdateTransactionSchema) => {
        try {
            const response = await fetch(`/api/transactions/${transaction.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            if (!response.ok) {
                throw new Error("Failed to update transaction")
            }

            toast.success("Transaction updated successfully")
            onOpenChange(false)
            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Failed to update transaction. Please try again.")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                    <DialogDescription>
                        Update the details of this transaction.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Grocery Store" {...field} value={field.value || ""} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={e => field.onChange(parseFloat(e.target.value))}
                                                value={field.value || 0}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                {...field}
                                                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : (field.value as any)?.split('T')[0] || ""}
                                                onChange={e => field.onChange(new Date(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="accountId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select account" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {accounts.map((acc) => (
                                                <SelectItem key={acc.id} value={acc.id}>
                                                    {acc.name}
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
                            name="categoryId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category (Optional)</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
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
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Add any additional details..."
                                            className="resize-none"
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
