"use client"

import * as React from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { format } from "date-fns"
import {
    Filter,
    ChevronRight,
    Calendar as CalendarIcon,
    CreditCard,
    Tag,
    DollarSign,
    Hash,
    Building2,
    Check
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FilterPopoverProps {
    accounts: { id: string; name: string }[]
    categories: { id: string; name: string }[]
}

type FilterTab = "account" | "date" | "type" | "amount" | "category" | "merchant"

export function FilterPopover({ accounts, categories }: FilterPopoverProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [isOpen, setIsOpen] = React.useState(false)
    const [activeTab, setActiveTab] = React.useState<FilterTab>("account")

    // Filter states
    const [selectedAccounts, setSelectedAccounts] = React.useState<string[]>(
        searchParams.get("accountId")?.split(",") || []
    )
    const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
        searchParams.get("categoryId")?.split(",") || []
    )
    const [dateFrom, setDateFrom] = React.useState<Date | undefined>(
        searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined
    )
    const [dateTo, setDateTo] = React.useState<Date | undefined>(
        searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined
    )
    const [type, setType] = React.useState<'income' | 'expense' | 'all'>(
        (searchParams.get("type") as any) || "all"
    )
    const [amountMin, setAmountMin] = React.useState(searchParams.get("amountMin") || "")
    const [amountMax, setAmountMax] = React.useState(searchParams.get("amountMax") || "")
    const [merchant, setMerchant] = React.useState(searchParams.get("merchant") || "")
    const [uncategorized, setUncategorized] = React.useState(searchParams.get("uncategorized") === "true")

    const [accountSearch, setAccountSearch] = React.useState("")
    const [categorySearch, setCategorySearch] = React.useState("")

    // Sync state with URL when Popover opens
    React.useEffect(() => {
        if (isOpen) {
            setSelectedAccounts(searchParams.get("accountId")?.split(",").filter(Boolean) || [])
            setSelectedCategories(searchParams.get("categoryId")?.split(",").filter(Boolean) || [])
            setDateFrom(searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined)
            setDateTo(searchParams.get("to") ? new Date(searchParams.get("to")!) : undefined)
            setType((searchParams.get("type") as any) || "all")
            setAmountMin(searchParams.get("amountMin") || "")
            setAmountMax(searchParams.get("amountMax") || "")
            setMerchant(searchParams.get("merchant") || "")
            setUncategorized(searchParams.get("uncategorized") === "true")
        }
    }, [isOpen, searchParams])

    const handleApply = () => {
        const params = new URLSearchParams(searchParams.toString())

        if (selectedAccounts.length > 0) params.set("accountId", selectedAccounts.join(","))
        else params.delete("accountId")

        if (selectedCategories.length > 0) params.set("categoryId", selectedCategories.join(","))
        else params.delete("categoryId")

        if (dateFrom) params.set("from", format(dateFrom, "yyyy-MM-dd"))
        else params.delete("from")

        if (dateTo) params.set("to", format(dateTo, "yyyy-MM-dd"))
        else params.delete("to")

        if (type !== "all") params.set("type", type)
        else params.delete("type")

        if (amountMin) params.set("amountMin", amountMin)
        else params.delete("amountMin")

        if (amountMax) params.set("amountMax", amountMax)
        else params.delete("amountMax")

        if (merchant) params.set("merchant", merchant)
        else params.delete("merchant")

        if (uncategorized) params.set("uncategorized", "true")
        else params.delete("uncategorized")

        params.set("page", "1")
        router.push(pathname + "?" + params.toString())
        setIsOpen(false)
    }

    const handleClear = () => {
        setSelectedAccounts([])
        setSelectedCategories([])
        setDateFrom(undefined)
        setDateTo(undefined)
        setType("all")
        setAmountMin("")
        setAmountMax("")
        setMerchant("")
        setUncategorized(false)

        const params = new URLSearchParams(searchParams.toString())
        params.delete("accountId")
        params.delete("categoryId")
        params.delete("from")
        params.delete("to")
        params.delete("type")
        params.delete("amountMin")
        params.delete("amountMax")
        params.delete("merchant")
        params.delete("uncategorized")
        params.set("page", "1")

        router.push(pathname + "?" + params.toString())
        setIsOpen(false)
    }

    const filteredAccounts = accounts.filter(acc =>
        acc.name.toLowerCase().includes(accountSearch.toLowerCase())
    )

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    )

    const tabs: { id: FilterTab; label: string; icon: React.ReactNode }[] = [
        { id: "account", label: "Account", icon: <CreditCard className="h-4 w-4" /> },
        { id: "date", label: "Date", icon: <CalendarIcon className="h-4 w-4" /> },
        { id: "type", label: "Type", icon: <Tag className="h-4 w-4" /> },
        { id: "amount", label: "Amount", icon: <Hash className="h-4 w-4" /> },
        { id: "category", label: "Category", icon: <Tag className="h-4 w-4" /> },
        { id: "merchant", label: "Merchant", icon: <Building2 className="h-4 w-4" /> },
    ]

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" className="h-10 border-input bg-background/50 backdrop-blur-sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] p-0 overflow-hidden" align="end">
                <div className="flex h-[400px]">
                    {/* Sidebar */}
                    <div className="w-[180px] bg-muted/30 border-r flex flex-col">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50 text-left",
                                    activeTab === tab.id ? "bg-muted text-primary" : "text-muted-foreground"
                                )}
                            >
                                {tab.icon}
                                <span className="flex-1">{tab.label}</span>
                                {activeTab === tab.id && <ChevronRight className="h-4 w-4 opacity-50" />}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-background">
                        <div className="p-4 flex-1 overflow-y-auto">
                            {activeTab === "account" && (
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Filter accounts..."
                                        value={accountSearch}
                                        onChange={(e) => setAccountSearch(e.target.value)}
                                        className="h-9"
                                    />
                                    <div className="space-y-2">
                                        {filteredAccounts.map((acc) => (
                                            <div key={acc.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`acc-${acc.id}`}
                                                    checked={selectedAccounts.includes(acc.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setSelectedAccounts([...selectedAccounts, acc.id])
                                                        else setSelectedAccounts(selectedAccounts.filter(id => id !== acc.id))
                                                    }}
                                                />
                                                <Label htmlFor={`acc-${acc.id}`} className="text-sm font-normal cursor-pointer flex-1 py-1">
                                                    {acc.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "category" && (
                                <div className="space-y-4">
                                    <Input
                                        placeholder="Filter categories..."
                                        value={categorySearch}
                                        onChange={(e) => setCategorySearch(e.target.value)}
                                        className="h-9"
                                    />
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2 py-2 border-b">
                                            <Checkbox
                                                id="cat-uncategorized"
                                                checked={uncategorized}
                                                onCheckedChange={(checked) => setUncategorized(!!checked)}
                                            />
                                            <Label htmlFor="cat-uncategorized" className="text-sm font-medium cursor-pointer flex-1 py-1">
                                                Uncategorized Only
                                            </Label>
                                        </div>
                                        {filteredCategories.map((cat) => (
                                            <div key={cat.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`cat-${cat.id}`}
                                                    checked={selectedCategories.includes(cat.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) setSelectedCategories([...selectedCategories, cat.id])
                                                        else setSelectedCategories(selectedCategories.filter(id => id !== cat.id))
                                                    }}
                                                />
                                                <Label htmlFor={`cat-${cat.id}`} className="text-sm font-normal cursor-pointer flex-1 py-1">
                                                    {cat.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeTab === "date" && (
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="space-y-2 flex-1">
                                            <Label className="text-xs">From</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {dateFrom ? format(dateFrom, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={dateFrom}
                                                        onSelect={setDateFrom}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <Label className="text-xs">To</Label>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button variant="outline" className="w-full justify-start text-left font-normal h-9">
                                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                                        {dateTo ? format(dateTo, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={dateTo}
                                                        onSelect={setDateTo}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "type" && (
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Button
                                            variant={type === "all" ? "secondary" : "ghost"}
                                            className="justify-between"
                                            onClick={() => setType("all")}
                                        >
                                            All Transactions
                                            {type === "all" && <Check className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant={type === "income" ? "secondary" : "ghost"}
                                            className="justify-between text-finance-income"
                                            onClick={() => setType("income")}
                                        >
                                            Income Only
                                            {type === "income" && <Check className="h-4 w-4" />}
                                        </Button>
                                        <Button
                                            variant={type === "expense" ? "secondary" : "ghost"}
                                            className="justify-between text-finance-expense"
                                            onClick={() => setType("expense")}
                                        >
                                            Expenses Only
                                            {type === "expense" && <Check className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "amount" && (
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="space-y-2 flex-1">
                                            <Label className="text-xs">Min Amount</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="number"
                                                    placeholder="0.00"
                                                    className="pl-8 h-9"
                                                    value={amountMin}
                                                    onChange={(e) => setAmountMin(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2 flex-1">
                                            <Label className="text-xs">Max Amount</Label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    type="number"
                                                    placeholder="9999.99"
                                                    className="pl-8 h-9"
                                                    value={amountMax}
                                                    onChange={(e) => setAmountMax(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "merchant" && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs">Merchant Name</Label>
                                        <Input
                                            placeholder="e.g. Starbucks, Netflix..."
                                            className="h-9"
                                            value={merchant}
                                            onChange={(e) => setMerchant(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-muted/10 flex items-center justify-between">
                            <Button variant="ghost" size="sm" onClick={handleClear} className="text-xs">
                                Clear filters
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleApply}>
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}
