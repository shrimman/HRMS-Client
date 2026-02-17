import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFileUrl } from '@/lib/api/file'
import { getMyReferrals, type JobReferralDto } from '@/lib/api/jobReferral';
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner'

function JobReferrals() {

    const [jobReferrals, setJobReferrals] = useState<JobReferralDto[]>([]);
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const loadMyReferrals = async () => {
        try {
            setIsLoading(true)
            setErrorMessage('')
            const data = await getMyReferrals();
            setJobReferrals(data);
            toast.success("Job referrals loaded successfully.")
        } catch (error) {
            toast.error("Failed to load job referrals. Please try again later.")
            console.log(error);
            setErrorMessage('Failed to load job referrals. Please try again later.')
        } finally {
            setIsLoading(false)
        }

    }

    const getCvUrl = (path?: string) => {
        if (!path) return null

        const parts = path.split('/')
        if (parts.length >= 2) {
            const category = parts[0]
            const filename = parts.slice(1).join('/')
            return getFileUrl(category, filename)
        }
        return getFileUrl('referrals', path)
    }

    useEffect(() => {
        loadMyReferrals();
    }, []);

    return (
        <>
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('max-w-6xl mx-auto space-y-6')}>
                    <div className={cn('flex flex-col gap-1')}>
                        <h1 className={cn('text-4xl font-bold text-foreground')}>
                            My Job Referrals
                        </h1>
                        <p className={cn('text-muted-foreground')}>
                            Track referrals you have submitted and their current status.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className={cn('flex items-center justify-center py-12 text-muted-foreground gap-2')}>
                            <Spinner className="size-5" />
                            <span>Loading referrals...</span>
                        </div>
                    ) : errorMessage ? (
                        <Card className={cn('border-destructive/30 bg-destructive/5')}>
                            <CardContent className={cn('py-6 text-center text-destructive')}>
                                {errorMessage}
                            </CardContent>
                        </Card>
                    ) : jobReferrals.length === 0 ? (
                        <Card className={cn('border-dashed')}>
                            <CardContent className={cn('py-10 text-center text-muted-foreground')}>
                                No job referrals found. Please check back later.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className={cn('space-y-4')}>
                            {jobReferrals.map((referral) => (
                                <Card key={referral.referralId} className={cn('border')}>
                                    <CardHeader className={cn('pb-2')}> 
                                        <div className={cn('flex flex-wrap items-start justify-between gap-3')}>
                                            <div className={cn('space-y-1')}>
                                                <CardTitle className={cn('text-xl font-semibold text-foreground')}>
                                                    {referral.jobOpening?.title ?? 'Job Referral'}
                                                </CardTitle>
                                                <p className={cn('text-sm text-muted-foreground')}>
                                                    Job ID: {referral.jobOpening?.jobId ?? 'N/A'}
                                                </p>
                                            </div>
                                            <span className={cn('rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700')}>
                                                {referral.referralStatus?.statusName ?? 'Pending'}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className={cn('grid gap-4 text-sm')}>
                                        <div className={cn('flex flex-wrap items-center gap-3 text-muted-foreground')}>
                                            <span>Created {new Date(referral.createdAt).toLocaleDateString()}</span>
                                            <span>Updated {new Date(referral.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className={cn('grid gap-3 md:grid-cols-2')}>
                                            <div>
                                                <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                                                    Referred Candidate
                                                </p>
                                                <p className={cn('mt-1 text-sm font-semibold text-foreground')}>
                                                    {referral.friendName}
                                                </p>
                                                <p className={cn('text-sm text-muted-foreground')}>
                                                    {referral.friendEmail}
                                                </p>
                                            </div>
                                            <div>
                                                <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                                                    Referrer
                                                </p>
                                                <p className={cn('mt-1 text-sm font-semibold text-foreground')}>
                                                    {referral.referrer.firstName} {referral.referrer.lastName}
                                                </p>
                                                <p className={cn('text-sm text-muted-foreground')}>
                                                    Employee ID: {referral.referrer.employeeId}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                                                Note
                                            </p>
                                            <p className={cn('mt-1 text-sm text-foreground')}>
                                                {referral.note || 'No note provided.'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                                                CV File
                                            </p>
                                            {getCvUrl(referral.cvFilePath) ? (
                                                <a
                                                    href={getCvUrl(referral.cvFilePath)!}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={cn('mt-1 inline-flex text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-800')}
                                                >
                                                    View CV
                                                </a>
                                            ) : (
                                                <p className={cn('mt-1 text-sm text-muted-foreground')}>
                                                    No CV uploaded.
                                                </p>
                                            )}
                                        </div>
                                        <div>
                                            <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                                                Last Updated By
                                            </p>
                                            <p className={cn('mt-1 text-sm font-semibold text-foreground')}>
                                                {referral.updatedByEmployee.firstName} {referral.updatedByEmployee.lastName}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default JobReferrals