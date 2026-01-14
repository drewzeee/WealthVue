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
