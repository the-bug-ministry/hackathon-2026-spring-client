import { getRouteApi } from '@tanstack/react-router';
import { TrackedSatellites } from './ui/tracked-satellites';

export function DashboardPage() {
    const route = getRouteApi('/_home/dashboard');
    const { satellites: selectedSatellitesStr } = route.useSearch();
    const navigate = route.useNavigate();

    const handleCloseSatellite = (satelliteId: string) => {
        navigate({
            search: (prev) => {
                const current = prev.satellites
                    ? prev.satellites.split(',').filter(Boolean)
                    : [];
                const next = current.filter((id) => id !== satelliteId);
                return {
                    ...prev,
                    satellites: next.join(','),
                };
            },
        });
    };

    return (
        <div className="absolute inset-0">
            {/* Карта - заполняет весь экран с небольшим margin */}
            <div className="absolute inset-0 m-2 rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 overflow-hidden">
                {/* Здесь будет карта Земли/2D карта */}
                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    Карта (2D Глобус)
                </div>
            </div>

            <TrackedSatellites
                selectedSatellitesStr={selectedSatellitesStr}
                handleClose={handleCloseSatellite}
            />
        </div>
    );
}