import { GravityStarsBackground } from '@/shared/components/animate-ui/gravity-stars'
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar'
import { AppHeader } from '@/widgets/header'
import { AppSidebar } from '@/widgets/sidebar'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'

export const Route = createFileRoute('/_home/dashboard')({
  component: RouteComponent,
  beforeLoad: () => {
    console.log('До загрузки ')
  }
})

function RouteComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppHeader />
        <div className='px-2 pt-14 h-ful w-full absolute inset-0 z-10'>

          <Outlet />

          <Toaster />
        </div>

      </SidebarInset>
      <GravityStarsBackground className="absolute inset-0 z-0 flex items-center justify-center rounded-xl" />
    </SidebarProvider>
  )
}
