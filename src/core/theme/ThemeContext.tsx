"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type Theme = "light" | "dark" | "pink"

interface ThemeProviderProps {
    children: React.ReactNode
    defaultTheme?: Theme
    storageKey?: string
}

interface ThemeProviderState {
    theme: Theme
    setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
    theme: "light",
    setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
    children,
    defaultTheme = "light",
    storageKey = "vite-ui-theme",
    ...props
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(defaultTheme)

    useEffect(() => {
        // Check if we're in the browser
        if (typeof window !== "undefined") {
            const storedTheme = localStorage.getItem(storageKey) as Theme | null
            if (storedTheme) {
                setThemeState(storedTheme)
            }
        }
    }, [storageKey])

    useEffect(() => {
        const root = window.document.documentElement

        // Remove old themes
        root.classList.remove("light", "dark", "pink")

        // Add new theme class
        root.classList.add(theme)

        // Also set data-theme attribute for consistency
        root.setAttribute("data-theme", theme)

        // Save to local storage
        localStorage.setItem(storageKey, theme)
    }, [theme, storageKey])

    const setTheme = (theme: Theme) => {
        setThemeState(theme)
    }

    const value = {
        theme,
        setTheme,
    }

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    )
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext)

    if (context === undefined)
        throw new Error("useTheme must be used within a ThemeProvider")

    return context
}
