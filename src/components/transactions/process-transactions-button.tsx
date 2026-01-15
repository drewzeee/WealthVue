"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Play, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function ProcessTransactionsButton() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleProcess = async () => {
        setIsLoading(true)
        try {
            const response = await fetch("/api/transactions/process-batch", {
                method: "POST",
            })

            if (!response.ok) {
                throw new Error("Failed to process transactions")
            }

            const result = await response.json()

            toast.success("Cleanup Complete", {
                description: `Categorized ${result.data.categorizedCount} transactions and linked ${result.data.transferCount} transfer pairs.`,
            })

            router.refresh()
        } catch (error) {
            console.error(error)
            toast.error("Process Failed", {
                description: "An error occurred while processing your transactions.",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="outline"
            onClick={handleProcess}
            disabled={isLoading}
            title="Run categorization rules and transfer detection on all transactions"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Play className="mr-2 h-4 w-4" />
            )}
            Process History
        </Button>
    )
}
