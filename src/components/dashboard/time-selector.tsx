'use client'

import { Button } from '@/components/ui/button'

export type TimeRange = '24H' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL'

interface TimeSelectorProps {
    selected: TimeRange
    onChange: (range: TimeRange) => void
}

const timeOptions: { value: TimeRange; label: string }[] = [
    { value: '24H', label: '24h' },
    { value: '1W', label: '1w' },
    { value: '1M', label: '1m' },
    { value: '3M', label: '3m' },
    { value: '6M', label: '6m' },
    { value: '1Y', label: '1y' },
    { value: 'ALL', label: 'All' },
]

export function TimeSelector({ selected, onChange }: TimeSelectorProps) {
    return (
        <div className="flex gap-1 rounded-lg border p-1">
            {timeOptions.map((option) => (
                <Button
                    key={option.value}
                    variant={selected === option.value ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onChange(option.value)}
                    className="h-7 text-xs"
                >
                    {option.label}
                </Button>
            ))}
        </div>
    )
}
