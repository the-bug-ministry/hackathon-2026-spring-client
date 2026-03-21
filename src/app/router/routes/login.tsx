import { LoginPage } from "@/pages/login/login.page"
import { createFileRoute, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/login")({
  beforeLoad: async ({ context: { auth } }) => {
    await auth.ensureData().catch(() => null)

    if (auth.status === "AUTHENTICATED") {
      throw redirect({
        to: "/dashboard",
        search: { satellites: "" },
      })
    }
  },
  component: LoginPage,
})
