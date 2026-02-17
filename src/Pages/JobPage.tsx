import JobCard from "@/components/JobCard";
import { activateJob, deactivateJob, getActiveJobs, getAllJobs, updateJob, type JobOpeningDto, type UpdateJobRequest } from "@/lib/api/job";
import { getAllEmployees } from '@/lib/api/hr'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { getReviewersByJob, assignReviewer, removeReviewer, type JobReviewerDto } from '@/lib/api/jobReviewer'
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useUserRole } from "@/lib/redux/hooks"
import { useNavigate } from "react-router-dom"




function JobPage() {

    const [jobOpenings, setJobOpenings] = useState<JobOpeningDto[]>([]);
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false)
    const [activeJob, setActiveJob] = useState<JobOpeningDto | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [employees, setEmployees] = useState<EmployeeSummaryDto[]>([])
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
    const [reviewers, setReviewers] = useState<JobReviewerDto[]>([])
    const [isLoadingReviewers, setIsLoadingReviewers] = useState(false)
    const [selectedReviewerIds, setSelectedReviewerIds] = useState<number[]>([])
    const [reviewerSearchQuery, setReviewerSearchQuery] = useState('')
    const [editForm, setEditForm] = useState<UpdateJobRequest>({})
    const [editFile, setEditFile] = useState<File | undefined>(undefined)
    const role = useUserRole()
    const navigate = useNavigate()
    const isHr = role === 'HR'


    const loadJobOpenings = async () => {
        try {
            setIsLoading(true)
            setErrorMessage('')
            const data = await (isHr ? getAllJobs() : getActiveJobs());
            setJobOpenings(data);
            toast.success('Job openings loaded successfully!');
        } catch (error) {
            console.error('Error fetching job openings:', error);
            toast.error('Failed to load job openings. Please try again later.');
            setErrorMessage('Failed to load job openings. Please try again later.')
        }
        finally{
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadJobOpenings();
    }, [isHr])

    const openEditModal = (job: JobOpeningDto) => {
        setActiveJob(job)
        setEditForm({
            title: job.title,
            summary: job.summary,
        })
        setEditFile(undefined)
        setIsEditOpen(true)
        loadReviewers(job.jobId)
        if (isHr) loadEmployees()
    }

    const loadEmployees = async () => {
        setIsLoadingEmployees(true)
        try {
            const data = await getAllEmployees()
            setEmployees(data)
        } catch (error) {
            console.error('Failed to load employees for reviewers:', error)
            toast.error('Failed to load employees')
        } finally {
            setIsLoadingEmployees(false)
        }
    }

    const loadReviewers = async (jobId: number) => {
        setIsLoadingReviewers(true)
        try {
            const data = await getReviewersByJob(jobId)
            setReviewers(data)
        } catch (error) {
            console.error('Failed to load job reviewers:', error)
            toast.error('Failed to load reviewers')
        } finally {
            setIsLoadingReviewers(false)
        }
    }

    const toggleSelectedReviewer = (employeeId: number) => {
        setSelectedReviewerIds((prev) => prev.includes(employeeId) ? prev.filter(id => id !== employeeId) : [...prev, employeeId])
    }

    const handleAssignSelectedReviewers = async () => {
        if (!activeJob) return
        if (selectedReviewerIds.length === 0) {
            toast.error('Select at least one reviewer to assign')
            return
        }
        setIsSaving(true)
        try {
            await Promise.all(selectedReviewerIds.map(rid => assignReviewer(activeJob.jobId, rid)))
            toast.success('Reviewers assigned')
            setSelectedReviewerIds([])
            await loadReviewers(activeJob.jobId)
        } catch (error) {
            console.error('Failed to assign reviewers:', error)
            toast.error('Failed to assign reviewers')
        } finally {
            setIsSaving(false)
        }
    }

    const handleRemoveReviewer = async (jobReviewerId: number) => {
        if (!activeJob) return
        setIsSaving(true)
        try {
            await removeReviewer(jobReviewerId)
            toast.success('Reviewer removed')
            await loadReviewers(activeJob.jobId)
        } catch (error) {
            console.error('Failed to remove reviewer:', error)
            toast.error('Failed to remove reviewer')
        } finally {
            setIsSaving(false)
        }
    }

    const openDeactivateModal = (job: JobOpeningDto) => {
        setActiveJob(job)
        setIsDeactivateOpen(true)
    }

    const handleEditSave = async () => {
        if (!activeJob) return
        setIsSaving(true)
        try {
            const payload: UpdateJobRequest = {
                title: editForm.title,
                summary: editForm.summary,
                jdFile: editFile
            }
            const updated = await updateJob(activeJob.jobId, payload)
            setJobOpenings((prev) => prev.map((job) => job.jobId === updated.jobId ? updated : job))
            toast.success('Job updated successfully')
            setIsEditOpen(false)
        } catch (error) {
            toast.error('Failed to update job')
            console.error('Error updating job:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleDeactivate = async () => {
        if (!activeJob) return
        setIsSaving(true)
        try {
            await deactivateJob(activeJob.jobId)
            setJobOpenings((prev) =>
                prev.map((job) => job.jobId === activeJob.jobId ? { ...job, isActive: false } : job)
            )
            toast.success('Job deactivated successfully')
            setIsDeactivateOpen(false)
        } catch (error) {
            toast.error('Failed to deactivate job')
            console.error('Error deactivating job:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleActivate = async (job: JobOpeningDto) => {
        setIsSaving(true)
        try {
            await activateJob(job.jobId)
            setJobOpenings((prev) =>
                prev.map((item) => item.jobId === job.jobId ? { ...item, isActive: true } : item)
            )
            toast.success('Job activated successfully')
        } catch (error) {
            toast.error('Failed to activate job')
            console.error('Error activating job:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleViewReferrals = (job: JobOpeningDto) => {
        navigate(`/hr/jobs/${job.jobId}/referrals`)
    }



    const pageTitle = isHr ? 'Job Openings' : 'All Active Jobs'
    const pageSubtitle = isHr
        ? 'Manage job openings, referrals, and visibility.'
        : 'Explore current openings and share or refer with your network.'

    return (
        <>
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('max-w-6xl mx-auto space-y-6')}>
                    <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between')}>
                        <div className={cn('flex flex-col gap-1')}>
                        <h1 className={cn('text-4xl font-bold text-foreground')}>
                            {pageTitle}
                        </h1>
                        <p className={cn('text-muted-foreground')}>
                            {pageSubtitle}
                        </p>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className={cn('flex items-center justify-center py-12 text-muted-foreground gap-2')}>
                            <Spinner className="size-5" />
                            <span>Loading jobs...</span>
                        </div>
                    ) : errorMessage ? (
                        <div className={cn('rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive')}>
                            {errorMessage}
                        </div>
                    ) : jobOpenings.length === 0 ? (
                        <div className={cn('rounded-lg border border-dashed p-8 text-center text-muted-foreground')}>
                            No active job openings at the moment. Please check back later.
                        </div>
                    ) : (
                        <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6')}>
                            {jobOpenings.map((job) => (
                                <JobCard
                                    key={job.jobId}
                                    job={job}
                                    showHrActions={isHr}
                                    onEdit={openEditModal}
                                    onDeactivate={openDeactivateModal}
                                    onActivate={handleActivate}
                                    onViewReferrals={handleViewReferrals}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className={cn('sm:max-w-lg max-h-[80vh] overflow-auto')}>
                    <DialogHeader>
                        <DialogTitle>Edit Job Opening</DialogTitle>
                        <DialogDescription>
                            Update job details and replace the job description file if needed.
                        </DialogDescription>
                    </DialogHeader>
                    <div className={cn('space-y-4')}>
                        <div className={cn('space-y-2')}>
                            <Label htmlFor='editTitle'>Job Title</Label>
                            <Input
                                id='editTitle'
                                value={editForm.title || ''}
                                onChange={(event) => setEditForm((prev) => ({
                                    ...prev,
                                    title: event.target.value
                                }))}
                            />
                        </div>
                        <div className={cn('space-y-2')}>
                            <Label htmlFor='editSummary'>Summary</Label>
                            <Input
                                id='editSummary'
                                value={editForm.summary || ''}
                                onChange={(event) => setEditForm((prev) => ({
                                    ...prev,
                                    summary: event.target.value
                                }))}
                            />
                        </div>
                        <div className={cn('space-y-2')}>
                            <Label htmlFor='editFile'>Job Description File</Label>
                            <Input
                                id='editFile'
                                type='file'
                                onChange={(event) => setEditFile(event.target.files?.[0])}
                            />
                        </div>
                        <div className={cn('space-y-4 pt-4')}>
                            <h3 className={cn('text-lg font-semibold')}>Manage Reviewers</h3>
                            {isLoadingReviewers ? (
                                <div className={cn('flex items-center gap-2')}>
                                    <Spinner className="size-4" />
                                    <span>Loading reviewers...</span>
                                </div>
                            ) : reviewers.length === 0 ? (
                                <div className={cn('text-sm text-muted-foreground')}>No reviewers assigned.</div>
                            ) : (
                                <div className={cn('space-y-2')}>
                                    {reviewers.map((r) => (
                                        <div key={r.reviewerId} className={cn('flex items-center justify-between gap-4 px-2 py-2 border rounded')}>
                                            <div>
                                                <div className={cn('font-medium')}>{r.reviewer.firstName} {r.reviewer.lastName}</div>
                                                <div className={cn('text-xs text-muted-foreground')}>Assigned by {r.assignedBy.firstName} {r.assignedBy.lastName}</div>
                                            </div>
                                            {isHr ? (
                                                <Button variant='destructive' size='sm' onClick={() => handleRemoveReviewer(r.reviewerId)} disabled={isSaving}>
                                                    Remove
                                                </Button>
                                            ) : null}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {isHr ? (
                                <div className={cn('space-y-3 pt-2')}>
                                    <div className={cn('flex flex-col gap-1')}>
                                        <Label>Assign New Reviewers</Label>
                                        <p className={cn('text-sm text-muted-foreground')}>Search and select employees to assign as reviewers.</p>
                                    </div>
                                    <Input placeholder='Search by name or email...' value={reviewerSearchQuery} onChange={(e) => setReviewerSearchQuery(e.target.value)} />

                                    {isLoadingEmployees ? (
                                        <div className={cn('flex items-center gap-2')}>
                                            <Spinner className="size-4" />
                                            <span>Loading employees...</span>
                                        </div>
                                    ) : (
                                        <div className={cn('max-h-40 overflow-auto rounded-lg border')}>
                                            {employees.filter(emp => {
                                                const q = reviewerSearchQuery.trim().toLowerCase()
                                                if (!q) return true
                                                const name = `${emp.firstName} ${emp.lastName}`.toLowerCase()
                                                return name.includes(q) || emp.email.toLowerCase().includes(q)
                                            }).map(emp => {
                                                const isSelected = selectedReviewerIds.includes(emp.employeeId)
                                                return (
                                                    <button key={emp.employeeId} type='button' onClick={() => toggleSelectedReviewer(emp.employeeId)} className={cn('w-full flex items-center justify-between px-4 py-2 text-sm', isSelected ? 'bg-primary-50' : 'bg-background', 'border-b last:border-b-0 hover:bg-muted/40') } disabled={isSaving}>
                                                        <div>
                                                            <div className={cn('font-medium')}>{emp.firstName} {emp.lastName}</div>
                                                            <div className={cn('text-xs text-muted-foreground')}>{emp.email}</div>
                                                        </div>
                                                        <span className={cn('rounded-full px-2 py-1 text-xs font-semibold', isSelected ? 'bg-primary-100 text-primary-700' : 'bg-muted text-muted-foreground')}>{isSelected ? 'Selected' : 'Select'}</span>
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}

                                    <div className={cn('flex items-center gap-3')}>
                                        <Button onClick={handleAssignSelectedReviewers} disabled={isSaving}>{isSaving ? 'Assigning...' : 'Assign Selected'}</Button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setIsEditOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleEditSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isDeactivateOpen} onOpenChange={setIsDeactivateOpen}>
                <DialogContent className={cn('sm:max-w-md')}>
                    <DialogHeader>
                        <DialogTitle>Deactivate Job Opening</DialogTitle>
                        <DialogDescription>
                            This will deactivate the job and hide it from active listings.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant='outline' onClick={() => setIsDeactivateOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button variant='destructive' onClick={handleDeactivate} disabled={isSaving}>
                            {isSaving ? 'Deactivating...' : 'Deactivate'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
export default JobPage; 