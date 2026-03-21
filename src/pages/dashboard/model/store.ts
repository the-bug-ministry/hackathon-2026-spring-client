import { create } from "zustand"

export type MapViewMode = "2d" | "3d"

type MapViewStore = {
  mapView: MapViewMode
  setMapView: (value: MapViewMode) => void
  toggleMapView: () => void
}

export const useMapViewStore = create<MapViewStore>((set) => ({
  mapView: "2d",
  setMapView: (value) => set({ mapView: value }),
  toggleMapView: () =>
    set((state) => ({
      mapView: state.mapView === "2d" ? "3d" : "2d",
    })),
}))
