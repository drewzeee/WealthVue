"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import Papa from "papaparse"
import { Upload, FileText, AlertCircle, Loader2 } from "lucide-react"

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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AssetClass } from "@prisma/client"
import { ASSET_CLASS_CONFIG } from "@/types/investment"

const MAPPING_FIELDS = [
    { value: "symbol", label: "Symbol (Ticker)", required: true },
    { value: "quantity", label: "Quantity", required: true },
    { value: "costBasis", label: "Total Cost / Cost Basis", required: true },
    { value: "purchaseDate", label: "Purchase Date", required: false },
    { value: "name", label: "Name", required: false },
]

interface ImportInvestmentsDialogProps {
    accounts: { id: string; name: string }[]
}

export function ImportInvestmentsDialog({ accounts }: ImportInvestmentsDialogProps) {
    const [open, setOpen] = useState(false)
    const [step, setStep] = useState<"upload" | "mapping" | "review">("upload")
    const [csvData, setCsvData] = useState<any[]>([])
    const [headers, setHeaders] = useState<string[]>([])
    const [mapping, setMapping] = useState<Record<string, string>>({})
    const [selectedAccountId, setSelectedAccountId] = useState<string>("")
    const [defaultAssetClass, setDefaultAssetClass] = useState<AssetClass>(AssetClass.STOCK)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const queryClient = useQueryClient()

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            parseCSV(selectedFile)
        }
    }

    const parseCSV = (file: File) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length > 0) {
                    setCsvData(results.data)
                    setHeaders(Object.keys(results.data[0] as object))
                    setStep("mapping")
                    setError(null)
                    
                    // Auto-guess mapping
                    const newMapping: Record<string, string> = {}
                    const headerKeys = Object.keys(results.data[0] as object)
                    
                    headerKeys.forEach(header => {
                        const lowerHeader = header.toLowerCase()
                        if (lowerHeader.includes("symbol") || lowerHeader.includes("ticker")) newMapping["symbol"] = header
                        else if (lowerHeader.includes("quantity") || lowerHeader.includes("qty") || lowerHeader.includes("shares")) newMapping["quantity"] = header
                        else if (lowerHeader.includes("cost") || lowerHeader.includes("basis") || lowerHeader.includes("amount")) newMapping["costBasis"] = header
                        else if (lowerHeader.includes("date") || lowerHeader.includes("time")) newMapping["purchaseDate"] = header
                        else if (lowerHeader.includes("name") || lowerHeader.includes("description")) newMapping["name"] = header
                    })
                    setMapping(newMapping)
                } else {
                    setError("CSV file appears to be empty.")
                }
            },
            error: (err) => {
                setError(`Failed to parse CSV: ${err.message}`)
            }
        })
    }

    const handleImport = async () => {
        if (!selectedAccountId) {
            setError("Please select an investment account.")
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            // Transform data
            const investments = csvData.map(row => {
                const symbol = row[mapping["symbol"]]
                const quantity = parseFloat(row[mapping["quantity"]])
                const costBasis = parseFloat(row[mapping["costBasis"]]) || 0 // Provide fallback or validation
                
                // Skip invalid rows
                if (!symbol || isNaN(quantity)) return null

                return {
                    symbol,
                    quantity,
                    costBasis, // Should handle unit cost vs total cost logic if needed, currently assumes total
                    purchaseDate: mapping["purchaseDate"] ? new Date(row[mapping["purchaseDate"]]).toISOString() : undefined,
                    name: mapping["name"] ? row[mapping["name"]] : undefined,
                    assetClass: defaultAssetClass
                }
            }).filter(Boolean)

            if (investments.length === 0) {
                throw new Error("No valid investments found based on mapping.")
            }

            const res = await fetch("/api/investments/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    accountId: selectedAccountId,
                    investments
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || "Failed to import investments")
            }

            queryClient.invalidateQueries({ queryKey: ["investments"] })
            queryClient.invalidateQueries({ queryKey: ["investment-overview"] })
            setOpen(false)
            resetState()
            
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetState = () => {
        setStep("upload")
        setCsvData([])
        setHeaders([])
        setMapping({})
        setSelectedAccountId("")
        setError(null)
    }

    return (
        <Dialog open={open} onOpenChange={(val) => {
            setOpen(val)
            if (!val) resetState()
        }}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Import CSV
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Import Investments</DialogTitle>
                    <DialogDescription>
                        Upload a CSV file to import your investment positions.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {step === "upload" && (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                        <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                        <div className="text-center space-y-2">
                            <p className="text-sm font-medium">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground">CSV files only</p>
                        </div>
                        <input
                            type="file"
                            accept=".csv"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleFileSelect}
                        />
                    </div>
                )}

                {step === "mapping" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Account</Label>
                                <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {accounts.map(acc => (
                                            <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Default Asset Class</Label>
                                <Select value={defaultAssetClass} onValueChange={(val) => setDefaultAssetClass(val as AssetClass)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(ASSET_CLASS_CONFIG).map(([key, config]) => (
                                            <SelectItem key={key} value={key}>{config.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Map Columns</Label>
                            {MAPPING_FIELDS.map(field => (
                                <div key={field.value} className="grid grid-cols-2 items-center gap-4">
                                    <Label className={`text-sm ${field.required ? "font-semibold" : "text-muted-foreground"}`}>
                                        {field.label} {field.required && "*"}
                                    </Label>
                                    <Select 
                                        value={mapping[field.value] || "ignore"} 
                                        onValueChange={(val) => setMapping(prev => ({ ...prev, [field.value]: val }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {headers.map(header => (
                                                <SelectItem key={header} value={header}>{header}</SelectItem>
                                            ))}
                                            <SelectItem value="ignore" className="text-muted-foreground italic">Ignore</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === "review" && (
                    <div className="space-y-4">
                        <div className="rounded-md border max-h-[300px] overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Symbol</TableHead>
                                        <TableHead>Quantity</TableHead>
                                        <TableHead>Cost Basis</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {csvData.slice(0, 5).map((row, i) => (
                                        <TableRow key={i}>
                                            <TableCell>{row[mapping["symbol"]]}</TableCell>
                                            <TableCell>{row[mapping["quantity"]]}</TableCell>
                                            <TableCell>{row[mapping["costBasis"]]}</TableCell>
                                            <TableCell>{row[mapping["purchaseDate"]]}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Showing first 5 rows of {csvData.length} total items.
                        </p>
                    </div>
                )}

                <DialogFooter>
                    {step === "mapping" && (
                        <Button onClick={() => setStep("review")} disabled={!selectedAccountId || !mapping["symbol"] || !mapping["quantity"]}>
                            Next: Review
                        </Button>
                    )}
                    {step === "review" && (
                        <div className="flex gap-2">
                             <Button variant="outline" onClick={() => setStep("mapping")}>Back</Button>
                             <Button onClick={handleImport} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Import {csvData.length} Items
                             </Button>
                        </div>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
