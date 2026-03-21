import clsx from 'clsx';


type EarthGlobe3DProps = {
    className?: string;
};

export function EarthGlobe3D({
    className,

}: EarthGlobe3DProps) {

    return (
        <div className={clsx(
            "flex h-full w-full items-center justify-center bg-slate-950 text-muted-foreground",
            className
        )}>
            3D Глобус
        </div>
    )
}