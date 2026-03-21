import { cn } from "@/shared/lib/utils"

interface RatCatcherHatProps {
  className?: string
}

export function RatCatcherHat({ className }: RatCatcherHatProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-6", className)}
    >
      {/* Hat brim */}
      <ellipse cx="12" cy="18" rx="10" ry="2" />
      {/* Hat body */}
      <path d="M4 16 Q4 10 12 8 Q20 10 20 16 L18 16 Q18 12 12 10 Q6 12 6 16 Z" />
      {/* Feather */}
      <path d="M16 8 Q18 6 19 8 Q18 10 16 9 Z" />
      {/* Rat tail or something, optional */}
      <circle
        cx="12"
        cy="12"
        r="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
      />
    </svg>
  )
}
