import { CategoryBudgetSummary } from "@/types/budget"
import { formatCurrency } from "@/lib/utils"

interface CategoryBudgetListProps {
    categories: CategoryBudgetSummary[]
}

export function CategoryBudgetList({ categories }: CategoryBudgetListProps) {
    const sorted = [...categories].sort((a, b) => b.spent - a.spent).slice(0, 5)

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Top Categories</h3>
            <div className="space-y-6">
                {sorted.map(cat => {
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
                {sorted.length === 0 && (
                    <p className="text-sm text-muted-foreground">No category spending yet.</p>
                )}
            </div>
        </div>
    )
}
