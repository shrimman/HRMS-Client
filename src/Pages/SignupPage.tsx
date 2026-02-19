import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { signup} from '@/lib/api/auth/auth'
import { useAppDispatch } from '@/lib/redux/hooks'
import { signupSuccess, setError, setLoading, type UserRole } from '@/lib/redux/slices/authSlice'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { toast } from 'sonner'

const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name must not exceed 50 characters'),
    lastName: z
      .string()
      .min(1, 'Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name must not exceed 50 characters'),
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .regex(
        /^(?=.*[A-Z])(?=.*[0-9])/,
        'Password must contain at least one uppercase letter and one number'
      ),
    dateOfBirth: z
      .string()
      .min(1, 'Date of birth is required')
      .refine((value) => {
        const today = new Date()
        const dob = new Date(value)
        const age = today.getFullYear() - dob.getFullYear()
        const monthDiff = today.getMonth() - dob.getMonth()
        const dayDiff = today.getDate() - dob.getDate()
        if (
          age > 18 ||
          (age === 18 && monthDiff > 0) ||
          (age === 18 && monthDiff === 0 && dayDiff >= 0)
        ) {
          return true
        }
        return false
      }, 'You must be at least 18 years old'),
    dateOfJoining: z
      .string()
      .min(1, 'Joining date is required')
      .refine((value) => {
        const today = new Date()
        const doj = new Date(value)
        return doj <= today
      }
        , 'Joining date cannot be in the future'),

    confirmPassword: z.string().min(1, 'Please confirm your password'),
    roleName: z.string().min(1, 'Please select a role'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      password: '',
      dateOfJoining: '',
      confirmPassword: '',
      roleName: '',
    },
  })

  async function onSubmit(values: SignupFormValues) {
    try {
      dispatch(setLoading(true))

      const data = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        dateOfBirth: values.dateOfBirth,
        dateOfJoining: values.dateOfJoining,
        password: values.password,
        roleName: values.roleName as UserRole,
      }

      await signup(data);
      dispatch(signupSuccess())
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed'
      dispatch(setError(errorMessage))
    } finally {
      toast.success('Account created successfully!')
      dispatch(setLoading(false))
      navigate('/home')
    }
  }

  return (
    <Card className={cn('w-full', 'backdrop-blur-md', 'border-primary-200', 'shadow-xl')}>
      <CardHeader>
        <CardTitle className={cn('text-primary-600')}>Create Account</CardTitle>
        <CardDescription>
          Add a new employee to your organization by creating an account for them. Please fill in the details below to get started.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={cn('space-y-6')}>
            <div className={cn('grid grid-cols-2 gap-4')}>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        placeholder="John"
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
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <input
                        type="text"
                        placeholder="Snow"
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
            </div>


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
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className={cn(
                        'w-full rounded-md border px-3 py-2 text-sm',
                        'border-input bg-background',
                        'placeholder:text-muted-foreground',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        'disabled:cursor-not-allowed disabled:opacity-50'
                      )}
                    >
                      <option value="">Select a role</option>
                      <option value="Employee">EMPLOYEE</option>
                      <option value="Manager">MANAGER</option>
                      <option value="HR">HR</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <input
                      type="date"
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
              name="dateOfJoining"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Joining Date</FormLabel>
                  <FormControl>
                    <input
                      type="date"
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
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
              Sign Up
            </Button>
          </form>
        </Form>

      </CardContent>
    </Card>
  )
}
