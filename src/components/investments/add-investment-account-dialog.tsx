"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus } from "lucide-react"
import { InvestmentAccountType } from "@prisma/client"

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
import { Switch } from "@/components/ui/switch"
import {
    createInvestmentAccountSchema,
    CreateInvestmentAccountSchema,
} from "@/lib/validations/investment"
import { ACCOUNT_TYPE_CONFIG } from "@/types/investment"

interface Props {
    accountToEdit?: {
        id: string
        name: string
        type: InvestmentAccountType
        taxAdvantaged: boolean
    }
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function AddInvestmentAccountDialog({ accountToEdit, open, onOpenChange }: Props) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = open !== undefined
    const showModal = isControlled ? open : internalOpen
    const setShowModal = isControlled ? onOpenChange! : setInternalOpen

    const queryClient = useQueryClient()
    const isEditing = !!accountToEdit

    const form = useForm<CreateInvestmentAccountSchema>({
        resolver: zodResolver(createInvestmentAccountSchema) as any,
        defaultValues: {
            name: accountToEdit?.name || "",
            type: accountToEdit?.type || "BROKERAGE",
            taxAdvantaged: accountToEdit?.taxAdvantaged || false,
        },
    })

    // Reset form when dialog opens or accountToEdit changes
    useEffect(() => {
        if (showModal) {
            form.reset({
                name: accountToEdit?.name || "",
                type: accountToEdit?.type || "BROKERAGE",
                taxAdvantaged: accountToEdit?.taxAdvantaged || false,
            })
        }
    }, [showModal, accountToEdit, form])

    const mutation = useMutation({
        mutationFn: async (values: CreateInvestmentAccountSchema) => {
            const url = isEditing
                ? `/api/investments/accounts/${accountToEdit.id}`
                : "/api/investments/accounts"

            const method = isEditing ? "PATCH" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || `Failed to ${isEditing ? "update" : "create"} account`)
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["investment-accounts"] })
            queryClient.invalidateQueries({ queryKey: ["investments"] })
            setShowModal(false)
            form.reset()
        },
    })

    function onSubmit(values: CreateInvestmentAccountSchema) {
        mutation.mutate(values)
    }

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Account
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit" : "Add"} Investment Account
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update your investment account details."
                            : "Create a new account to organize your investments."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g., Fidelity Brokerage" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Account Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(ACCOUNT_TYPE_CONFIG).map(([key, config]) => (
                                                <SelectItem key={key} value={key}>
                                                    <div>
                                                        <div>{config.label}</div>
                                                        <div className="text-xs text-muted-foreground">
                                                            {config.description}
                                                        </div>
                                                    </div>
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
                            name="taxAdvantaged"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Tax Advantaged</FormLabel>
                                        <FormDescription>
                                            Is this a tax-advantaged retirement account?
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
                                {mutation.isPending
                                    ? "Saving..."
                                    : isEditing
                                        ? "Update Account"
                                        : "Create Account"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
