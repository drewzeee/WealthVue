"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface CategorySelectProps {
  transactionId: string
  categoryId?: string | null
  categories: { id: string; name: string; color: string }[]
}

export function CategorySelect({
  transactionId,
  categoryId,
  categories,
}: CategorySelectProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [value, setValue] = useState(categoryId || "uncategorized")

  const onValueChange = async (newValue: string) => {
    setIsLoading(true)
    const newCategoryId = newValue === "uncategorized" ? null : newValue
    
    // Optimistic update
    setValue(newValue)

    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: newCategoryId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update category")
      }

      router.refresh()
    } catch (error) {
      console.error("Failed to update category", error)
      // Revert on error
      setValue(categoryId || "uncategorized")
    } finally {
      setIsLoading(false)
    }
  }

  // Find the color of the selected category or default to gray
  const selectedCategory = categories.find((c) => c.id === value)
  const color = selectedCategory?.color || "#94a3b8" // slate-400

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={isLoading}
      >
        <SelectTrigger 
          className={cn(
            "h-8 w-[140px] border-none bg-transparent hover:bg-muted focus:ring-0 focus:ring-offset-0 px-2 text-xs",
            !selectedCategory && "text-muted-foreground italic"
          )}
        >
          <div className="flex items-center gap-2 truncate">
            {selectedCategory && (
              <div 
                className="h-2 w-2 rounded-full shrink-0" 
                style={{ backgroundColor: color }} 
              />
            )}
            <span className="truncate">
                {selectedCategory ? selectedCategory.name : "Uncategorized"}
            </span>
          </div>
        </SelectTrigger>
        <SelectContent align="start">
          <SelectItem value="uncategorized" className="text-muted-foreground italic">
            Uncategorized
          </SelectItem>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: category.color }} 
                />
                {category.name}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isLoading && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
    </div>
  )
}
