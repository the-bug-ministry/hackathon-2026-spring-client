import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router';
import { queryClient, router } from './router/router';
import '@/app/styles/index.css';
import { useAuth } from '@/entities/auth/lib/use-auth';

export function App() {

  const auth = useAuth();
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} context={{ auth }} />
    </QueryClientProvider>
  )
}

export default App
