import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/shared/components/ui/card"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { Separator } from "@/shared/components/ui/separator"

import { MailIcon, UserIcon, ShieldIcon, LogOutIcon } from "lucide-react"

export function ProfilePage() {
  return (
    <div className="flex h-full w-full flex-col gap-6 p-6 md:p-10">
      <div className="sticky top-0 z-10 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-lg shadow-slate-200/40 backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:shadow-slate-950/40">
        <h1 className="text-2xl font-bold tracking-tight">Профиль</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Управляй своими данными и настройками аккаунта
        </p>
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto">
          <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-col gap-6">
            {/* PROFILE CARD */}
            <Card className="rounded-2xl">
              <CardContent className="flex items-center gap-6 p-6">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="" />
                  <AvatarFallback>ND</AvatarFallback>
                </Avatar>

                <div className="flex flex-col">
                  <span className="text-lg font-semibold">Nick Datsky</span>
                  <span className="text-sm text-muted-foreground">
                    nickitadatsky@gmail.com
                  </span>
                </div>

                <div className="ml-auto">
                  <Button variant="outline">Изменить</Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* PERSONAL INFO */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="size-4" />
                    Личные данные
                  </CardTitle>
                  <CardDescription>Обнови информацию о себе</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Имя</Label>
                    <Input placeholder="Ваше имя" defaultValue="Nick" />
                  </div>

                  <div className="space-y-2">
                    <Label>Фамилия</Label>
                    <Input placeholder="Ваша фамилия" defaultValue="Datsky" />
                  </div>

                  <Button className="w-full">Сохранить</Button>
                </CardContent>
              </Card>

              {/* EMAIL */}
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MailIcon className="size-4" />
                    Email
                  </CardTitle>
                  <CardDescription>Управление почтой</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" defaultValue="nickitadatsky@gmail.com" />
                  </div>

                  <Button variant="outline" className="w-full">
                    Изменить email
                  </Button>
                </CardContent>
              </Card>

              {/* SECURITY */}
              <Card className="rounded-2xl md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldIcon className="size-4" />
                    Безопасность
                  </CardTitle>
                  <CardDescription>Настройки безопасности аккаунта</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full">
                    Сменить пароль
                  </Button>

                  <Separator />

                  <Button
                    variant="destructive"
                    className="flex w-full items-center gap-2"
                  >
                    <LogOutIcon className="size-4" />
                    Выйти из аккаунта
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
