import { cn } from '@/lib/utils'
import { useAppSelector } from '@/lib/redux/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
    const user = useAppSelector((state) => state.auth.user)

    return (
        <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
            <div className={cn('max-w-6xl mx-auto')}>

                {/* <div className={cn('mb-8')}>
                    <h1 className={cn('text-4xl font-bold text-foreground mb-2')}>
                        Welcome back, {user?.firstName}!
                    </h1>
                    <p className={cn('text-lg text-muted-foreground')}>
                        Your Dashboard
                    </p>
                </div> */}

                <Card className={cn('mb-8 border-primary-200')}>
                    <CardHeader>
                        <CardTitle className={cn('text-primary-600')}>Your Profile</CardTitle>
                        <CardDescription>
                            Your account information and role permissions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6')}>
                            <div>
                                <p className={cn('text-sm font-medium text-muted-foreground')}>
                                    First Name
                                </p>
                                <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                                    {user?.firstName}
                                </p>
                            </div>

                            <div>
                                <p className={cn('text-sm font-medium text-muted-foreground')}>
                                    Last Name
                                </p>
                                <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                                    {user?.lastName}
                                </p>
                            </div>

                            <div>
                                <p className={cn('text-sm font-medium text-muted-foreground')}>
                                    Email
                                </p>
                                <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                                    {user?.email}
                                </p>
                            </div>
{/* 
                            <div>
                                <p className={cn('text-sm font-medium text-muted-foreground')}>
                                    User ID
                                </p>
                                <p className={cn('text-lg font-semibold text-foreground mt-1 font-mono')}>
                                    {user?.id}
                                </p>
                            </div> */}

                            <div>
                                <p className={cn('text-sm font-medium text-muted-foreground')}>
                                    Role
                                </p>
                                <span className={cn(
                                    'inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold',
                                    'bg-primary-100 text-primary-700'
                                )}>
                                    {user?.roleName}
                                </span>
                            </div>


                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className={cn('text-primary-600')}>MY CALENDER</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                            This is where my calendar will be displayed. It will show Game Schedule, Travel Assignments, and other important events.
                        </p>
                    </CardContent>
                </Card>

            </div>
        </div>
    )
}
