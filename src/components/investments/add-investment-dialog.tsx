"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Plus, CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { AssetClass, InvestmentAccountType } from "@prisma/client"

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
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    createInvestmentSchema,
    CreateInvestmentSchema,
} from "@/lib/validations/investment"
import { ASSET_CLASS_CONFIG } from "@/types/investment"
import { cn } from "@/lib/utils"

interface InvestmentAccount {
    id: string
    name: string
    type: InvestmentAccountType
}

interface InvestmentToEdit {
    id: string
    accountId: string
    assetClass: AssetClass
    symbol: string
    name: string
    quantity: number | string
    costBasis: number | string
    purchaseDate: Date | string
    currentPrice?: number | string | null
    manualPrice: boolean
    notes?: string | null
}

interface Props {
    investmentToEdit?: InvestmentToEdit
    accounts?: InvestmentAccount[]
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function AddInvestmentDialog({ investmentToEdit, accounts: propAccounts, open, onOpenChange }: Props) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = open !== undefined
    const showModal = isControlled ? open : internalOpen
    const setShowModal = isControlled ? onOpenChange! : setInternalOpen

    const queryClient = useQueryClient()
    const isEditing = !!investmentToEdit

    // Fetch accounts if not provided
    const { data: accountsData } = useQuery<{ success: boolean; data: InvestmentAccount[] }>({
        queryKey: ["investment-accounts"],
        queryFn: async () => {
            const res = await fetch("/api/investments/accounts")
            return res.json()
        },
        enabled: !propAccounts,
    })

    const accounts = useMemo(() => propAccounts || accountsData?.data || [], [propAccounts, accountsData?.data])

    const form = useForm<CreateInvestmentSchema>({
        resolver: zodResolver(createInvestmentSchema) as any,
        defaultValues: {
            accountId: investmentToEdit?.accountId || "",
            assetClass: investmentToEdit?.assetClass || "STOCK",
            symbol: investmentToEdit?.symbol || "",
            name: investmentToEdit?.name || "",
            quantity: investmentToEdit ? Number(investmentToEdit.quantity) : 0,
            costBasis: investmentToEdit ? Number(investmentToEdit.costBasis) : 0,
            purchaseDate: investmentToEdit?.purchaseDate
                ? new Date(investmentToEdit.purchaseDate)
                : new Date(),
            currentPrice: investmentToEdit?.currentPrice
                ? Number(investmentToEdit.currentPrice)
                : undefined,
            manualPrice: investmentToEdit?.manualPrice || false,
            notes: investmentToEdit?.notes || "",
        },
    })

    // Reset form when dialog opens or investmentToEdit changes
    useEffect(() => {
        if (showModal) {
            form.reset({
                accountId: investmentToEdit?.accountId || accounts[0]?.id || "",
                assetClass: investmentToEdit?.assetClass || "STOCK",
                symbol: investmentToEdit?.symbol || "",
                name: investmentToEdit?.name || "",
                quantity: investmentToEdit ? Number(investmentToEdit.quantity) : 0,
                costBasis: investmentToEdit ? Number(investmentToEdit.costBasis) : 0,
                purchaseDate: investmentToEdit?.purchaseDate
                    ? new Date(investmentToEdit.purchaseDate)
                    : new Date(),
                currentPrice: investmentToEdit?.currentPrice
                    ? Number(investmentToEdit.currentPrice)
                    : undefined,
                manualPrice: investmentToEdit?.manualPrice || false,
                notes: investmentToEdit?.notes || "",
            })
        }
    }, [showModal, investmentToEdit, accounts, form])

    const mutation = useMutation({
        mutationFn: async (values: CreateInvestmentSchema) => {
            const url = isEditing
                ? `/api/investments/${investmentToEdit.id}`
                : "/api/investments"

            const method = isEditing ? "PATCH" : "POST"

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || `Failed to ${isEditing ? "update" : "create"} investment`)
            }

            return response.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["investments"] })
            queryClient.invalidateQueries({ queryKey: ["investment-accounts"] })
            setShowModal(false)
            form.reset()
        },
    })

    function onSubmit(values: CreateInvestmentSchema) {
        mutation.mutate(values)
    }

    return (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            {!isControlled && (
                <DialogTrigger asChild>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Investment
                    </Button>
                </DialogTrigger>
            )}
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit" : "Add"} Investment
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update your investment details."
                            : "Add a new investment to your portfolio."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="accountId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select account" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {accounts.map((account) => (
                                                    <SelectItem key={account.id} value={account.id}>
                                                        {account.name}
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
                                name="assetClass"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Asset Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.entries(ASSET_CLASS_CONFIG).map(([key, config]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {config.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="symbol"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Symbol</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., AAPL" {...field} className="uppercase" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Apple Inc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Quantity (Shares)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="any"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="costBasis"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Cost Basis ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            />
                                        </FormControl>
                                        <FormDescription>Total amount paid</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="purchaseDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Purchase Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="manualPrice"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>Manual Price Entry</FormLabel>
                                        <FormDescription>
                                            Enable for assets without automatic price updates
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

                        {form.watch("manualPrice") && (
                            <FormField
                                control={form.control}
                                name="currentPrice"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Price ($)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                value={field.value || ""}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        e.target.value ? parseFloat(e.target.value) : null
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes (Optional)</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Any additional notes..."
                                            {...field}
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending
                                    ? "Saving..."
                                    : isEditing
                                        ? "Update Investment"
                                        : "Add Investment"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
