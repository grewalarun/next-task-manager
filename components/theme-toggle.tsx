"use client"

import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

const themes = [
  { value: "light", icon: Sun,     label: "Light"  },
  { value: "dark",  icon: Moon,    label: "Dark"   },
  { value: "system",icon: Monitor, label: "System" },
] as const

export function ThemeToggle({ showLabel }: { showLabel: boolean }) {
  const { theme, setTheme } = useTheme()

  if (!showLabel) {
    // Collapsed sidebar: cycle through themes on click
    const current = themes.find((t) => t.value === theme) ?? themes[2]
    const next = themes[(themes.indexOf(current) + 1) % themes.length]
    const Icon = current.icon

    return (
      <button
        onClick={() => setTheme(next.value)}
        title={`Theme: ${current.label} — click to switch`}
        className="flex w-full justify-center rounded-xl px-0 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Icon className="h-5 w-5 shrink-0" />
      </button>
    )
  }

  // Expanded sidebar: segmented 3-way toggle
  return (
    <div className="px-3 py-2">
      <p className="mb-1.5 px-1 text-xs font-medium text-muted-foreground">Theme</p>
      <div className="flex rounded-lg border border-border bg-muted p-0.5">
        {themes.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            onClick={() => setTheme(value)}
            title={label}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-medium transition-colors",
              theme === value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}