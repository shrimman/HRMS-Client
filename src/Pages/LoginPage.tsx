import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { login } from '@/lib/api/auth/auth'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { checkAuth, loginSuccess, setError, setLoading } from '@/lib/redux/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from '@/components/ui/form'
import { AxiosError } from 'axios'
import { useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    try {
      dispatch(setLoading(true));
      const response = await login(values);

      dispatch(loginSuccess({ user: response }));

      navigate('/home');
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 401) {
        toast.error('Invalid email or password');
        dispatch(setError('Invalid email or password'));
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        dispatch(setError(errorMessage));
        toast.error(errorMessage);
      }
    } finally {
      dispatch(setLoading(false));
    }
  }

  const { isAuthenticated, authChecked, loading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!authChecked) {
      dispatch(checkAuth())
    }
  }, [authChecked, dispatch])

  if (!authChecked || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />
  }

  return (
    <Card className={cn('w-full', 'backdrop-blur-md', 'bg-white/30', 'border-white/40', 'border-2', 'shadow-xl')}>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6')}>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className={cn(
                        'w-full rounded-md border px-3 py-2 text-sm',
                        'border-input bg-background',
                        'placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        'disabled:cursor-not-allowed disabled:opacity-50'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className={cn(
                        'w-full rounded-md border px-3 py-2 text-sm',
                        'border-input bg-background',
                        'placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        'disabled:cursor-not-allowed disabled:opacity-50'
                      )}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className={cn('w-full')}>
              Login
            </Button>
          </form>
        </Form>

      </CardContent>
    </Card>
  )
}
