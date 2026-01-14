"use client"

import { useState } from "react"
import Papa from "papaparse"
import { parse, isValid } from "date-fns"
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
  const [step, setStep] = useState<"UPLOAD" | "MAPPING">("UPLOAD")
  const [file, setFile] = useState<File | null>(null)
  const [accountId, setAccountId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [headers, setHeaders] = useState<string[]>([])
  const [csvData, setCsvData] = useState<any[]>([])

  const [mapping, setMapping] = useState({
    date: "",
    description: "",
    amount: "",
  })

  const router = useRouter()

  const resetState = () => {
    setFile(null)
    setAccountId("")
    setError(null)
    setStep("UPLOAD")
    setHeaders([])
    setCsvData([])
    setMapping({ date: "", description: "", amount: "" })
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetState()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const guessMapping = (headers: string[]) => {
    const newMapping = { date: "", description: "", amount: "" }
    const lowerHeaders = headers.map(h => h.toLowerCase())

    const findMatch = (terms: string[]) => {
      const index = lowerHeaders.findIndex(h => terms.some(term => h.includes(term)))
      return index !== -1 ? headers[index] : ""
    }

    newMapping.date = findMatch(["date", "time", "posted"])
    newMapping.description = findMatch(["desc", "memo", "detail", "payee", "merchant"])
    newMapping.amount = findMatch(["amount", "value", "total"])

    return newMapping
  }

  const handleParseUpload = () => {
    if (!file || !accountId) {
      setError("Please select a file and an account.")
      return
    }

    setLoading(true)
    setError(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.meta.fields && results.meta.fields.length > 0) {
          setHeaders(results.meta.fields)
          setCsvData(results.data)
          setMapping(guessMapping(results.meta.fields))
          setStep("MAPPING")
        } else {
          setError("Could not parse CSV headers. Please check the file format.")
        }
        setLoading(false)
      },
      error: (err: Error) => {
        setError("Failed to parse CSV: " + err.message)
        setLoading(false)
      }
    })
  }

  // Helper to parse date with multiple formats
  const parseDate = (dateStr: string) => {
    if (!dateStr) return null

    // Try standard formats
    const formats = [
      "yyyy-MM-dd",
      "MM/dd/yyyy",
      "dd/MM/yyyy",
      "yyyy/MM/dd",
      "M/d/yyyy",
      "d/M/yyyy"
    ]

    for (const formatStr of formats) {
      const parsed = parse(dateStr, formatStr, new Date())
      if (isValid(parsed)) {
        return parsed
      }
    }

    // Fallback to native constructor if consistent ISO string
    const native = new Date(dateStr)
    return isValid(native) ? native : null
  }

  const handleImport = async () => {
    if (!mapping.date || !mapping.description || !mapping.amount) {
      setError("Please maps all required fields.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const transactions = csvData.map((row: any) => {
        const dateStr = row[mapping.date];
        const date = parseDate(dateStr);
        if (!date) {
          throw new Error(`Invalid date format found: "${dateStr}". Supported formats: yyyy-MM-dd, MM/dd/yyyy.`)
        }

        return {
          date: date,
          description: row[mapping.description],
          amount: parseFloat(row[mapping.amount]),
          accountId,
          source: "CSV_IMPORT",
        }
      })

      // Basic validation
      if (transactions.some((t: any) => isNaN(t.amount) || !t.description)) {
        throw new Error("Some transactions have invalid data based on the mapping.")
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
      resetState()
      router.refresh()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" /> Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            {step === "UPLOAD"
              ? "Upload a CSV file to import transactions."
              : "Map the columns from your CSV to the required fields."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {step === "UPLOAD" ? (
            <>
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
            </>
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="date-col">Date Column</Label>
                <Select value={mapping.date} onValueChange={(val) => setMapping(prev => ({ ...prev, date: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((header) => (
                      <SelectItem key={header} value={header}>{header}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="desc-col">Description Column</Label>
                <Select value={mapping.description} onValueChange={(val) => setMapping(prev => ({ ...prev, description: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((header) => (
                      <SelectItem key={header} value={header}>{header}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="amount-col">Amount Column</Label>
                <Select value={mapping.amount} onValueChange={(val) => setMapping(prev => ({ ...prev, amount: val }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {headers.map((header) => (
                      <SelectItem key={header} value={header}>{header}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {step === "UPLOAD" ? (
            <Button onClick={handleParseUpload} disabled={loading || !file || !accountId}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Next
            </Button>
          ) : (
            <div className="flex w-full justify-between">
              <Button variant="outline" onClick={() => setStep("UPLOAD")}>Back</Button>
              <Button onClick={handleImport} disabled={loading || !mapping.date || !mapping.description || !mapping.amount}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Import
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
