import {
  Sidebar,
  SidebarGroup,
} from "@/shared/components/ui/sidebar"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"
import { ApparatSearch } from "./components/search"
import { ApparatFilter } from "./components/filter"
import { useSatelliteCatalog } from "@/pages/dashboard/model/satellite-catalog-context"
import type { SatelliteDataLayer } from "@/pages/dashboard/model/satellite-catalog-context"

export const SatellitesMenuList = () => {
  const {
    search,
    setSearch,
    orbit,
    setOrbit,
    country,
    setCountry,
    mission,
    setMission,
    catalog,
    isLoading,
    isError,
    isMockSource,
    satelliteDataLayer,
    setSatelliteDataLayer,
    userLayerEnabled,
  } = useSatelliteCatalog()

  return (
    <SidebarGroup className="gap-0 py-3">
      <div className="space-y-4 px-2 pb-4">
        {!isMockSource && (
          <Tabs
            value={satelliteDataLayer}
            onValueChange={(v) =>
              setSatelliteDataLayer(v as SatelliteDataLayer)
            }
            className="w-full"
          >
            <TabsList
              className="grid w-full grid-cols-2 gap-0 rounded-3xl p-[3px]"
              variant="default"
            >
              <TabsTrigger value="demo" className="rounded-2xl text-xs">
                Демо
              </TabsTrigger>
              <TabsTrigger
                value="user"
                disabled={!userLayerEnabled}
                className="rounded-2xl text-xs"
                title={
                  userLayerEnabled
                    ? undefined
                    : "Скоро: спутники из ваших загруженных TLE"
                }
              >
                Мои данные
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <ApparatSearch search={search} onSearchChange={setSearch} />

        <ApparatFilter
          orbit={orbit}
          onOrbitChange={setOrbit}
          country={country}
          onCountryChange={setCountry}
          mission={mission}
          onMissionChange={setMission}
        />

        <div className="space-y-2 px-1 text-xs text-muted-foreground">
          <p>
            {isMockSource ? (
              <span className="font-medium text-foreground">Режим моков</span>
            ) : (
              <span className="font-medium text-foreground">
                Данные с сервера
              </span>
            )}
            {isLoading && " · загрузка…"}
            {isError && " · не удалось загрузить"}
          </p>
          <p>
            На карте:{" "}
            <span className="font-medium text-foreground">
              {isLoading && !isMockSource ? "…" : catalog.length}
            </span>{" "}
            объектов
          </p>
          <p className="leading-relaxed">Выбирайте объекты на карте кликом</p>
          <p className="leading-relaxed">Отслеживайте — в панели справа</p>
        </div>
      </div>
    </SidebarGroup>
  )
}

export const AppSidebar = () => {
  return (
    <Sidebar className="flex flex-col">
      <SatellitesMenuList />
    </Sidebar>
  )
}
