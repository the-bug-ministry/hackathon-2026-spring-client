import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Separator } from "@/shared/components/ui/separator"
import { LogOutIcon, MailIcon, ShieldIcon, UserIcon } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs"

import { useAuth } from "@/entities/auth/lib/use-auth"
import {
  mapAccountToProfileFields,
  buildDisplayName,
  buildInitials,
} from "./model"
import { ProfileTleManager } from "./ui/profile-tle-manager"

export function ProfilePage() {
  const { account, status, meError } = useAuth()
  const isLoading = status === "PENDING"
  const isError = Boolean(meError) && status !== "PENDING"
  const fields = mapAccountToProfileFields(account ?? undefined)
  const displayName = buildDisplayName(fields)
  const initials = buildInitials(fields)
  const isDisabled = isLoading || !account

  return (
    <div className="flex h-full w-full flex-col gap-4 p-3 sm:gap-6 sm:p-6 md:p-10">
      <div className="rounded-2xl border border-slate-200 bg-white/85 p-4 shadow-lg shadow-slate-200/40 backdrop-blur sm:sticky sm:top-2 sm:z-10 sm:p-6 dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-slate-950/40">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Профиль
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Управляй своими данными и настройками аккаунта
        </p>
      </div>

      {isError && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-600 dark:border-red-800 dark:bg-red-900/50 dark:text-red-300">
          Не удалось загрузить профиль. Попробуйте обновить страницу.
        </div>
      )}

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="min-h-0 flex-1 overflow-auto pb-16 sm:pb-6">
          <div className="flex min-h-0 w-full flex-col gap-4 sm:gap-6">
            <Card className="rounded-2xl">
              <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
                <Avatar className="h-16 w-16">
                  {fields.image ? (
                    <AvatarImage src={fields.image} alt={displayName} />
                  ) : (
                    <AvatarFallback>{initials}</AvatarFallback>
                  )}
                </Avatar>

                <div className="flex min-w-0 flex-col gap-1">
                  <span className="truncate text-lg font-semibold">
                    {isLoading ? "Загружается..." : displayName}
                  </span>
                  <span className="truncate text-sm text-muted-foreground">
                    {fields.email || "Email не указан"}
                  </span>
                </div>

                <div className="w-full sm:ml-auto sm:w-auto">
                  <Button
                    variant="outline"
                    disabled={isDisabled}
                    className="w-full sm:w-auto"
                  >
                    Изменить
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList
                className="flex-nowrap gap-1 overflow-x-auto rounded-3xl p-[3px] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                variant="default"
              >
                <TabsTrigger value="profile" className="px-4 whitespace-nowrap">
                  Личные данные
                </TabsTrigger>
                <TabsTrigger value="tle" className="px-4 whitespace-nowrap">
                  Список TLE дампов
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <UserIcon className="size-4" /> Личные данные
                      </CardTitle>
                      <CardDescription>
                        Обнови информацию о себе
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Имя</Label>
                        <Input
                          placeholder="Ваше имя"
                          defaultValue={fields.firstName}
                          disabled={isDisabled}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Фамилия</Label>
                        <Input
                          placeholder="Ваша фамилия"
                          defaultValue={fields.lastName}
                          disabled={isDisabled}
                        />
                      </div>

                      <Button className="w-full sm:w-fit" disabled={isDisabled}>
                        Сохранить
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MailIcon className="size-4" /> Email
                      </CardTitle>
                      <CardDescription>Управление почтой</CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          defaultValue={fields.email}
                          disabled={isDisabled}
                        />
                      </div>

                      <Button
                        variant="outline"
                        className="w-full sm:w-fit"
                        disabled={isDisabled}
                      >
                        Изменить email
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl md:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <ShieldIcon className="size-4" /> Безопасность
                      </CardTitle>
                      <CardDescription>
                        Настройки безопасности аккаунта
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <Button
                        variant="outline"
                        className="w-full sm:w-fit"
                        disabled={isDisabled}
                      >
                        Сменить пароль
                      </Button>

                      <Separator />

                      <Button
                        variant="destructive"
                        className="flex w-full items-center gap-2 sm:w-fit"
                        disabled={isLoading}
                      >
                        <LogOutIcon className="size-4 w-fit" /> Выйти из
                        аккаунта
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="tle">
                <ProfileTleManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
