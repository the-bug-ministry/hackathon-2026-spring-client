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

import { useProfileQuery } from "@/entities/account/lib/use-profile"
import {
  mapAccountToProfileFields,
  buildDisplayName,
  buildInitials,
} from "./model"
import { ProfileTleManager } from "./ui/profile-tle-manager"

export function ProfilePage() {
  const { data, isError, isLoading } = useProfileQuery()
  const fields = mapAccountToProfileFields(data)
  const displayName = buildDisplayName(fields)
  const initials = buildInitials(fields)
  const isDisabled = isLoading || !data

  return (
    <div className="flex h-full w-full flex-col gap-6 p-6 md:p-10">
      <div className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-slate-950/40">
        <h1 className="text-2xl font-bold tracking-tight">Профиль</h1>
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
        <div className="min-h-0 flex-1 overflow-auto">
          <div className="flex min-h-0 w-full flex-col gap-6">
            <Card className="rounded-2xl">
              <CardContent className="flex items-center gap-6 p-6">
                <Avatar className="h-16 w-16">
                  {fields.image ? (
                    <AvatarImage src={fields.image} alt={displayName} />
                  ) : (
                    <AvatarFallback>{initials}</AvatarFallback>
                  )}
                </Avatar>

                <div className="flex flex-col">
                  <span className="text-lg font-semibold">
                    {isLoading ? "Загружается..." : displayName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {fields.email || "Email не указан"}
                  </span>
                </div>

                <div className="ml-auto">
                  <Button variant="outline" disabled={isDisabled}>
                    Изменить
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="profile" className="space-y-4">
              <TabsList className="gap-0 rounded-3xl p-[3px]" variant="default">
                <TabsTrigger value="profile">Личные данные</TabsTrigger>
                <TabsTrigger value="tle">Список TLE дампов</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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

                      <Button className="w-full" disabled={isDisabled}>
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
                        className="w-full"
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
                        className="w-fit"
                        disabled={isDisabled}
                      >
                        Сменить пароль
                      </Button>

                      <Separator />

                      <Button
                        variant="destructive"
                        className="flex w-fit items-center gap-2"
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
