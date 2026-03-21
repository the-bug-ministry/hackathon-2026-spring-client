import { QueryClientProvider } from "@tanstack/react-query"
import { RouterProvider } from "@tanstack/react-router"
import { queryClient, router } from "./router/router"
import "@/app/styles/index.css"
import { useAuth } from "@/entities/auth/lib/use-auth"
import { useEffect } from "react"

function AppInner() {
  const auth = useAuth()

  useEffect(() => {
    router.invalidate()
  }, [auth.status, auth?.account])

  return <RouterProvider router={router} context={{ auth }} />
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}

export default App
