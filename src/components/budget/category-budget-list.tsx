import { CategoryBudgetSummary } from "@/types/budget"
import { formatCurrency } from "@/lib/utils"

interface CategoryBudgetListProps {
    categories: CategoryBudgetSummary[]
}

export function CategoryBudgetList({ categories }: CategoryBudgetListProps) {
    // Only show categories that have actual spending for the month
    const filteredAndSorted = [...categories]
        .filter(cat => cat.spent !== 0)
        .sort((a, b) => b.spent - a.spent)

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Budget Categories</h3>
            <div className="space-y-6">
                {filteredAndSorted.map(cat => {
                    const totalAvailable = cat.budgeted + cat.carryOver
                    return (
                        <div key={cat.id} className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">{cat.name}</span>
                                <div className="text-muted-foreground flex gap-1">
                                    <span className="text-foreground font-medium">{formatCurrency(cat.spent)}</span>
                                    <span>/</span>
                                    <span>{formatCurrency(totalAvailable)}</span>
                                </div>
                            </div>

                            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                        width: `${Math.min(cat.progress, 100)}%`,
                                        backgroundColor: cat.color
                                    }}
                                />
                            </div>
                        </div>
                    )
                })}
                {filteredAndSorted.length === 0 && (
                    <p className="text-sm text-muted-foreground">No active categories this month.</p>
                )}
            </div>
        </div>
    )
}
