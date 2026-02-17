import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { createJob } from '@/lib/api/job'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { getAllEmployees } from '@/lib/api/hr'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { assignReviewer } from '@/lib/api/jobReviewer'

const createJobSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  summary: z.string().optional(),
  jdFile: z.instanceof(FileList).optional(),
})

type CreateJobFormData = z.infer<typeof createJobSchema>

export default function HrCreateJobPage() {
  const [isSaving, setIsSaving] = useState(false)
  const [employees, setEmployees] = useState<EmployeeSummaryDto[]>([])
  const [selectedReviewerIds, setSelectedReviewerIds] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateJobFormData>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: '',
      summary: '',
    },
  })

  const filteredEmployees = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return employees
    return employees.filter((e) => {
      const name = `${e.firstName} ${e.lastName}`.toLowerCase()
      return name.includes(q) || e.email.toLowerCase().includes(q)
    })
  }, [employees, searchQuery])

  const toggleReviewer = (employeeId: number) => {
    setSelectedReviewerIds((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId]
    )
  }

  const loadEmployees = async () => {
    setIsLoadingEmployees(true)
    try {
      const data = await getAllEmployees()
      setEmployees(data)
    } catch (error) {
      toast.error('Failed to load employees')
      console.error('Error loading employees:', error)
    } finally {
      setIsLoadingEmployees(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const onSubmit = async (data: CreateJobFormData) => {

    setIsSaving(true)
    try {
      const payload = {
        title: data.title,
        summary: data.summary && data.summary.trim() !== '' ? data.summary : undefined,
        jdFile: data.jdFile?.[0],
      }

      const created = await createJob(payload)

      if (selectedReviewerIds.length > 0) {
        try {
          await Promise.all(
            selectedReviewerIds.map((rid) => assignReviewer(created.jobId, rid))
          )
          toast.success('Reviewers assigned')
        } catch (err) {
          toast.error('Failed to assign one or more reviewers')
          console.error('Error assigning reviewers:', err)
        }
      }

      toast.success('Job opening created successfully')
      reset()
      navigate('/job')
    } catch (error) {
      toast.error('Failed to create job opening')
      console.error('Error creating job opening:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
      <div className={cn('max-w-3xl mx-auto space-y-6')}>
        <Card className={cn('border')}> 
          <CardHeader>
            <CardTitle className={cn('text-2xl font-semibold text-foreground')}>
              Create Job Opening
            </CardTitle>
            <CardDescription>
              Provide core job details and upload the job description document.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-5')}>
              <div className={cn('space-y-2')}>
                <Label htmlFor='title'>Job Title</Label>
                <Input id='title' placeholder='Senior Engineer' {...register('title')} disabled={isSaving} />
                {errors.title ? (
                  <p className={cn('text-sm text-destructive')}>{errors.title.message}</p>
                ) : null}
              </div>

              <div className={cn('space-y-2')}>
                <Label htmlFor='summary'>Summary</Label>
                <Input id='summary' placeholder='Brief role summary' {...register('summary')} disabled={isSaving} />
              </div>

              <div className={cn('space-y-2')}>
                <Label htmlFor='jdFile'>Job Description File</Label>
                <Input id='jdFile' type='file' {...register('jdFile')} disabled={isSaving} />
              </div>

                <div className={cn('space-y-3')}>
                  <div className={cn('flex flex-col gap-1')}>
                    <Label>Assign Reviewers</Label>
                    <p className={cn('text-sm text-muted-foreground')}>
                      Select one or more employees to review this job.
                    </p>
                  </div>
                  <Input
                    placeholder='Search by name or email...'
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    disabled={isSaving}
                  />

                  {isLoadingEmployees ? (
                    <div className={cn('flex items-center justify-center py-6 text-muted-foreground gap-2')}>
                      <Spinner className="size-4" />
                      <span>Loading employees...</span>
                    </div>
                  ) : filteredEmployees.length === 0 ? (
                    <div className={cn('rounded-lg border border-dashed p-6 text-center text-muted-foreground')}>
                      No employees found.
                    </div>
                  ) : (
                    <div className={cn('max-h-48 overflow-auto rounded-lg border')}>
                      {filteredEmployees.map((employee) => {
                        const isSelected = selectedReviewerIds.includes(employee.employeeId)
                        return (
                          <button
                            key={employee.employeeId}
                            type='button'
                            onClick={() => toggleReviewer(employee.employeeId)}
                            className={cn(
                              'w-full flex items-center justify-between px-4 py-3 text-sm text-left',
                              isSelected ? 'bg-primary-50' : 'bg-background',
                              'border-b last:border-b-0 hover:bg-muted/40'
                            )}
                            disabled={isSaving}
                          >
                            <div>
                              <p className={cn('font-medium text-foreground')}>
                                {employee.firstName} {employee.lastName}
                              </p>
                              <p className={cn('text-xs text-muted-foreground')}>{employee.email}</p>
                            </div>
                            <span className={cn(
                              'rounded-full px-2 py-1 text-xs font-semibold',
                              isSelected ? 'bg-primary-100 text-primary-700' : 'bg-muted text-muted-foreground'
                            )}>
                              {isSelected ? 'Selected' : 'Select'}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

              <div className={cn('flex items-center gap-3 pt-2')}>
                <Button type='submit' disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Spinner className={cn('mr-2 size-4')} />
                      Creating...
                    </>
                  ) : (
                    'Create Job'
                  )}
                </Button>
                <Button type='button' variant='outline' onClick={() => navigate('/job')} disabled={isSaving}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
