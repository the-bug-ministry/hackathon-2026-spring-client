import { LoginForm } from '@/features/login/ui/login-form';
import { COMPANY_NAME, PROJECT_NAME } from '@/shared/config/site';
import { RatCatcherHat } from '@/shared/components/ui/rat-catcher-hat';

import prew from '/public/prew.png';

export function LoginPage() {
    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <div className="flex items-center gap-2 font-medium">
                        <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <RatCatcherHat className="size-4" />
                        </div>
                        {COMPANY_NAME} | {PROJECT_NAME}
                    </div>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm />
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <img
                    src={prew}
                    alt="Satellite orbiting Earth"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
                <div className="absolute inset-0 bg-black/20" />
            </div>
        </div>
    );
}
