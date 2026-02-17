
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFileUrl } from "@/lib/api/file"
import type { JobOpeningDto } from "@/lib/api/job";
import { getMyReviewerJobs } from "@/lib/api/jobReviewer";
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner"


function JobPage() {

    const [jobReviews, setJobReviews] = useState<JobOpeningDto[]>([]);
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const loadMyReviews = async () => {

        try {
            setIsLoading(true)
            setErrorMessage('')
            const data = await getMyReviewerJobs();
            setJobReviews(data);
            toast.success("Job reviews loaded successfully.")
        } catch (error) {
            toast.error("Failed to load job reviews. Please try again later.")
            console.log(error);
            setErrorMessage('Failed to load job reviews. Please try again later.')
        } finally {
            setIsLoading(false)
        }
    }

    const getJobUrl = (path?: string) => {
        if (!path) return null

        const parts = path.split('/')
        if (parts.length >= 2) {
            const category = parts[0]
            const filename = parts.slice(1).join('/')
            return getFileUrl(category, filename)
        }
        return getFileUrl('job-descriptions', path)
    }

    useEffect(() => {
        loadMyReviews();
    }, [])

    return (
        <>
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('max-w-6xl mx-auto space-y-6')}>
                    <div className={cn('flex flex-col gap-1')}>
                        <h1 className={cn('text-4xl font-bold text-foreground')}>
                            Your Job Review Tasks
                        </h1>
                        <p className={cn('text-muted-foreground')}>
                            Review assigned openings and keep track of their status and details.
                        </p>
                    </div>

                    {isLoading ? (
                        <div className={cn('flex items-center justify-center py-12 text-muted-foreground gap-2')}>
                            <Spinner className="size-5" />
                            <span>Loading job reviews...</span>
                        </div>
                    ) : errorMessage ? (
                        <Card className={cn('border-destructive/30 bg-destructive/5')}>
                            <CardContent className={cn('py-6 text-center text-destructive')}>
                                {errorMessage}
                            </CardContent>
                        </Card>
                    ) : jobReviews.length === 0 ? (
                        <Card className={cn('border-dashed')}>
                            <CardContent className={cn('py-10 text-center text-muted-foreground')}>
                                No active job reviews at the moment. Please check back later.
                            </CardContent>
                        </Card>
                    ) : (
                        <div className={cn('space-y-4')}>
                            {jobReviews.map((job) => (
                                <Card key={job.jobId} className={cn('border')}>
                                    <CardHeader className={cn('pb-2')}>
                                        <div className={cn('flex flex-wrap items-start justify-between gap-3')}>
                                            <div className={cn('space-y-1')}>
                                                <CardTitle className={cn('text-xl font-semibold text-foreground')}>
                                                    {job.title}
                                                </CardTitle>
                                                <p className={cn('text-sm text-muted-foreground')}>
                                                    Job ID: {job.jobId}
                                                </p>
                                            </div>
                                            <span className={cn('rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700')}>
                                                {job.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className={cn('grid gap-4 text-sm')}>
                                        <div className={cn('flex flex-wrap items-center gap-3 text-muted-foreground')}>
                                            <span>Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                                            <span>Updated {new Date(job.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className={cn('grid gap-3 md:grid-cols-2')}>
                                            <div>
                                                <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                                                    Assigned By
                                                </p>
                                                <p className={cn('mt-1 text-sm font-semibold text-foreground')}>
                                                    {job.updatedByEmployee.firstName} {job.updatedByEmployee.lastName}
                                                </p>
                                                <p className={cn('text-sm text-muted-foreground')}>
                                                    Employee ID: {job.updatedByEmployee.employeeId}
                                                </p>
                                            </div>
                                            <div>
                                                <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                                                    HR Owner ID
                                                </p>
                                                <p className={cn('mt-1 text-sm font-semibold text-foreground')}>
                                                    {job.jobHROwnerId ?? 'Not assigned'}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                                                Summary
                                            </p>
                                            <p className={cn('mt-1 text-sm text-foreground')}>
                                                {job.summary || 'No summary provided.'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                                                Job Description
                                            </p>
                                            {getJobUrl(job.jdFilePath) ? (
                                                <a
                                                    href={getJobUrl(job.jdFilePath)!}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={cn('mt-1 inline-flex text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-800')}
                                                >
                                                    View Job Description
                                                </a>
                                            ) : (
                                                <p className={cn('mt-1 text-sm text-muted-foreground')}>
                                                    No job description document found.
                                                </p>
                                            )}
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
export default JobPage; 