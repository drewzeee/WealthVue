"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { updateUserPreferences } from "@/app/actions/profile"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// List of common timezones. In a real app, you might want a more comprehensive list.
const COMMON_TIMEZONES = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time (US & Canada)" },
    { value: "America/Chicago", label: "Central Time (US & Canada)" },
    { value: "America/Denver", label: "Mountain Time (US & Canada)" },
    { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
    { value: "Europe/London", label: "London" },
    { value: "Europe/Paris", label: "Paris" },
    { value: "Asia/Tokyo", label: "Tokyo" },
    { value: "Australia/Sydney", label: "Sydney" },
    // Add more as needed or use a library to get all
]

interface PreferencesSettingsProps {
    initialTimezone: string
}

export function PreferencesSettings({ initialTimezone }: PreferencesSettingsProps) {
    const [timezone, setTimezone] = useState(initialTimezone)
    const [isSaving, setIsSaving] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const result = await updateUserPreferences({ timezone })
            if (result.success) {
                toast.success("Preferences updated successfully")
                router.refresh()
            } else {
                toast.error(result.error || "Failed to update preferences")
            }
        } catch (error) {
            toast.error("An unexpected error occurred")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                    Configure your application preferences.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Timezone</label>
                    <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="w-full md:w-[300px]">
                            <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                            {COMMON_TIMEZONES.map((tz) => (
                                <SelectItem key={tz.value} value={tz.value}>
                                    {tz.label} ({tz.value})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                        This timezone will be used for daily net worth snapshots.
                    </p>
                </div>

                <Button onClick={handleSave} disabled={isSaving || timezone === initialTimezone}>
                    {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
            </CardContent>
        </Card>
    )
}
