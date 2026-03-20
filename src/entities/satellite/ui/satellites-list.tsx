import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/shared/components/ui/sidebar';

import { satellitesMock } from '../model/satellites-mock';

import { getRouteApi } from '@tanstack/react-router';
import { getIconByType, getTypeColor } from '../lib';

export const SatellitesMenuList = () => {

    const route = getRouteApi('/_home/dashboard/');

    const navigate = route.useNavigate();

    const { satellites } = route.useSearch();
    const selectedIds = satellites ? satellites.split(',').filter(Boolean) : [];

    console.log(selectedIds)

    const toggleSatellite = (id: string) => {
        navigate({
            search: (prev) => {
                const current = prev.satellites
                    ? prev.satellites.split(',').filter(Boolean)
                    : [];

                const next = current.includes(id)
                    ? current.filter((item) => item !== id)
                    : [...current, id];

                return {
                    ...prev,
                    satellites: next.join(','),
                };
            },
        });
    };

    return (
        <SidebarGroup>
            <SidebarGroupLabel className="mb-2 text-sm font-semibold tracking-wide text-muted-foreground">
                Спутники
            </SidebarGroupLabel>

            <SidebarGroupContent className='overflow-auto max-h-[calc(100dvh-220px)]'>
                <SidebarMenu className="space-y-2">
                    {satellitesMock.map(({ id, name, desc, type }) => {
                        const Icon = getIconByType(type);
                        const isSelected = selectedIds.includes(id);

                        return (
                            <SidebarMenuItem key={id}>
                                <SidebarMenuButton
                                    tooltip={name}
                                    onClick={() => toggleSatellite(id)}
                                    className={`
                                        group h-auto w-full rounded-2xl border p-0 transition-all duration-200
                                        ${isSelected
                                            ? 'border-primary/30 bg-primary/10 shadow-sm'
                                            : 'border-transparent bg-transparent hover:border-border hover:bg-muted/60'
                                        }
                                    `}
                                >
                                    <div className="flex w-full items-center gap-3 px-2 py-2">
                                        <div
                                            className={`
                                                flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all
                                                ${isSelected
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                                                }
                                            `}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>

                                        <div className="min-w-0 flex-1 text-left">
                                            <div
                                                className={`
                                                    truncate text-sm font-semibold transition-colors
                                                    ${isSelected
                                                        ? 'text-foreground'
                                                        : 'text-foreground/90 group-hover:text-foreground'
                                                    }
                                                `}
                                            >
                                                {name}
                                            </div>

                                            <div
                                                className={`
                                                    mt-0.5 truncate text-xs transition-colors
                                                    ${isSelected
                                                        ? 'text-muted-foreground'
                                                        : 'text-muted-foreground/90'
                                                    }
                                                `}
                                            >
                                                {desc}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 items-center gap-2">
                                            {isSelected && (
                                                <div className="h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_12px_rgba(59,130,246,0.55)]" />
                                            )}

                                            <span
                                                className={`
                                                    rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-wide
                                                    ${getTypeColor(type)}
                                                    ${isSelected ? 'ring-1 ring-inset ring-white/10' : ''}
                                                `}
                                            >
                                                {type}
                                            </span>
                                        </div>
                                    </div>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};
