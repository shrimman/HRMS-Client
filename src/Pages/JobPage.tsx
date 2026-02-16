import JobCard from "@/components/JobCard";
import { getActiveJobs, type JobOpeningDto } from "@/lib/api/job";
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react";
import { toast } from "sonner";




function JobPage() {

    const [jobOpenings, setJobOpenings] = useState<JobOpeningDto[]>([]);


    const loadJobOpenings = async () => {
        try {
            const data = await getActiveJobs();
            setJobOpenings(data);

        } catch (error) {
            console.error('Error fetching job openings:', error);
            toast.error('Failed to load job openings. Please try again later.');
            return [];
        }
        finally{
            toast.success('Job openings loaded successfully!');
        }
    }

    useEffect(() => {
        loadJobOpenings();
    }, [])

    return (
        <>
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('max-w-6xl mx-auto')}>
                    <h1 className={cn('text-4xl font-bold text-foreground mb-2')}>
                        ALL ACTIVE JOBS
                    </h1>
                    {jobOpenings.length === 0 ? (
                        <p className={cn('text-muted-foreground text-center mt-10')}>
                            No active job openings at the moment. Please check back later.
                        </p>
                    ) : (
                        <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6')}>
                            {jobOpenings.map((job) => (
                                <JobCard key={job.jobId} job={job} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
export default JobPage; 