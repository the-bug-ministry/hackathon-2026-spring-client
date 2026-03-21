import { ProfilePage } from "@/pages/profile/profile.page"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_home/dashboard/profile")({
  beforeLoad: async ({ context: { auth } }) => {
    await auth.ensureData().catch(() => null)

    if (auth.status !== "AUTHENTICATED") {
      throw redirect({
        to: "/login",
        search: { redirect: "/dashboard/profile" },
      })
    }
  },
  component: ProfilePage,
})
