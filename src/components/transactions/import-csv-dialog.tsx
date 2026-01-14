"use client"

import { useState } from "react"
import Papa from "papaparse"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, Loader2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useRouter } from "next/navigation"

interface ImportCSVDialogProps {
  accounts: { id: string; name: string }[]
}

export function ImportCSVDialog({ accounts }: ImportCSVDialogProps) {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [accountId, setAccountId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleImport = async () => {
    if (!file || !accountId) {
      setError("Please select a file and an account.")
      return
    }

    setLoading(true)
    setError(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const transactions = results.data.map((row: any) => ({
            date: new Date(row.Date || row.date),
            description: row.Description || row.description,
            amount: parseFloat(row.Amount || row.amount),
            accountId,
            source: "CSV_IMPORT",
          }))

          // Basic validation
          if (transactions.some((t: any) => isNaN(t.amount) || !t.date || !t.description)) {
             throw new Error("Invalid CSV format. Ensure Date, Description, and Amount columns exist.")
          }
          
          if (transactions.length === 0) {
            throw new Error("No transactions found in file.")
          }

          const response = await fetch("/api/transactions/import", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transactions }),
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.error || "Failed to import transactions")
          }

          setOpen(false)
          setFile(null)
          setAccountId("")
          router.refresh()
        } catch (err) {
            console.error(err)
          setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
          setLoading(false)
        }
      },
      error: (err: Error) => {
        setError("Failed to parse CSV: " + err.message)
        setLoading(false)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Upload a CSV file to import transactions. Required columns: Date, Description, Amount.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="account">Account</Label>
            <Select value={accountId} onValueChange={setAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="file">CSV File</Label>
            <Input id="file" type="file" accept=".csv" onChange={handleFileChange} />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button onClick={handleImport} disabled={loading || !file || !accountId}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
