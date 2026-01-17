'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2, Loader2, Building, Car, CreditCard, Banknote } from 'lucide-react'
import { LiabilityType } from '@prisma/client'
import { useRouter } from 'next/navigation'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { AddLiabilityDialog } from './add-liability-dialog'

interface Liability {
    id: string
    name: string
    type: LiabilityType
    currentBalance: number
    interestRate: number | null
    minimumPayment: number | null
    dueDate: string | null
    notes: string | null
}

interface LiabilityListProps {
    onSuccess?: () => void
}

export function LiabilityList({ onSuccess }: LiabilityListProps) {
    const [liabilities, setLiabilities] = useState<Liability[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchLiabilities = async () => {
        try {
            const response = await fetch('/api/liabilities')
            const result = await response.json()
            if (result.success) {
                setLiabilities(result.data)
            }
        } catch (error) {
            console.error('Failed to fetch liabilities:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLiabilities()
    }, [])

    const deleteLiability = async (id: string) => {
        if (!confirm('Are you sure you want to delete this liability?')) return

        try {
            const response = await fetch(`/api/liabilities/${id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                toast.success('Liability deleted')
                fetchLiabilities()
                onSuccess?.()
                router.refresh()
            } else {
                toast.error('Failed to delete liability')
            }
        } catch (error) {
            console.error('Failed to delete liability:', error)
        }
    }

    const getIcon = (type: LiabilityType) => {
        switch (type) {
            case LiabilityType.MORTGAGE:
                return <Building className="h-4 w-4" />
            case LiabilityType.AUTO_LOAN:
                return <Car className="h-4 w-4" />
            case LiabilityType.CREDIT_CARD:
                return <CreditCard className="h-4 w-4" />
            default:
                return <Banknote className="h-4 w-4" />
        }
    }

    if (loading) {
        return (
            <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (liabilities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
                <p className="text-muted-foreground">No liabilities found</p>
                <AddLiabilityDialog />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Manual Liabilities</h3>
                <AddLiabilityDialog onSuccess={() => {
                    fetchLiabilities()
                    onSuccess?.()
                }} />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Liability</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {liabilities.map((liability) => (
                            <TableRow key={liability.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-full bg-muted p-2">
                                            {getIcon(liability.type)}
                                        </div>
                                        <div>
                                            <div className="font-medium">{liability.name}</div>
                                            {liability.interestRate && (
                                                <div className="text-xs text-muted-foreground">
                                                    {liability.interestRate}% APR
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">
                                        {liability.type.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium text-destructive">
                                    ${Number(liability.currentBalance).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-2">
                                        <AddLiabilityDialog
                                            liability={liability}
                                            onSuccess={() => {
                                                fetchLiabilities()
                                                onSuccess?.()
                                            }}
                                            trigger={
                                                <Button variant="ghost" size="icon">
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                            }
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteLiability(liability.id)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
