"use client"

import type { Column, ColumnDef } from "@tanstack/react-table"
import {
  Calendar,
  CheckCircle2,
  Loader2Icon,
  Orbit,
  Radio,
  Satellite as SatelliteIcon,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import { useMemo } from "react"

import { useSatelliteCatalog } from "@/pages/dashboard/model/satellite-catalog-context"
import { DataTable } from "@/shared/components/data-table/data-table"
import { DataTableColumnHeader } from "@/shared/components/data-table/data-table-column-header"
import { DataTableToolbar } from "@/shared/components/data-table/data-table-toolbar"
import { Badge } from "@/shared/components/ui/badge"
import { useDataTable } from "@/shared/hooks/use-data-table"
import type { SatelliteMap } from "@/entities/satellite/model"

export function ListPage() {
  const {
    catalog: data,
    isLoading,
    isError,
    isMockSource,
    satelliteDataLayer,
  } = useSatelliteCatalog()

  const columns = useMemo<ColumnDef<SatelliteMap>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }: { column: Column<SatelliteMap, unknown> }) => (
          <DataTableColumnHeader column={column} label="Название" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<SatelliteMap["name"]>()

          return (
            <div className="flex items-center gap-2 font-medium text-slate-900 dark:text-white">
              <SatelliteIcon className="size-4 text-emerald-500" />
              <span>{value}</span>
            </div>
          )
        },
        meta: {
          label: "Название",
          placeholder: "Поиск спутника...",
          variant: "text",
          icon: Search,
        },
        enableColumnFilter: true,
      },
      {
        id: "desc",
        accessorKey: "desc",
        header: ({ column }: { column: Column<SatelliteMap, unknown> }) => (
          <DataTableColumnHeader column={column} label="Описание" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<SatelliteMap["desc"]>()

          return (
            <div className="max-w-[280px] truncate text-slate-600 dark:text-slate-300">
              {value}
            </div>
          )
        },
      },
      {
        id: "type",
        accessorKey: "type",
        header: ({ column }: { column: Column<SatelliteMap, unknown> }) => (
          <DataTableColumnHeader column={column} label="Орбита" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<SatelliteMap["type"]>()

          return (
            <Badge variant="outline" className="gap-1 rounded-full px-3">
              <Orbit className="size-3.5" />
              {value}
            </Badge>
          )
        },
        meta: {
          label: "Орбита",
          variant: "multiSelect",
          options: [
            { label: "LEO", value: "LEO", icon: Orbit },
            { label: "MEO", value: "MEO", icon: Orbit },
            { label: "GEO", value: "GEO", icon: Orbit },
            { label: "Polar", value: "Polar", icon: Orbit },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "status",
        accessorKey: "status",
        header: ({ column }: { column: Column<SatelliteMap, unknown> }) => (
          <DataTableColumnHeader column={column} label="Статус" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<SatelliteMap["status"]>()
          const isActive =
            value.toLowerCase() === "active" ||
            value.toLowerCase() === "активный" ||
            value.toLowerCase() === "online"

          const Icon = isActive ? CheckCircle2 : XCircle

          return (
            <Badge
              variant="outline"
              className="gap-1 rounded-full px-3 capitalize"
            >
              <Icon className="size-3.5" />
              {value}
            </Badge>
          )
        },
        meta: {
          label: "Статус",
          variant: "multiSelect",
          options: [
            { label: "Активный", value: "active", icon: CheckCircle2 },
            { label: "Неактивный", value: "inactive", icon: XCircle },
          ],
        },
        enableColumnFilter: true,
      },
      {
        id: "launchDate",
        accessorKey: "launchDate",
        header: ({ column }: { column: Column<SatelliteMap, unknown> }) => (
          <DataTableColumnHeader column={column} label="Дата запуска" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<SatelliteMap["launchDate"]>()

          return (
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <Calendar className="size-4 text-sky-500" />
              {value}
            </div>
          )
        },
      },
      {
        id: "operator",
        accessorKey: "operator",
        header: ({ column }: { column: Column<SatelliteMap, unknown> }) => (
          <DataTableColumnHeader column={column} label="Оператор" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<SatelliteMap["operator"]>()

          return (
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-violet-500" />
              <span>{value}</span>
            </div>
          )
        },
      },
      {
        id: "country",
        accessorKey: "country",
        header: ({ column }: { column: Column<SatelliteMap, unknown> }) => (
          <DataTableColumnHeader column={column} label="Страна" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<SatelliteMap["country"]>()

          return (
            <div className="flex items-center gap-2">
              <Radio className="size-4 text-emerald-500" />
              <span>{value}</span>
            </div>
          )
        },
      },
    ],
    []
  )

  const { table } = useDataTable({
    data,
    columns,
    pageCount: 1,
    initialState: {
      sorting: [{ id: "launchDate", desc: true }],
    },
    getRowId: (row) => row.id,
  })

  const subtitle = isMockSource
    ? "Локальные мок-данные (режим mock)."
    : satelliteDataLayer === "user"
      ? "Слой «Мои данные»"
      : "Слой «Демо»"

  return (
    <div className="flex h-full w-full flex-col gap-4 p-3 sm:gap-6 sm:p-6 md:p-10">
      <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-lg shadow-slate-200/40 backdrop-blur sm:sticky sm:top-2 sm:z-10 sm:p-6 dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-slate-950/40">
        <h1 className="mb-2 text-xl font-bold text-slate-900 sm:text-2xl dark:text-white">
          База данных спутников
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Справочник для просмотра.{" "}
          {isLoading ? (
            <span className="inline-flex items-center gap-1">
              <Loader2Icon className="size-3.5 animate-spin" />
              Загрузка…
            </span>
          ) : (
            <>
              Записей: {data.length}. {subtitle}
            </>
          )}
        </p>
      </div>

      {isError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
          Не удалось загрузить каталог. Проверьте сеть и попробуйте позже.
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/85 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-slate-950/40">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-2 sm:p-4 md:p-6">
          <DataTable
            table={table}
            className="min-h-0 flex-1 text-xs sm:text-sm"
          >
            <DataTableToolbar table={table} />
          </DataTable>
        </div>
      </div>
    </div>
  )
}
