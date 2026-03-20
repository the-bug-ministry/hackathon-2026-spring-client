import { LoginPage } from '@/pages/login/login.page'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    beforeLoad: async ({ context: { auth } }) => {
        const user = await auth.ensureData().catch(() => null)

        if (auth.status === 'AUTHENTICATED') {
            throw redirect({
                to: '/dashboard/profile',
            })
        }
    },
    component: LoginPage,
})