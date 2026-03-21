import { ListPage } from "@/pages/list/list.page"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_home/dashboard/list")({
  beforeLoad: async ({ context: { auth } }) => {
    await auth.ensureData().catch(() => null)

    if (auth.status !== "AUTHENTICATED") {
      throw redirect({
        to: "/login",
        search: { redirect: "/dashboard/list" },
      })
    }
  },
  component: ListPage,
})
