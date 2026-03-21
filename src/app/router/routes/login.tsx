import { LoginPage } from "@/pages/login/login.page"
import { createFileRoute, redirect } from "@tanstack/react-router"
import { z } from "zod"

const loginSearchSchema = z.object({
  redirect: z.enum(["/dashboard/list", "/dashboard/profile"]).optional(),
})

export const Route = createFileRoute("/login")({
  validateSearch: (search) => loginSearchSchema.parse(search),
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
