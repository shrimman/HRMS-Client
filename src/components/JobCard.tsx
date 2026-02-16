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
}


function JobCard({ job }: JobCardProps) {

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

    return (
        <>
            <Card className={cn('mb-8 border-primary-200')}>
                <CardHeader>
                    <CardTitle className={cn('text-primary-600')}>{job.title}</CardTitle>
                    <CardDescription>
                        JOBID : #
                        {job.jobId}
                    </CardDescription>
                    <CardDescription>
                        Posted on : {new Date(job.updatedAt).toLocaleDateString()}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6')}>
                        <div>
                            <p className={cn('text-sm font-medium text-muted-foreground')}>
                                JOB Summary
                            </p>
                            <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                                {job.summary || 'No summary available'}
                            </p>
                        </div>
                    </div>

                    <div>
                        <p className={cn('text-sm font-medium text-muted-foreground')}>
                            JOB Description Document
                        </p>

                        {jobUrl ? (
                            <a href={jobUrl} target="_blank" rel="noopener noreferrer" className={cn('text-lg font-semibold text-foreground mt-1 underline')}>
                                View Job Description
                            </a>
                        ) : (
                            <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                                No job description document found.
                            </p>
                        )}
                    </div>
                    <div>
                        <p className={cn('text-sm font-medium text-muted-foreground')}>
                            HR Contact Person
                        </p>
                        <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                        </p>
                        <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                            {job.updatedByEmployee.firstName + ' ' + job.updatedByEmployee.lastName}
                        </p>
                    </div>

                    <Button variant="default" className={cn('mt-4')} onClick={() => setIsModalOpen(true)}>
                        Share Job
                    </Button>

                    <Button variant="secondary" className={cn('mt-4 ml-2')} onClick={() => setReferralModalOpen(true)}>
                        Refer a Friend
                    </Button>
                </CardContent>
            </Card >
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