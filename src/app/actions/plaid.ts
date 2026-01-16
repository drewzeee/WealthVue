"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function resetPlaidSync(plaidItemId: string) {
    const session = await getServerSession(authOptions)
    if (!session) throw new Error("Unauthorized")
    const userId = session.user.id

    // Verify ownership
    const plaidItem = await prisma.plaidItem.findUnique({
        where: { id: plaidItemId, userId }
    })

    if (!plaidItem) throw new Error("Plaid connection not found")

    // Clear the cursor to force high-water mark reset
    await prisma.plaidItem.update({
        where: { id: plaidItemId },
        data: { cursor: null }
    })

    revalidatePath("/settings")
    return { success: true }
}
