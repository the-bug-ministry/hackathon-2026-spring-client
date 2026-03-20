import type { AuthData } from '@/entities/auth/lib/use-auth'
import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

type RouterContext = {
    queryClient: QueryClient,
    auth: AuthData,
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
})


function RootComponent() {
    return (
        <Outlet />
    )
}