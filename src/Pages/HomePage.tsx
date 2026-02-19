import { cn } from '@/lib/utils'
import { useAppSelector } from '@/lib/redux/hooks'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import OrgChartPersonal from '@/components/OrgChartPersonal'
import { useEffect, useState } from 'react';
import { BriefcaseBusiness, Cake, Loader2 } from 'lucide-react';
import { getBirthdays, getWorkAnniversaries } from '@/lib/api/achievement';
import EventCalender from './EventCalender';

export default function HomePage() {

    const user = useAppSelector((state) => state.auth.user);
    const [isLoading, setIsLoading] = useState(false);
    const [birthdays, setBirthdays] = useState<string[]>([]);
    const [anniversaries, setAnniversaries] = useState<string[]>([]);

    const getCelebrations = async () => {
        setIsLoading(true);
        try {
            const birthdaysResponse = await getBirthdays();
            const anniversariesResponse = await getWorkAnniversaries();
            setBirthdays(birthdaysResponse);
            setAnniversaries(anniversariesResponse);
        }
        catch (error) {
            console.error('Error fetching celebrations:', error);
        }
        finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getCelebrations();
    }, []);


    if (isLoading) {
        return (
            <div className={cn('flex-1 flex items-center justify-center p-8')}>
                <Loader2 className={cn('w-12 h-12 animate-spin text-primary-600')} />
                <p className={cn('text-lg font-semibold text-foreground')}>Loading...</p>
            </div>
        )
    }


    return (
        <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
            <div className={cn('max-w-6xl mx-auto')}>

                <Card>
                    <CardHeader>
                        <CardTitle className={cn('text-primary-600')}>MY CALENDER</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                            This is where my calendar will be displayed. It will show Game Schedule, Travel Assignments, and other important events.
                        </p> */}
                        <EventCalender />
                    </CardContent>
                </Card>
                <div className={cn('grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2')}>
                    <Card className={cn('mt-8')}>
                        <CardHeader>
                            <CardTitle className={cn('text-primary-600')}>
                                <Cake className='align-middle mr-6 relative' />
                                <span className={cn('align-middle relative')} > Birthdays Today </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {
                                birthdays.length > 0 ? (
                                    birthdays.map((birthday, index) => (
                                        <span key={index} className={cn('text-lg font-semibold w-full  text-foreground mt-1 border border-black-600 p-2')}>
                                            {birthday}
                                        </span>
                                    ))
                                ) : (
                                    <p className={cn('text-lg font-semibold text-foreground mt-1 ')}>
                                        No Work Anniversaries Today
                                    </p>
                                )
                            }
                        </CardContent>
                    </Card>

                    <Card className={cn('mt-8')}>
                        <CardHeader>
                            <CardTitle className={cn('text-primary-600')}>
                                <BriefcaseBusiness className='align-middle mr-6 relative' />
                                <span className={cn('align-middle relative')} > Work Anniversaries Today </span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {
                                anniversaries.length > 0 ? (
                                    anniversaries.map((anniversary, index) => (
                                        <span key={index} className={cn('text-lg font-semibold w-full  text-foreground mt-1 border-2 border-black-600 p-2')}>
                                            {anniversary}
                                        </span>
                                    ))
                                ) : (
                                    <p className={cn('text-lg font-semibold text-foreground mt-1 ')}>
                                        No Birthday's Today
                                    </p>
                                )
                            }
                        </CardContent>
                    </Card>

                </div>


                {user?.id && (
                    <Card className={cn('mt-8')}>
                        <CardHeader>
                            <CardTitle className={cn('text-primary-600')}>Organization</CardTitle>
                            <CardDescription>Manager chain above you and your direct reports below</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <OrgChartPersonal employeeId={parseInt(user.id, 10) || 0} />
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    )
}