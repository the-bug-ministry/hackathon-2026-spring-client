import type { Satellite } from './satellite.interface';

export interface SatelliteMap extends Satellite {
    tle1: string;
    tle2: string;
}