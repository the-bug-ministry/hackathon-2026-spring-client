import { Button } from '@/shared/components/ui/button';
import { SidebarTrigger } from '@/shared/components/ui/sidebar'
import { Swap, SwapOff, SwapOn } from '@/shared/components/ui/swap'
import { Link } from '@tanstack/react-router';
import { MoonIcon, SunIcon } from 'lucide-react'
import { Separator } from '@/shared/components/ui/separator';
import { useEffect, useState } from 'react';

import {
    Globe,
    SatelliteIcon,
    UserIcon
} from 'lucide-react';

const THEME_KEY = 'theme';

type Theme = 'dark' | 'light';


export const AppHeader = () => {
    const [theme, setTheme] = useState<Theme>('light');

    useEffect(() => {
        const savedTheme = localStorage.getItem(THEME_KEY) as Theme | null;
        const isDark = savedTheme === 'dark';

        document.documentElement.classList.toggle('dark', isDark);
        setTheme(isDark ? 'dark' : 'light');
    }, []);

    const toggleTheme = () => {
        const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

        setTheme(nextTheme);
        localStorage.setItem(THEME_KEY, nextTheme);
        document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    };

    return (
        <header className='w-full h-12 bg-sidebar absolute z-20'>
            <div className='flex items-center justify-between px-2 h-full gap-4'>
                <div className='flex items-center gap-4'>
                    <SidebarTrigger />
                    <span>Виток</span>
                </div>

                <div className='flex items-center gap-8'>
                    <div className='flex items-center gap-4'>
                        <Button asChild>
                            <Link
                                to="/dashboard"
                                search={{ satellites: '' }}
                                className="flex items-center gap-2"
                            >
                                <Globe className="size-4" />
                                Карта
                            </Link>
                        </Button>

                        <Button asChild>
                            <Link
                                to="/dashboard/list"
                                className="flex items-center gap-2"
                            >
                                <SatelliteIcon className="size-4" />
                                Спутники
                            </Link>
                        </Button>

                        <Separator orientation="vertical" />

                        <Button asChild>
                            <Link
                                to="/dashboard/profile"
                                className="flex items-center gap-2"
                            >
                                <UserIcon className="size-4" />
                                Профиль
                            </Link>
                        </Button>
                    </div>

                    <Swap
                        onClick={toggleTheme}
                        className="size-8 rounded-lg border bg-muted/50 transition-colors hover:bg-muted"
                    >
                        {theme === 'dark' ? (
                            <SwapOn>
                                <SunIcon className="size-5 text-white" />
                            </SwapOn>
                        ) : (
                            <SwapOff>
                                <MoonIcon className="size-5 text-white" />
                            </SwapOff>
                        )}
                    </Swap>
                </div>
            </div>
        </header>
    )
}