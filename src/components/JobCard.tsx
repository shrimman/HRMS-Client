import { getFileUrl } from "@/lib/api/file"
import type { JobOpeningDto } from "@/lib/api/job"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { useState } from "react"
import ShareJobModal from "./ShareJobModal"
import ReferJobModal from "./ReferJobModal"



interface JobCardProps {
    job: JobOpeningDto
    showHrActions?: boolean
    onEdit?: (job: JobOpeningDto) => void
    onDeactivate?: (job: JobOpeningDto) => void
    onActivate?: (job: JobOpeningDto) => void
    onViewReferrals?: (job: JobOpeningDto) => void
}


function JobCard({
    job,
    showHrActions,
    onEdit,
    onDeactivate,
    onActivate,
    onViewReferrals,
}: JobCardProps) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [referralModalOpen, setReferralModalOpen] = useState(false);

    const getJobUrl = () => {
        if (!job.jdFilePath) return null

        const parts = job.jdFilePath.split('/')

        if (parts.length >= 2) {
            const category = parts[0]
            const filename = parts.slice(1).join('/')
            return getFileUrl(category, filename)
        } else {
            return getFileUrl('job-descriptions', job.jdFilePath)
        }
    }
    const jobUrl = getJobUrl()
    const updatedByName = job.updatedByEmployee
        ? `${job.updatedByEmployee.firstName} ${job.updatedByEmployee.lastName}`
        : 'Not available'

    return (
        <>
            <Card className={cn('border border-primary-100/80 bg-white/90 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md')}>
                <CardHeader className={cn('pb-4')}> 
                    <div className={cn('flex items-start justify-between gap-4')}>
                        <CardTitle className={cn('text-xl font-semibold tracking-tight text-foreground')}>
                            {job.title}
                        </CardTitle>
                        <span className={cn('rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700')}> 
                            #{job.jobId}
                        </span>
                    </div>
                    <CardDescription className={cn('text-sm text-muted-foreground')}> 
                        Updated on {new Date(job.updatedAt).toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent className={cn('space-y-5')}> 
                    <div>
                        <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}> 
                            Job Summary
                        </p>
                        <p className={cn('mt-1 text-sm font-medium leading-relaxed text-foreground')}> 
                            {job.summary || 'No summary available'}
                        </p>
                    </div>

                    <div>
                        <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}> 
                            Job Description Document
                        </p>

                        {jobUrl ? (
                            <a href={jobUrl} target="_blank" rel="noopener noreferrer" className={cn('text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-800')}> 
                                View Job Description
                            </a>
                        ) : (
                            <p className={cn('text-sm font-medium text-muted-foreground')}>
                                No job description document found.
                            </p>
                        )}
                    </div>

                    <div>
                        <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}> 
                            HR Contact Person
                        </p>
                        <p className={cn('mt-1 text-sm font-semibold text-foreground')}> 
                            {updatedByName}
                        </p>
                    </div>

                    <div className={cn('flex flex-wrap gap-2 pt-1')}>
                        <Button variant="default" onClick={() => setIsModalOpen(true)}>
                            Share Job
                        </Button>

                        <Button variant="secondary" onClick={() => setReferralModalOpen(true)}>
                            Refer a Friend
                        </Button>
                    </div>

                    {showHrActions ? (
                        <div className={cn('space-y-2 pt-2 border-t border-border/60')}>
                            <div className={cn('grid grid-cols-2 gap-2')}>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className={cn('h-9 w-full')}
                                    onClick={() => onEdit?.(job)}
                                >
                                    Edit
                                </Button>
                                {job.isActive ? (
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className={cn('h-9 w-full')}
                                        onClick={() => onDeactivate?.(job)}
                                    >
                                        Deactivate
                                    </Button>
                                ) : (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className={cn('h-9 w-full')}
                                        onClick={() => onActivate?.(job)}
                                    >
                                        Activate
                                    </Button>
                                )}
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className={cn('h-9 w-full text-primary-700 hover:text-primary-800')}
                                onClick={() => onViewReferrals?.(job)}
                            >
                                View Referrals
                            </Button>
                        </div>
                    ) : null}
                </CardContent>
            </Card>
            <ShareJobModal
                open={isModalOpen}
                jobId={job.jobId}
                onOpenChange={setIsModalOpen} />
            <ReferJobModal
                open={referralModalOpen}
                jobId={job.jobId}
                onOpenChange={setReferralModalOpen} />

        </>
    )
}

export default JobCard