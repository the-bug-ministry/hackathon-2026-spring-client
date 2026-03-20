import { SatellitesMenuList } from '@/entities/satellite/ui/satellites-list'
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/shared/components/ui/sidebar'
import { useLocation } from '@tanstack/react-router'
import { Orbit } from 'lucide-react'

export const AppSidebar = () => {

    const location = useLocation();

    return (
        <Sidebar variant='sidebar' collapsible='icon'>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton>
                                    <Orbit className="w-6 h-6" />
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                {location.pathname === '/dashboard' && <SatellitesMenuList />}
            </SidebarContent>
        </Sidebar>
    )
}