'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"


import { PlaidLinkButton } from "@/components/plaid/PlaidLinkButton"
import { createAccount } from "@/app/actions/accounts"
import { ArrowLeft, Landmark, CreditCard, TrendingUp, Home, ArrowLeftRight } from "lucide-react"

export function AddAccountDialog({ children }: { children?: React.ReactNode }) {
    const [step, setStep] = useState<"method" | "manual-type" | "manual-form">("method")
    const [manualType, setManualType] = useState<string | null>(null)
    const [open, setOpen] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        balance: "",
        type: "", // Specific subtype (e.g., CHECKING, VISA)
        interestRate: "",
    })

    const reset = () => {
        setStep("method")
        setManualType(null)
        setFormData({ name: "", balance: "", type: "", interestRate: "" })
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
            await createAccount({
                type: manualType as any,
                name: formData.name,
                balance: parseFloat(formData.balance),
                subtype: formData.type,
                interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined
            })
            setOpen(false)
            reset()
        } catch (error) {
            console.error(error)
            alert("Failed to create account")
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {children || <Button>Add Account</Button>}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>
                        {step === "method" && "Add Account"}
                        {step === "manual-type" && "Select Account Type"}
                        {step === "manual-form" && "Account Details"}
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
                                    <PlaidLinkButton className="w-full">Connect via Plaid</PlaidLinkButton>
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
                            <Button variant="ghost" onClick={() => setStep("manual-type")}>Back</Button>
                            <Button onClick={handleManualSubmit}>Create Account</Button>
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
