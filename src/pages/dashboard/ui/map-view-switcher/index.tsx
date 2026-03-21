import { MapIcon, BoxIcon } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import type { MapViewMode } from '../../model/store';

type MapViewSwitcherProps = {
    value: MapViewMode;
    onValueChange: (value: MapViewMode) => void;
};

export function MapViewSwitcher({
    value,
    onValueChange,
}: MapViewSwitcherProps) {
    return (
        <div className="absolute left-6 top-10 z-30">
            <Tabs
                value={value}
                onValueChange={(next) => onValueChange(next as MapViewMode)}
                className="w-[240px]"
            >
                <TabsList
                    // className="
                    //     grid h-auto w-full grid-cols-1 gap-2
                    //     rounded-2xl border border-white/10
                    //     bg-slate-900/75 p-2
                    //     shadow-[0_12px_32px_rgba(0,0,0,0.28)]
                    //     backdrop-blur-xl
                    // "
                >
                    <TabsTrigger
                        value="2d"
                        className="
                            group h-12 w-full justify-start gap-3 rounded-xl
                            border border-transparent px-3
                            text-left text-base font-semibold
                            text-slate-300
                            transition-all duration-200

                            hover:bg-white/5 hover:text-white

                            data-[state=active]:border-white/10
                            data-[state=active]:bg-white/10
                            data-[state=active]:text-white
                            data-[state=active]:shadow-none
                        "
                    >
                        <div
                            className="
                                flex h-9 w-9 shrink-0 items-center justify-center
                                rounded-lg bg-white/5
                                transition-colors duration-200
                                group-hover:bg-white/10
                                group-data-[state=active]:bg-white/10
                            "
                        >
                            <MapIcon className="size-4" />
                        </div>

                        <span className="truncate">2D Карта</span>
                    </TabsTrigger>

                    <TabsTrigger
                        value="3d"
                        className="
                            group h-12 w-full justify-start gap-3 rounded-xl
                            border border-transparent px-3
                            text-left text-base font-semibold
                            text-slate-300
                            transition-all duration-200

                            hover:bg-primary/10 hover:text-primary

                            data-[state=active]:border-primary/20
                            data-[state=active]:bg-primary/12
                            data-[state=active]:text-primary
                            data-[state=active]:shadow-none
                        "
                    >
                        <div
                            className="
                                flex h-9 w-9 shrink-0 items-center justify-center
                                rounded-lg bg-white/5
                                transition-colors duration-200
                                group-hover:bg-primary/10
                                group-data-[state=active]:bg-primary/10
                            "
                        >
                            <BoxIcon className="size-4" />
                        </div>

                        <span className="truncate">3D Глобус</span>
                    </TabsTrigger>
                </TabsList>
            </Tabs>
        </div>
    );
}