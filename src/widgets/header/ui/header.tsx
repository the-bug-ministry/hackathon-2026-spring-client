import { Button } from "@/shared/components/ui/button"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import { Swap, SwapOff, SwapOn } from "@/shared/components/ui/swap"
import { Link } from "@tanstack/react-router"
import { MoonIcon, SunIcon } from "lucide-react"
import { Separator } from "@/shared/components/ui/separator"
import { useEffect, useState } from "react"

import { cn } from "@/shared/lib/utils"
import { Globe, SatelliteIcon, UserIcon } from "lucide-react"
import { PROJECT_NAME } from "@/shared/config/site"

const THEME_KEY = "theme"

type Theme = "dark" | "light"

export const AppHeader = () => {
  const [theme, setTheme] = useState<Theme>("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null
    const isDark = savedTheme === "dark"

    document.documentElement.classList.toggle("dark", isDark)
    setTheme(isDark ? "dark" : "light")
  }, [])

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark"

    setTheme(nextTheme)
    localStorage.setItem(THEME_KEY, nextTheme)
    document.documentElement.classList.toggle("dark", nextTheme === "dark")
  }

  const isDarkTheme = theme === "dark"
  const switchClasses = cn(
    "size-8 rounded-lg border transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
    isDarkTheme
      ? "border-slate-600 bg-slate-900/70 text-white hover:bg-slate-900/90 shadow-lg shadow-slate-950/50"
      : "border-slate-200 bg-white/80 text-slate-900 hover:bg-slate-100 shadow-sm shadow-slate-950/20"
  )
  return (
    <header className="absolute z-20 h-12 w-full bg-sidebar">
      <div className="flex h-full items-center justify-between gap-4 px-2">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <span>{PROJECT_NAME}</span>
        </div>

        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <Button asChild>
              <Link
                to="/dashboard"
                search={{ satellites: "" }}
                className="flex items-center gap-2"
              >
                <Globe className="size-4" />
                Карта
              </Link>
            </Button>

            <Button asChild>
              <Link to="/dashboard/list" className="flex items-center gap-2">
                <SatelliteIcon className="size-4" />
                Спутники
              </Link>
            </Button>

            <Separator orientation="vertical" />

            <Button asChild>
              <Link to="/dashboard/profile" className="flex items-center gap-2">
                <UserIcon className="size-4" />
                Профиль
              </Link>
            </Button>
          </div>

          <Swap
            role="button"
            onClick={toggleTheme}
            aria-label={`Переключить на ${isDarkTheme ? "светлую" : "тёмную"} тему`}
            className={switchClasses}
          >
            <SwapOff>
              <MoonIcon className="size-5 text-foreground" />
            </SwapOff>

            <SwapOn>
              <SunIcon className="size-5 text-foreground" />
            </SwapOn>
          </Swap>
        </div>
      </div>
    </header>
  )
}
