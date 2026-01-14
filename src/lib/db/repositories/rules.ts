import { prisma } from "@/lib/db/client"
import { Prisma } from "@prisma/client"

export class RuleRepository {
  async findMany(userId: string) {
    return prisma.categorizationRule.findMany({
      where: { userId },
      orderBy: { priority: "asc" },
      include: {
        category: { select: { name: true, color: true } }
      }
    })
  }

  async findById(id: string, userId: string) {
    return prisma.categorizationRule.findFirst({
      where: { id, userId },
    })
  }

  async create(data: Prisma.CategorizationRuleUncheckedCreateInput) {
    return prisma.categorizationRule.create({ data })
  }

  async update(id: string, userId: string, data: Prisma.CategorizationRuleUpdateInput) {
    // Ensure user owns the rule
    const rule = await this.findById(id, userId)
    if (!rule) throw new Error("Rule not found or unauthorized")

    return prisma.categorizationRule.update({
      where: { id },
      data,
    })
  }

  async delete(id: string, userId: string) {
    const rule = await this.findById(id, userId)
    if (!rule) throw new Error("Rule not found or unauthorized")

    return prisma.categorizationRule.delete({ where: { id } })
  }
}

export const ruleRepository = new RuleRepository()
