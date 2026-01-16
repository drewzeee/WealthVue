"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/client"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function updateUserPreferences(data: { timezone: string }) {
    const session = await getServerSession(authOptions)

    if (!session) {
        throw new Error("Unauthorized")
    }

    const userId = session.user.id

    try {
        await prisma.user.update({
            where: { id: userId },
            data: {
                timezone: data.timezone,
            },
        })

        revalidatePath("/settings")
        return { success: true }
    } catch (error) {
        console.error("Failed to update user preferences:", error)
        return { success: false, error: "Failed to update preferences" }
    }
}
