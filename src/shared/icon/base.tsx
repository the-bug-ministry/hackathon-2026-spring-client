import { type ComponentPropsWithoutRef, useId } from "react"

import { PROJECT_NAME } from "../config/site"

type LogoIconSize = "sm" | "md" | "lg"

const sizeMap: Record<LogoIconSize, { width: number; height: number }> = {
  sm: { width: 112, height: 32 },
  md: { width: 144, height: 40 },
  lg: { width: 176, height: 48 },
}

type LogoIconProps = ComponentPropsWithoutRef<"svg"> & {
  size?: LogoIconSize
}

export const LogoIcon = ({ size = "md", className, ...props }: LogoIconProps) => {
  const gradientId = useId()
  const { width, height } = sizeMap[size]

  const primary = "var(--sidebar-primary)"
  const accent = "var(--sidebar-accent)"
  const border = "var(--sidebar-border)"
  const foreground = "var(--sidebar-foreground)"

  return (
    <svg
      role="img"
      aria-label={`${PROJECT_NAME} логотип`}
      width={width}
      height={height}
      viewBox="0 0 320 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ color: foreground }}
      {...props}
    >
      <defs>
        <linearGradient id={gradientId} x1="20" y1="20" x2="90" y2="90" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={primary} />
          <stop offset="100%" stopColor={accent} />
        </linearGradient>
      </defs>

      <g transform="translate(10 10)">
        <circle cx="40" cy="40" r="26" stroke={`url(#${gradientId})`} strokeWidth="6" />
        <ellipse
          cx="40"
          cy="40"
          rx="34"
          ry="12"
          transform="rotate(-25 40 40)"
          stroke={border}
          strokeWidth="3"
        />
        <circle cx="67" cy="24" r="4" fill={accent} />
      </g>

      <text
        x="95"
        y="58"
        fill="currentColor"
        fontFamily="DM Sans, Inter, Arial, sans-serif"
        fontSize="36"
        fontWeight="700"
      >
        {PROJECT_NAME}
      </text>
    </svg>
  )
}
