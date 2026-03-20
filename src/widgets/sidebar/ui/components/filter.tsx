import { FilterIcon } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/shared/components/ui/select';

interface ApparatFilterProps {
    orbit: string;
    onOrbitChange: (value: string) => void;
    country: string;
    onCountryChange: (value: string) => void;
    mission: string;
    onMissionChange: (value: string) => void;
}

export const ApparatFilter = ({
    orbit,
    onOrbitChange,
    country,
    onCountryChange,
    mission,
    onMissionChange,
}: ApparatFilterProps) => {
    return (
        <div className="space-y-3 rounded-2xl border border-border/70 bg-card/60 p-3 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <FilterIcon className="size-4 shrink-0" />
                <span>Фильтры</span>
            </div>

            <Select value={orbit} onValueChange={onOrbitChange}>
                <SelectTrigger className="h-10 w-full rounded-xl">
                    <SelectValue placeholder="Все орбиты" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Все орбиты</SelectItem>
                    <SelectItem value="leo">LEO</SelectItem>
                    <SelectItem value="meo">MEO</SelectItem>
                    <SelectItem value="geo">GEO</SelectItem>
                    <SelectItem value="polar">Polar</SelectItem>
                </SelectContent>
            </Select>

            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
                <Select value={country} onValueChange={onCountryChange}>
                    <SelectTrigger className="h-10 w-full min-w-0 rounded-xl">
                        <SelectValue placeholder="Все страны" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все страны</SelectItem>
                        <SelectItem value="usa">USA</SelectItem>
                        <SelectItem value="eu">EU</SelectItem>
                        <SelectItem value="china">China</SelectItem>
                        <SelectItem value="japan">Japan</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={mission} onValueChange={onMissionChange}>
                    <SelectTrigger className="h-10 w-full min-w-0 rounded-xl">
                        <SelectValue placeholder="Все цели" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все цели</SelectItem>
                        <SelectItem value="observation">Observation</SelectItem>
                        <SelectItem value="weather">Weather</SelectItem>
                        <SelectItem value="communication">Communication</SelectItem>
                        <SelectItem value="navigation">Navigation</SelectItem>
                        <SelectItem value="science">Science</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}