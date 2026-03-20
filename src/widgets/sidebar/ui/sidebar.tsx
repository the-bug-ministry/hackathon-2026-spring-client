import { useMemo, useState } from 'react';
import {
    Sidebar,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/shared/components/ui/sidebar';
import { Separator } from '@/shared/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';

import { getRouteApi, Link } from '@tanstack/react-router';
import { satellitesMock } from '@/entities/satellite/model';
import { getIconByType, getTypeColor } from '@/entities/satellite/lib';
import { useAuth } from '@/entities/auth/lib/use-auth';
import { ApparatSearch } from './components/search';
import { ApparatFilter } from './components/filter';
import { ChevronRightIcon, ShieldCheckIcon } from 'lucide-react';

export const SatellitesMenuList = () => {
    const route = getRouteApi('/_home/dashboard');
    const navigate = route.useNavigate();

    const { satellites } = route.useSearch();
    const selectedIds = satellites ? satellites.split(',').filter(Boolean) : [];

    const [search, setSearch] = useState('');
    const [orbit, setOrbit] = useState('all');
    const [country, setCountry] = useState('all');
    const [mission, setMission] = useState('all');

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

    const filteredSatellites = useMemo(() => {
        return satellitesMock.filter((satellite) => {
            const matchesSearch =
                satellite.name.toLowerCase().includes(search.toLowerCase()) ||
                satellite.desc.toLowerCase().includes(search.toLowerCase());

            const matchesOrbit =
                orbit === 'all' || satellite.type.toLowerCase() === orbit.toLowerCase();

            const matchesCountry =
                country === 'all' ||
                (satellite.country &&
                    satellite.country.toLowerCase() === country.toLowerCase());

            const matchesMission =
                mission === 'all' ||
                (satellite.mission &&
                    satellite.mission.toLowerCase() === mission.toLowerCase());

            return matchesSearch && matchesOrbit && matchesCountry && matchesMission;
        });
    }, [search, orbit, country, mission]);

    return (
        <SidebarGroup className="gap-0">
            <div className="space-y-4 px-2 pb-4">
                <SidebarGroupLabel className="px-0 text-sm font-semibold tracking-wide text-foreground">
                    Спутники
                </SidebarGroupLabel>

                <ApparatSearch search={search} onSearchChange={setSearch} />

                <ApparatFilter
                    orbit={orbit}
                    onOrbitChange={setOrbit}
                    country={country}
                    onCountryChange={setCountry}
                    mission={mission}
                    onMissionChange={setMission}
                />

                <div className="px-1 text-sm font-medium text-muted-foreground">
                    Отображено: {filteredSatellites.length}
                </div>
            </div>

            <Separator />

            <SidebarGroupContent className="max-h-[calc(100dvh-380px)] overflow-auto px-2 pt-4">
                <SidebarMenu className="space-y-2">
                    {filteredSatellites.map(({ id, name, desc, type }) => {
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
                                    <div className="flex w-full items-center gap-3 px-2 py-2.5">
                                        <div
                                            className={`
                                                flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all
                                                ${isSelected
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
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

                    {filteredSatellites.length === 0 && (
                        <div className="rounded-2xl border border-dashed p-6 text-center">
                            <div className="text-sm font-medium text-foreground">
                                Ничего не найдено
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                Попробуй изменить параметры поиска или фильтры
                            </div>
                        </div>
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
};

const SidebarUserCard = () => {
    const { account, status } = useAuth();

    if (status === 'PENDING' || !account) {
        return (
            <div className="p-2">
                <div className="rounded-2xl border border-border/70 bg-card/70 p-3 shadow-sm backdrop-blur">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
                        <div className="min-w-0 flex-1 space-y-2">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const initials = `${account.firstName?.[0] || ''}${account.lastName?.[0] || ''}`.toUpperCase() || account.username[0].toUpperCase();

    return (
        <div className="p-2">
            <div className="rounded-2xl border border-border/70 bg-card/70 p-3 shadow-sm backdrop-blur">
                <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={account.image} alt={`${account.firstName} ${account.lastName}`} />
                        <AvatarFallback className="text-xs font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-semibold text-foreground">
                            {account.firstName} {account.lastName}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                            {account.email}
                        </div>

                        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-[10px] font-medium text-primary">
                            <ShieldCheckIcon className="size-3" />
                            Пользователь
                        </div>
                    </div>
                </div>

                <div className="mt-3">
                    <Button
                        asChild
                        variant="ghost"
                        className="h-9 w-full justify-between rounded-xl border border-border/60 bg-background/50 px-3 hover:bg-accent"
                    >
                        <Link to="/dashboard/profile">
                            Профиль
                            <ChevronRightIcon className="size-4" />
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const AppSidebar = () => {
    return (
        <Sidebar className="flex flex-col">
            <div className="min-h-0 flex-1">
                <SatellitesMenuList />
            </div>

            <Separator />

            <SidebarUserCard />
        </Sidebar>
    );
};