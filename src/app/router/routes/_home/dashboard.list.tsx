import { ListPage } from "@/pages/list/list.page"
import { createFileRoute } from "@tanstack/react-router"

/** Справочник спутников — только просмотр, без обязательной авторизации */
export const Route = createFileRoute("/_home/dashboard/list")({
  component: ListPage,
})
