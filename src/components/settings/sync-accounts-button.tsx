"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function SyncAccountsButton() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSync = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/plaid/sync", {
                method: "POST",
            })

            if (!response.ok) {
                throw new Error("Failed to sync accounts")
            }

            const result = await response.json()

            if (result.summary?.failed > 0) {
                toast.warning("Sync Partial Success", {
                    description: `Synced ${result.summary.success} items, but ${result.summary.failed} failed. Added ${result.summary.added} new transactions.`,
                })
            } else {
                toast.success("Sync Complete", {
                    description: `Successfully synced accounts. Added ${result.summary?.added || 0} new transactions.`,
                })
            }

            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Sync Failed", {
                description: "An error occurred while syncing your accounts.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={isLoading}
            title="Sync all connected bank accounts now"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Sync Accounts
        </Button>
    )
}
