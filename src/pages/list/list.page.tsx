"use client"

import type { Column, ColumnDef } from "@tanstack/react-table"
import {
  Calendar,
  CheckCircle2,
  MoreHorizontal,
  Orbit,
  Radio,
  Satellite as SatelliteIcon,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react"

import { satellitesMock } from "@/entities/satellite/model/mock/satellites-mock"
import { DataTable } from "@/shared/components/data-table/data-table"
import { DataTableColumnHeader } from "@/shared/components/data-table/data-table-column-header"
import { DataTableToolbar } from "@/shared/components/data-table/data-table-toolbar"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Checkbox } from "@/shared/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu"
import { useDataTable } from "@/shared/hooks/use-data-table"
import type { Satellite } from "@/entities/satellite/model"
import { useMemo } from "react"

export function ListPage() {
  const data = useMemo(() => satellitesMock as Satellite[], [])

  const columns = useMemo<ColumnDef<Satellite>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Выбрать все"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Выбрать строку"
          />
        ),
        size: 32,
        enableSorting: false,
        enableHiding: false,
      },
      {
        id: "name",
        accessorKey: "name",
        header: ({ column }: { column: Column<Satellite, unknown> }) => (
          <DataTableColumnHeader column={column} label="Название" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<Satellite["name"]>()

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
        header: ({ column }: { column: Column<Satellite, unknown> }) => (
          <DataTableColumnHeader column={column} label="Описание" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<Satellite["desc"]>()

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
        header: ({ column }: { column: Column<Satellite, unknown> }) => (
          <DataTableColumnHeader column={column} label="Орбита" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<Satellite["type"]>()

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
        header: ({ column }: { column: Column<Satellite, unknown> }) => (
          <DataTableColumnHeader column={column} label="Статус" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<Satellite["status"]>()
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
        header: ({ column }: { column: Column<Satellite, unknown> }) => (
          <DataTableColumnHeader column={column} label="Дата запуска" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<Satellite["launchDate"]>()

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
        header: ({ column }: { column: Column<Satellite, unknown> }) => (
          <DataTableColumnHeader column={column} label="Оператор" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<Satellite["operator"]>()

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
        header: ({ column }: { column: Column<Satellite, unknown> }) => (
          <DataTableColumnHeader column={column} label="Страна" />
        ),
        cell: ({ cell }) => {
          const value = cell.getValue<Satellite["country"]>()

          return (
            <div className="flex items-center gap-2">
              <Radio className="size-4 text-emerald-500" />
              <span>{value}</span>
            </div>
          )
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const satellite = row.original

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Открыть меню</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Открыть {satellite.name}</DropdownMenuItem>
                <DropdownMenuItem>Редактировать</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
        size: 40,
        enableSorting: false,
        enableHiding: false,
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
      columnPinning: { right: ["actions"] },
    },
    getRowId: (row) => row.id,
  })

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6 md:p-10">
      <div className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-slate-950/40">
        <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
          База данных спутников
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Полный список аппаратов в системе: {data.length}
        </p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/80 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-slate-950/40">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
          <DataTable table={table} className="min-h-0 flex-1">
            <DataTableToolbar table={table} />
          </DataTable>
        </div>
      </div>
    </div>
  )
}
