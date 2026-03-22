import { Button } from "@/shared/components/ui/button"
import { SidebarTrigger } from "@/shared/components/ui/sidebar"
import { Swap, SwapOff, SwapOn } from "@/shared/components/ui/swap"
import { Link, useRouterState } from "@tanstack/react-router"
import { MoonIcon, SunIcon } from "lucide-react"
import { Separator } from "@/shared/components/ui/separator"
import { useEffect, useState } from "react"

import { cn } from "@/shared/lib/utils"
import { ChevronRightIcon, Globe, LogIn, SatelliteIcon } from "lucide-react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"
import { useAuth } from "@/entities/auth/lib/use-auth"
import { LogoIcon } from "@/shared/icon/base"

const navBtnClass = cn(
  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium",
  "text-sidebar-foreground transition-colors"
)

type HeaderUserProfileProps = {
  isActive: boolean
  variant?: "full" | "compact"
}

function HeaderUserProfile({ isActive, variant = "full" }: HeaderUserProfileProps) {
  const { account, status } = useAuth()

  if (status === "PENDING") {
    return (
      <div
        className="flex max-w-[220px] items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/25 px-2 py-1.5"
        aria-hidden
      >
        <div className="h-7 w-7 shrink-0 animate-pulse rounded-lg bg-sidebar-accent/50" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="h-3.5 w-28 max-w-full animate-pulse rounded bg-sidebar-accent/50" />
          <div className="h-3 w-16 animate-pulse rounded bg-sidebar-accent/40" />
        </div>
      </div>
    )
  }

  if (status === "UNAUTHENTICATED") {
    return (
      <Button asChild variant="ghost" className="h-8 min-w-0 px-2">
        <Link
          to="/login"
          className={cn(
            navBtnClass,
            "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <LogIn className="size-3.5 shrink-0" aria-hidden />
          Войти
        </Link>
      </Button>
    )
  }

  if (!account) {
    return null
  }

  const initials =
    `${account.firstName?.[0] || ""}${account.lastName?.[0] || ""}`.toUpperCase() ||
    account.username[0].toUpperCase()

  const displayName =
    `${account.firstName} ${account.lastName}`.trim() || account.username

  const cardClass = cn(
    "flex max-w-[260px] min-w-0 items-center gap-2 rounded-xl border border-sidebar-border bg-sidebar-accent/35 px-2 py-1 transition-colors",
    "text-sidebar-foreground",
    !isActive &&
    "group hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar focus-visible:outline-none",
    isActive && "cursor-default border-sidebar-border/80 bg-sidebar-accent/50"
  )

  if (variant === "compact") {
    const buttonClass = cn(
      "inline-flex h-10 w-10 items-center justify-center rounded-full border border-sidebar-border/80 bg-sidebar-accent/30 text-sidebar-foreground transition-colors shadow-sm",
      !isActive &&
      "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar focus-visible:outline-none",
      isActive && "cursor-default border-sidebar-border/70 bg-sidebar-accent/60"
    )

    const avatar = (
      <Avatar className="h-8 w-8 shrink-0 border border-sidebar-border bg-sidebar">
        <AvatarImage src={account.image} alt="" />
        <AvatarFallback className="bg-sidebar-accent text-[10px] font-semibold text-sidebar-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
    )

    if (isActive) {
      return (
        <div
          className={buttonClass}
          aria-current="page"
          aria-label={`Текущая страница: профиль, ${displayName}`}
        >
          {avatar}
        </div>
      )
    }

    return (
      <Link
        to="/dashboard/profile"
        aria-label={`Профиль: ${displayName}`}
        className={cn(buttonClass, "cursor-pointer")}
      >
        {avatar}
      </Link>
    )
  }

  const body = (
    <>
      <Avatar className="h-7 w-7 shrink-0 border border-sidebar-border">
        <AvatarImage src={account.image} alt="" />
        <AvatarFallback className="bg-sidebar-accent text-[10px] font-semibold text-sidebar-foreground">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm leading-tight font-semibold">
          {displayName}
        </span>
        <span
          className={cn(
            "mt-0.5 block text-[11px] font-medium text-sidebar-foreground/80",
            !isActive &&
            "underline-offset-2 group-hover:text-sidebar-accent-foreground group-hover:underline"
          )}
        >
          Профиль
        </span>
      </span>
      {!isActive && (
        <ChevronRightIcon
          className="size-4 shrink-0 text-sidebar-foreground/70 transition-transform group-hover:translate-x-0.5 group-hover:text-sidebar-accent-foreground"
          aria-hidden
        />
      )}
    </>
  )

  if (isActive) {
    return (
      <div
        className={cardClass}
        aria-current="page"
        aria-label={`Текущая страница: профиль, ${displayName}`}
      >
        {body}
      </div>
    )
  }

  return (
    <Link
      to="/dashboard/profile"
      aria-label={`Профиль: ${displayName}`}
      className={cn(cardClass, "cursor-pointer")}
    >
      {body}
    </Link>
  )
}

const THEME_KEY = "theme"

type Theme = "dark" | "light"

export const AppHeader = () => {
  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  })
  const pathNorm = pathname.replace(/\/$/, "") || "/"
  const isMapActive = pathNorm === "/dashboard"
  const isListActive = pathNorm === "/dashboard/list"
  const isProfileActive = pathNorm === "/dashboard/profile"

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
  const themeSwitchClasses = cn(
    "size-8 rounded-lg border border-sidebar-border bg-sidebar-accent/40 text-sidebar-foreground shadow-sm transition-colors duration-200",
    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
    "focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar focus-visible:outline-none"
  )
  return (
    <header className="sticky top-0 z-30 flex w-full items-center border-b border-sidebar-border/60 bg-sidebar/95 px-2.5 py-2 text-sidebar-foreground backdrop-blur-md shadow-sm">
      <div className="flex w-full items-center gap-2 sm:gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="h-9 w-9 shrink-0 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg" />
          <LogoIcon size="sm" className="shrink-0 text-sidebar-foreground block sm:hidden" />
          <LogoIcon size="md" className="shrink-0 text-sidebar-foreground hidden sm:block" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-end items-center gap-2 overflow-x-auto pb-1 pr-1 sm:gap-3 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {isMapActive ? (
              <span
                className={cn(
                  navBtnClass,
                  "cursor-default bg-sidebar-accent/60"
                )}
                aria-current="page"
              >
                <Globe className="size-4 shrink-0" aria-hidden />
                Карта
              </span>
            ) : (
              <Button asChild variant="ghost" className="h-9 min-w-0 px-0">
                <Link
                  to="/dashboard"
                  search={{ satellites: "" }}
                  className={cn(
                    navBtnClass,
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Globe className="size-4 shrink-0" aria-hidden />
                  Карта
                </Link>
              </Button>
            )}

            {isListActive ? (
              <span
                className={cn(
                  navBtnClass,
                  "cursor-default bg-sidebar-accent/60"
                )}
                aria-current="page"
              >
                <SatelliteIcon className="size-4 shrink-0" aria-hidden />
                Спутники
              </span>
            ) : (
              <Button asChild variant="ghost" className="h-9 min-w-0 px-0">
                <Link
                  to="/dashboard/list"
                  className={cn(
                    navBtnClass,
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <SatelliteIcon className="size-4 shrink-0" aria-hidden />
                  Спутники
                </Link>
              </Button>
            )}

            <div className="hidden sm:flex">
              <Separator
                orientation="vertical"
                className="mx-1 h-10 self-center bg-sidebar-border"
              />
              <HeaderUserProfile isActive={isProfileActive} variant="full" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Swap
            role="button"
            onClick={toggleTheme}
            aria-label={`Переключить на ${isDarkTheme ? "светлую" : "тёмную"} тему`}
            className={cn(themeSwitchClasses, "hidden sm:inline-flex")}
          >
            <SwapOff>
              <MoonIcon className="size-5" />
            </SwapOff>

            <SwapOn>
              <SunIcon className="size-5" />
            </SwapOn>
          </Swap>
          <div className="sm:hidden">
            <HeaderUserProfile isActive={isProfileActive} variant="compact" />
          </div>
        </div>
      </div>
    </header>
  )
}
