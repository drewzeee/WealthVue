'use client'

import { useState, useEffect, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"



import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import { useRouter } from 'next/navigation';
import { createAccount, updateAccount } from "@/app/actions/accounts"
import { ArrowLeft, Landmark, CreditCard, TrendingUp, Home, ArrowLeftRight } from "lucide-react"

interface AccountDialogProps {
    children?: React.ReactNode
    mode?: "create" | "edit"
    initialData?: {
        id: string
        name: string
        balance: number
        type: string
        subtype?: string | null
        interestRate?: number | null
    }
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

export function AccountDialog({ children, mode = "create", initialData, open: controlledOpen, onOpenChange: setControlledOpen }: AccountDialogProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const [plaidOpen, setPlaidOpen] = useState(false)
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? setControlledOpen! : setInternalOpen

    const router = useRouter();
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Fetch link token only when dialog is open and in create mode
        if (open && mode === "create" && !token) {
            const createLinkToken = async () => {
                try {
                    const response = await fetch('/api/plaid/create-link-token', {
                        method: 'POST',
                    });
                    const data = await response.json();
                    setToken(data.link_token);
                } catch (error) {
                    console.error('Error fetching link token:', error);
                }
            };
            createLinkToken();
        }
    }, [open, mode, token]);

    const onSuccess = useCallback<PlaidLinkOnSuccess>(
        async (publicToken, _metadata) => {
            setLoading(true);
            try {
                await fetch('/api/plaid/exchange-public-token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ publicToken }),
                });

                router.refresh();
                // Optionally close the dialog or switch steps
                setOpen(false);
            } catch (error) {
                console.error('Error exchanging public token:', error);
            } finally {
                setLoading(false);
                setPlaidOpen(false);
            }
        },
        [router, setOpen]
    );

    const config: PlaidLinkOptions = {
        token,
        onSuccess,
        onExit: (error, _metadata) => {
            setPlaidOpen(false);
            if (error) console.error('Plaid exit with error:', error);
        },
    };

    const { open: openPlaid, ready: plaidReady } = usePlaidLink(config);

    const [step, setStep] = useState<"method" | "manual-type" | "manual-form">(
        mode === "edit" ? "manual-form" : "method"
    )

    // Initialize manualType correctly based on initialData
    const [manualType, setManualType] = useState<string | null>(
        initialData ? mapTypeToManualType(initialData.type) : null
    )

    // Form State
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        balance: initialData?.balance.toString() || "",
        type: initialData?.subtype || "", // Specific subtype (e.g., CHECKING, VISA)
        interestRate: initialData?.interestRate?.toString() || "",
    })

    const reset = () => {
        if (mode === "create") {
            setStep("method")
            setManualType(null)
            setFormData({ name: "", balance: "", type: "", interestRate: "" })
        } else {
            // Reset to initial data for edit mode
            setFormData({
                name: initialData?.name || "",
                balance: initialData?.balance.toString() || "",
                type: initialData?.subtype || "",
                interestRate: initialData?.interestRate?.toString() || "",
            })
        }
    }

    const handleOpenChange = (open: boolean) => {
        setOpen(open)
        if (!open) reset()
    }


    const handleManualSubmit = async () => {
        if (!manualType || !formData.name || !formData.balance) {
            alert("Please fill in all required fields")
            return
        }

        try {
            if (mode === "create") {
                await createAccount({
                    type: manualType as any,
                    name: formData.name,
                    balance: parseFloat(formData.balance),
                    subtype: formData.type,
                    interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined
                })
            } else {
                if (!initialData?.id) return
                await updateAccount({
                    id: initialData.id,
                    type: manualType as any,
                    name: formData.name,
                    balance: parseFloat(formData.balance),
                    subtype: formData.type,
                    interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined
                })
            }
            setOpen(false)
            reset()
        } catch (error) {
            console.error(error)
            alert(`Failed to ${mode} account`)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange} modal={!plaidOpen}>
            <DialogTrigger asChild>
                {children || <Button>Add Account</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {mode === "create" && step === "method" && "Add Account"}
                        {mode === "create" && step === "manual-type" && "Select Account Type"}
                        {(step === "manual-form" || mode === "edit") && "Account Details"}
                    </DialogTitle>
                </DialogHeader>

                {/* STEP 1: Method Selection */}
                {step === "method" && (
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => setStep("manual-type")}>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CreditCard className="h-5 w-5" />
                                        Manual Entry
                                    </CardTitle>
                                    <CardDescription>Track cash, assets, or unlisted accounts manually</CardDescription>
                                </CardHeader>
                            </Card>

                            <Card className="border-primary/20 bg-primary/5">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-primary">
                                        <Landmark className="h-5 w-5" />
                                        Connect Bank
                                    </CardTitle>
                                    <CardDescription>
                                        Automatically sync balances and transactions via Plaid
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button
                                        className="w-full"
                                        onClick={() => {
                                            setPlaidOpen(true);
                                            // Allow state to propagate before opening? 
                                            // Actually with the hook inside AccountDialog, the button remounting doesn't matter for the hook state.
                                            // But we need to make sure the open() call works.
                                            // Since AccountDialog doesn't unmount, open() remains valid.
                                            openPlaid();
                                        }}
                                        disabled={!plaidReady || loading}
                                    >
                                        {loading ? 'Linking...' : 'Connect via Plaid'}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {/* STEP 2: Manual Type Selection */}
                {step === "manual-type" && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <TypeCard
                                icon={Landmark} title="Bank Account" description="Checking, Savings, CD"
                                onClick={() => { setManualType("BANK"); setStep("manual-form"); }}
                            />
                            <TypeCard
                                icon={CreditCard} title="Credit Card" description="Visa, Amex, Mastercard"
                                onClick={() => { setManualType("CREDIT"); setStep("manual-form"); }}
                            />
                            <TypeCard
                                icon={TrendingUp} title="Investment" description="Brokerage, 401k, Crypto"
                                onClick={() => { setManualType("INVESTMENT"); setStep("manual-form"); }}
                            />
                            <TypeCard
                                icon={Home} title="Asset" description="Real Estate, Vehicle, Valuables"
                                onClick={() => { setManualType("ASSET"); setStep("manual-form"); }}
                            />
                            <TypeCard
                                icon={ArrowLeftRight} title="Loan / Liability" description="Mortgage, Personal Loan"
                                onClick={() => { setManualType("LIABILITY"); setStep("manual-form"); }}
                            />
                        </div>
                        <Button variant="ghost" onClick={() => setStep("method")} className="gap-2">
                            <ArrowLeft className="h-4 w-4" /> Back
                        </Button>
                    </div>
                )}

                {/* STEP 3: Form */}
                {step === "manual-form" && (
                    <div className="space-y-4">
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="col-span-3"
                                    placeholder="e.g. Chase Checking"
                                />
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="balance" className="text-right">
                                    {manualType === "LIABILITY" || manualType === "CREDIT" ? "Current Balance (Owed)" : "Current Value"}
                                </Label>
                                <Input
                                    id="balance"
                                    type="number"
                                    value={formData.balance}
                                    onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                                    className="col-span-3"
                                    placeholder="0.00"
                                />
                            </div>

                            {/* Dynamic Fields based on Type */}
                            {manualType === "BANK" && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="type" className="text-right">Type</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                        <SelectTrigger className="col-span-3">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CHECKING">Checking</SelectItem>
                                            <SelectItem value="SAVINGS">Savings</SelectItem>
                                            <SelectItem value="OTHER">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {(manualType === "LIABILITY" || manualType === "CREDIT") && (
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="interest" className="text-right">APR %</Label>
                                    <Input
                                        id="interest"
                                        type="number"
                                        value={formData.interestRate}
                                        onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                                        className="col-span-3"
                                        placeholder="Optional"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between">
                            {mode === "create" ? (
                                <Button variant="ghost" onClick={() => setStep("manual-type")}>Back</Button>
                            ) : (
                                <div></div> // Spacer
                            )}
                            <Button onClick={handleManualSubmit}>
                                {mode === "create" ? "Create Account" : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

function TypeCard({ icon: Icon, title, description, onClick }: any) {
    return (
        <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={onClick}>
            <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4" />
                    {title}
                </CardTitle>
                <CardDescription className="text-xs">{description}</CardDescription>
            </CardHeader>
        </Card>
    )
}

function mapTypeToManualType(type: string): string {
    if (type === "CHECKING" || type === "SAVINGS") return "BANK"
    if (type === "CREDIT_CARD") return "CREDIT"
    if (type === "BROKERAGE") return "INVESTMENT"
    if (type === "PERSONAL_LOAN") return "LIABILITY"
    return "ASSET" // Default fallback
}
