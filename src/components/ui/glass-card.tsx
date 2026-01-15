'use client'

import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    glowColor?: "emerald" | "blue" | "rose" | "amber" | "primary"
}

const colorMap = {
    emerald: {
        hoverBorder: "hover:border-emerald-500/30",
        hoverShadow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]",
    },
    blue: {
        hoverBorder: "hover:border-blue-500/30",
        hoverShadow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
    },
    rose: {
        hoverBorder: "hover:border-rose-500/30",
        hoverShadow: "hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]",
    },
    amber: {
        hoverBorder: "hover:border-amber-500/30",
        hoverShadow: "hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
    },
    primary: {
        hoverBorder: "hover:border-primary/30",
        hoverShadow: "hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]",
    }
}

export function GlassCard({
    children,
    className,
    glowColor = "primary",
    ...props
}: GlassCardProps) {
    const colors = colorMap[glowColor]

    return (
        <div
            className={cn(
                "glass-panel p-6 rounded-2xl relative group transition-all duration-300 shadow-2xl",
                colors.hoverBorder,
                colors.hoverShadow,
                className
            )}
            style={{
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)'
            }}
            {...props}
        >
            <div className="relative z-10">
                {children}
            </div>
        </div>
    )
}
