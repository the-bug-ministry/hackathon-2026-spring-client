import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/components/ui/button"
import { useForm } from "@tanstack/react-form"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/shared/components/ui/card"
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/shared/components/ui/field"
import { Input } from "@/shared/components/ui/input"
import { useMutation } from '@tanstack/react-query'
import { authOptions } from '@/entities/auth/api/contracts/auth.options'
import Cookies from 'js-cookie'
import { ACCESS_TOKEN } from '@/entities/auth/constants'
import { queryClient } from '@/app/router/router'
import { authKeys } from '@/entities/auth/api/contracts/auth.keys'
import { toast } from 'sonner'
import { formSchema } from '../model/schema'

export function LoginForm({
    className,
    ...props
}: React.ComponentProps<"div">) {

    const login = useMutation({
        ...authOptions.login(),
        onSuccess: (data) => {
            queryClient.setQueryData(authKeys.me(), data);
            Cookies.set(ACCESS_TOKEN, data.accessToken);

            toast.success('Вход выполнен');
        },
        onError: () => {
            toast.error('Ошибка авторизации');
        }
    })


    const form = useForm({
        defaultValues: {
            username: "",
            password: "",
        },
        validators: {
            onChange: formSchema,
        },
        onSubmit: async ({ value }) => {
            login.mutate({ password: value.password, username: value.username });
        },
    })

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader>
                    <CardTitle>Войти в аккаунт</CardTitle>
                    <CardDescription>
                        Введите свой адрес электронной почты ниже, чтобы войти в свою учетную запись
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id='login-form' onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        form.handleSubmit();
                    }}>
                        <FieldGroup>
                            <form.Field
                                name="username"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid

                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor="email">Email</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Login button not working on mobile"
                                                autoComplete="off"
                                            />
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <form.Field
                                name="password"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched && !field.state.meta.isValid

                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor="email">Пароль</FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                aria-invalid={isInvalid}
                                                placeholder="Login button not working on mobile"
                                                autoComplete="off"
                                            />
                                            {isInvalid && (
                                                <FieldError errors={field.state.meta.errors} />
                                            )}
                                        </Field>
                                    )
                                }}
                            />
                            <Field>
                                <Button form='login-form' type="submit">Войти</Button>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div >
    )
}
