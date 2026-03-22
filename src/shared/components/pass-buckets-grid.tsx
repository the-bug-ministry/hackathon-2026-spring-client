import { cn } from "@/shared/lib/utils"
import {
  RECENT_WINDOW_MIN,
  UPCOMING_WINDOW_MIN,
  type PassBuckets,
} from "@/entities/satellite/lib/satellite-point-passes"

export function PassBucketsGrid({ passes }: { passes: PassBuckets }) {
  return (
    <div className="mt-2 grid grid-cols-3 gap-1">
      {[
        {
          title: "Сейчас",
          items: passes.current,
          accent:
            "bg-emerald-400/20 text-emerald-100 border-emerald-300/40",
        },
        {
          title: `Недавно (≤${RECENT_WINDOW_MIN} мин)`,
          items: passes.recent.slice(0, 5),
          accent: "bg-sky-400/15 text-sky-50 border-sky-300/40",
        },
        {
          title: `Скоро (≤${UPCOMING_WINDOW_MIN} мин)`,
          items: passes.upcoming.slice(0, 5),
          accent:
            "bg-amber-400/15 text-amber-100 border-amber-300/40",
        },
      ].map((section) => (
        <div
          key={section.title}
          className="flex flex-col gap-0.5 rounded-xl border border-white/10 bg-white/5 p-1"
        >
          <div className="flex items-center justify-between text-[9px] text-white/70">
            <span>{section.title}</span>
            <span>{section.items.length}</span>
          </div>
          <div className="flex flex-wrap gap-0.5">
            {section.items.length ? (
              section.items.map((item) => (
                <span
                  key={item.id}
                  className={cn(
                    "rounded-full border px-1 py-[2px] text-[9px] leading-none",
                    section.accent
                  )}
                >
                  {item.name}
                  {typeof item.offsetMinutes === "number" &&
                    item.offsetMinutes !== 0 && (
                      <span className="text-white/60">
                        {" "}
                        {item.offsetMinutes > 0
                          ? `${item.offsetMinutes} м.`
                          : `${Math.abs(item.offsetMinutes)} м.`}
                      </span>
                    )}
                </span>
              ))
            ) : (
              <span className="text-white/50">Нет</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
