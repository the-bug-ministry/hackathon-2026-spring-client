import { mutationOptions, QueryCache, queryOptions } from '@tanstack/react-query';
import { authKeys } from './auth.keys';
import { authApi } from './auth';
import { ACCESS_TOKEN } from '../../constants';
import Cookies from 'js-cookie';
import { TIME } from '@/shared/config/time';

const queryCache = new QueryCache();

export const authOptions = {
    login: () =>
        mutationOptions({
            mutationKey: authKeys.login(),
            mutationFn: authApi.login,
            onError: () => {
                Cookies.remove(ACCESS_TOKEN);
            },
        }),
    me: () =>
        queryOptions({
            queryKey: authKeys.me(),
            queryFn: ({ signal }) => authApi.me({ signal }),
            staleTime: 5 * TIME.MINUTE,
            retry: 1,
            refetchOnWindowFocus: true,
        }),
    logout: () =>
        mutationOptions({
            mutationKey: authKeys.logout(),
            mutationFn: authApi.logout,
            onSuccess: () => queryCache.clear(),
        }),
}