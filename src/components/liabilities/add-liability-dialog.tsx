'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LiabilityType } from '@prisma/client'
import { Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { liabilityFormSchema, type LiabilityFormInput } from '@/lib/validations/asset'

interface AddLiabilityDialogProps {
    liability?: any // For editing
    trigger?: React.ReactNode
}

export function AddLiabilityDialog({ liability, trigger }: AddLiabilityDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const isEditing = !!liability

    const form = useForm<LiabilityFormInput>({
        resolver: zodResolver(liabilityFormSchema),
        defaultValues: liability ? {
            name: liability.name,
            type: liability.type,
            currentBalance: Number(liability.currentBalance),
            originalAmount: liability.originalAmount ? Number(liability.originalAmount) : 0,
            interestRate: liability.interestRate ? Number(liability.interestRate) : 0,
            minimumPayment: liability.minimumPayment ? Number(liability.minimumPayment) : 0,
            dueDate: liability.dueDate ? new Date(liability.dueDate).toISOString().split('T')[0] : '',
            notes: liability.notes || '',
        } : {
            name: '',
            type: LiabilityType.OTHER,
            currentBalance: 0,
            originalAmount: 0,
            interestRate: 0,
            minimumPayment: 0,
            dueDate: '',
            notes: '',
        },
    })

    async function onSubmit(data: LiabilityFormInput) {
        setLoading(true)
        try {
            const url = isEditing ? `/api/liabilities/${liability.id}` : '/api/liabilities'
            const method = isEditing ? 'PATCH' : 'POST'

            // Convert empty strings to null for optional numeric fields/dates
            const cleanedData = {
                ...data,
                originalAmount: data.originalAmount === 0 ? null : data.originalAmount,
                interestRate: data.interestRate === 0 ? null : data.interestRate,
                minimumPayment: data.minimumPayment === 0 ? null : data.minimumPayment,
                dueDate: data.dueDate || null,
            }

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cleanedData),
            })

            if (response.ok) {
                toast.success(isEditing ? 'Liability updated' : 'Liability added')
                setOpen(false)
                if (!isEditing) form.reset()
                router.refresh()
            } else {
                toast.error('Failed to save liability')
            }
        } catch (error) {
            console.error('Failed to save liability:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Liability
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Liability' : 'Add Manual Liability'}</DialogTitle>
                    <DialogDescription>
                        Track debts like mortgages, auto loans, or personal loans.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Liability Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Home Mortgage" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Object.values(LiabilityType).map((type) => (
                                                    <SelectItem key={type} value={type}>
                                                        {type.replace(/_/g, ' ').charAt(0) + type.replace(/_/g, ' ').slice(1).toLowerCase()}
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
                                name="currentBalance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Balance</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value === '' ? 0 : parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="originalAmount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Original Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="interestRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Interest Rate (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="minimumPayment"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Min Payment</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                value={field.value ?? ''}
                                                onChange={(e) => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date (Optional)</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value || ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Optional notes..." {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? 'Save Changes' : 'Add Liability'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
