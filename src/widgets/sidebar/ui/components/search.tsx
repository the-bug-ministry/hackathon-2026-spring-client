import { SearchIcon } from "lucide-react"
import { Input } from "@/shared/components/ui/input"

interface ApparatSearchProps {
  search: string
  onSearchChange: (value: string) => void
}

export const ApparatSearch = ({
  search,
  onSearchChange,
}: ApparatSearchProps) => {
  return (
    <div className="relative">
      <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Поиск аппаратов..."
        className="h-11 rounded-xl border-border/70 bg-background pl-10 shadow-sm transition focus-visible:ring-1"
      />
    </div>
  )
}
