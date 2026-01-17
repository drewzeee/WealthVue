'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2, Loader2, Home, Car, Gem, Briefcase, Building } from 'lucide-react'
import { AssetType } from '@prisma/client'
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
import { AddAssetDialog } from './add-asset-dialog'

interface Asset {
    id: string
    name: string
    type: AssetType
    currentValue: number
    acquiredDate: string
    notes: string | null
}

interface AssetListProps {
    onSuccess?: () => void
}

export function AssetList({ onSuccess }: AssetListProps) {
    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const fetchAssets = async () => {
        try {
            const response = await fetch('/api/assets')
            const result = await response.json()
            if (result.success) {
                setAssets(result.data)
            }
        } catch (error) {
            console.error('Failed to fetch assets:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAssets()
    }, [])

    const deleteAsset = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return

        try {
            const response = await fetch(`/api/assets/${id}`, {
                method: 'DELETE',
            })
            if (response.ok) {
                toast.success('Asset deleted')
                fetchAssets()
                onSuccess?.()
                router.refresh()
            } else {
                toast.error('Failed to delete asset')
            }
        } catch (error) {
            console.error('Failed to delete asset:', error)
        }
    }

    const getIcon = (type: AssetType) => {
        switch (type) {
            case AssetType.REAL_ESTATE_PRIMARY:
                return <Home className="h-4 w-4" />
            case AssetType.REAL_ESTATE_INVESTMENT:
                return <Building className="h-4 w-4" />
            case AssetType.VEHICLE:
                return <Car className="h-4 w-4" />
            case AssetType.VALUABLE:
                return <Gem className="h-4 w-4" />
            default:
                return <Briefcase className="h-4 w-4" />
        }
    }

    if (loading) {
        return (
            <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (assets.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
                <p className="text-muted-foreground mb-4">No manual assets found</p>
                <AddAssetDialog />
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Manual Assets</h3>
                <AddAssetDialog onSuccess={() => {
                    fetchAssets()
                    onSuccess?.()
                }} />
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Asset</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {assets.map((asset) => (
                            <TableRow key={asset.id}>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <div className="rounded-full bg-muted p-2">
                                            {getIcon(asset.type)}
                                        </div>
                                        <div>
                                            <div className="font-medium">{asset.name}</div>
                                            {asset.notes && (
                                                <div className="text-xs text-muted-foreground line-clamp-1">
                                                    {asset.notes}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {asset.type.replace(/_/g, ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    ${Number(asset.currentValue).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-end gap-2">
                                        <AddAssetDialog
                                            asset={asset}
                                            onSuccess={() => {
                                                fetchAssets()
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
                                            onClick={() => deleteAsset(asset.id)}
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
