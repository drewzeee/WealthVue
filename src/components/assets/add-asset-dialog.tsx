'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AssetType } from '@prisma/client'
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
import { assetFormSchema, type AssetFormInput } from '@/lib/validations/asset'

interface AddAssetDialogProps {
    asset?: any // For editing
    trigger?: React.ReactNode
}

export function AddAssetDialog({ asset, trigger }: AddAssetDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const isEditing = !!asset

    const form = useForm<AssetFormInput>({
        resolver: zodResolver(assetFormSchema),
        defaultValues: asset ? {
            name: asset.name,
            type: asset.type,
            currentValue: Number(asset.currentValue),
            acquiredDate: asset.acquiredDate ? new Date(asset.acquiredDate).toISOString().split('T')[0] : '',
            notes: asset.notes || '',
        } : {
            name: '',
            type: AssetType.OTHER,
            currentValue: 0,
            acquiredDate: new Date().toISOString().split('T')[0],
            notes: '',
        },
    })

    async function onSubmit(data: AssetFormInput) {
        setLoading(true)
        try {
            const url = isEditing ? `/api/assets/${asset.id}` : '/api/assets'
            const method = isEditing ? 'PATCH' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            if (response.ok) {
                toast.success(isEditing ? 'Asset updated' : 'Asset added')
                setOpen(false)
                if (!isEditing) form.reset()
                router.refresh()
            } else {
                toast.error('Failed to save asset')
            }
        } catch (error) {
            console.error('Failed to save asset:', error)
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
                        Add Asset
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Edit Asset' : 'Add Manual Asset'}</DialogTitle>
                    <DialogDescription>
                        Record value for assets like real estate, vehicles, or collectibles.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Asset Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Primary Residence" {...field} />
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
                                                {Object.values(AssetType).map((type) => (
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
                                name="currentValue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Current Value</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="acquiredDate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Acquired Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} value={field.value || ''} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                {isEditing ? 'Save Changes' : 'Add Asset'}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
