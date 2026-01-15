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
            <h3 className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/80">Top Categories</h3>
            <div className="space-y-6">
                {filteredAndSorted.map(cat => {
                    const totalAvailable = cat.budgeted + cat.carryOver
                    return (
                        <div key={cat.id} className="space-y-2">
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm font-bold text-foreground/90 tracking-tight">{cat.name}</span>
                                <div className="text-[11px] text-muted-foreground font-medium flex gap-1">
                                    <span className="text-foreground/70">{formatCurrency(cat.spent)}</span>
                                    <span>/</span>
                                    <span>{formatCurrency(totalAvailable)}</span>
                                </div>
                            </div>

                            <div className="h-2 w-full rounded-full bg-secondary">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${Math.min(cat.progress, 100)}%`,
                                        backgroundColor: cat.color,
                                        boxShadow: `0 0 16px -1px ${cat.color}88` // ~53% opacity hex
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
