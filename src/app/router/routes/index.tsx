import { createFileRoute, redirect } from "@tanstack/react-router"

/** При открытии `/` сразу показываем дашборд (карту). */
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({
      to: "/dashboard",
      search: { satellites: "" },
    })
  },
})
