"use server"

import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db/client"
import { revalidatePath } from "next/cache"

export async function deleteAccount(type: "account" | "asset" | "liability" | "investment", id: string) {
    const session = await getServerSession(authOptions)
    if (!session) {
        throw new Error("Unauthorized")
    }

    const userId = session.user.id

    try {
        switch (type) {
            case "account":
                // Ensure ownership
                const account = await prisma.account.findUnique({ where: { id, userId } })
                if (!account) throw new Error("Account not found")

                // If it's a Plaid account, we should ideally remove the Item if it's the last account,
                // but for now, let's just delete the local record. 
                // Real-world: Call Plaid API to remove item.
                await prisma.account.delete({ where: { id } })
                break

            case "asset":
                await prisma.asset.delete({ where: { id, userId } })
                break

            case "liability":
                await prisma.liability.delete({ where: { id, userId } })
                break

            case "investment":
                await prisma.investmentAccount.delete({ where: { id, userId } })
                break
        }

        revalidatePath("/settings")
        return { success: true }
    } catch (error) {
        console.error("Delete failed", error)
        return { success: false, error: "Failed to delete item" }
    }
}

export async function createAccount(data: {
    type: "BANK" | "CREDIT" | "INVESTMENT" | "ASSET" | "LIABILITY"
    name: string
    balance: number
    subtype?: string
    interestRate?: number
}) {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error("Unauthorized")
    const userId = session.user.id

    try {
        switch (data.type) {
            case "BANK":
                await prisma.account.create({
                    data: {
                        userId,
                        name: data.name,
                        type: data.subtype as any || "CHECKING",
                        currentBalance: data.balance,
                        availableBalance: data.balance,
                    }
                })
                break

            case "CREDIT":
                // For manuals, we treat credit as a regular account type=CREDIT_CARD? 
                // Or if we want to separate, we check schema. 
                // Schema has AccountType enum: CHECKING, SAVINGS, CREDIT_CARD, INVESTMENT, LOAN, OTHER
                await prisma.account.create({
                    data: {
                        userId,
                        name: data.name,
                        type: "CREDIT_CARD",
                        currentBalance: data.balance,
                        // For credit cards, positive balance usually means debt in Plaid, 
                        // but manually users might enter negative for debt?
                        // Let's assume user enters positive for "Balance (Owed)" as per UI label
                    }
                })
                break

            case "INVESTMENT":
                await prisma.investmentAccount.create({
                    data: {
                        userId,
                        name: data.name,
                        type: "BROKERAGE", // Default
                    }
                })
                break

            case "ASSET":
                await prisma.asset.create({
                    data: {
                        userId,
                        name: data.name,
                        type: "OTHER", // Default since UI doesn't allow selection yet
                        currentValue: data.balance,
                        acquiredDate: new Date()
                    }
                })
                break

            case "LIABILITY":
                await prisma.liability.create({
                    data: {
                        userId,
                        name: data.name,
                        type: "PERSONAL_LOAN", // Default
                        currentBalance: data.balance,
                        originalAmount: data.balance,
                        interestRate: data.interestRate,
                    }
                })
                break
        }

        revalidatePath("/settings")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error) {
        console.error("Create failed", error)
        return { success: false, error: "Failed to create account" }
    }
}
