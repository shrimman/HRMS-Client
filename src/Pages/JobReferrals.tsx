import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function JobReferrals() {
    return (
        <>
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('max-w-6xl mx-auto')}>
                    <h1 className={cn('text-4xl font-bold text-foreground mb-2')}>
                        My Job Referrals
                    </h1>
                    <Card className={cn('mb-8 border-primary-200')}>
                        <CardHeader>
                            <CardTitle className={cn('text-primary-600')}>JOB TITLE</CardTitle>
                            <CardDescription>
                                JOB ID
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6')}>
                                <div>
                                    <p className={cn('text-sm font-medium text-muted-foreground')}>
                                        JOB Summary
                                    </p>
                                    <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                                        ROIMA INDIA
                                    </p>
                                </div>
                            </div>

                            <div>
                                <p className={cn('text-sm font-medium text-muted-foreground')}>
                                    JOB Description
                                </p>
                                <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                                    This is the job description. It will be a long text describing the job in detail.
                                </p>
                            </div>
                            <div>
                                <p className={cn('text-sm font-medium text-muted-foreground')}>
                                    HR Contact Person
                                </p>
                                <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                                </p>
                                <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                                    HR's Name
                                </p>
                            </div>
                            <div className={cn('flex space-x-4 mt-6')}>
                                Friend's Name
                            </div>

                            <div className={cn('flex space-x-4 mt-6')}>
                                Email
                            </div>

                            <div className={cn('flex space-x-4 mt-6')}>
                                CV File
                            </div>

                            <div className={cn('flex space-x-4 mt-6')}>REFERRAL STATUS</div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    )
}

export default JobReferrals