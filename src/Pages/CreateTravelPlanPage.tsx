import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { createTravelPlan, type CreateTravelPlanRequest } from '@/lib/api/travel'
import { getAllEmployees } from '@/lib/api/hr'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

const createTravelSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
}).refine((data) => {
  const today = new Date().toISOString().split('T')[0]
  if (data.startDate && new Date(data.startDate) < new Date(today)) {
    return false
  }
  return true
}, {
  message: 'Start date cannot be before today',
  path: ['startDate'],
}).refine((data) => {
  const today = new Date().toISOString().split('T')[0]
  if (data.endDate && new Date(data.endDate) < new Date(today)) {
    return false
  }
  return true
}, {
  message: 'End date cannot be before today',
  path: ['endDate'],
}).refine((data) => {
  if (!data.startDate || !data.endDate) return true
  return new Date(data.startDate) <= new Date(data.endDate)
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

type CreateTravelFormData = z.infer<typeof createTravelSchema>

export default function CreateTravelPlanPage() {
  const [employees, setEmployees] = useState<EmployeeSummaryDto[]>([])
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const navigate = useNavigate()

  const today = new Date().toISOString().split('T')[0]

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTravelFormData>({
    resolver: zodResolver(createTravelSchema),
    defaultValues: {
      title: '',
      description: '',
      startDate: today,
      endDate: today,
    },
  })

  const filteredEmployees = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return employees
    return employees.filter((employee) => {
      const name = `${employee.firstName} ${employee.lastName}`.toLowerCase()
      return name.includes(query) || employee.email.toLowerCase().includes(query)
    })
  }, [employees, searchQuery])

  const toggleEmployee = (employeeId: number) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(employeeId)
        ? prev.filter((id) => id !== employeeId)
        : [...prev, employeeId]
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

  const onSubmit = async (data: CreateTravelFormData) => {
    if (selectedEmployeeIds.length === 0) {
      toast.error('Select at least one employee')
      return
    }

    const payload: CreateTravelPlanRequest = {
      title: data.title,
      description: data.description || undefined,
      startDate: data.startDate,
      endDate: data.endDate,
      employeeIds: selectedEmployeeIds,
    }

    setIsSaving(true)
    try {
      await createTravelPlan(payload)
      toast.success('Travel plan created successfully')
      navigate('/hr/travels/created')
    } catch (error) {
      toast.error('Failed to create travel plan')
      console.error('Error creating travel plan:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
      <div className={cn('max-w-5xl mx-auto space-y-6')}>
        <Card className={cn('border')}>
          <CardHeader>
            <CardTitle className={cn('text-2xl font-semibold text-foreground')}>
              Create Travel Plan
            </CardTitle>
            <CardDescription>
              Define travel details and assign employees to the plan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6')}>
              <div className={cn('grid gap-4 md:grid-cols-2')}>
                <div className={cn('space-y-2')}>
                  <Label htmlFor='title'>Title</Label>
                  <Input id='title' placeholder='Client Visit' {...register('title')} disabled={isSaving} />
                  {errors.title ? (
                    <p className={cn('text-sm text-destructive')}>{errors.title.message}</p>
                  ) : null}
                </div>
                <div className={cn('space-y-2')}>
                  <Label htmlFor='description'>Description</Label>
                  <Input id='description' placeholder='On-site workshop' {...register('description')} disabled={isSaving} />
                </div>
                <div className={cn('space-y-2')}>
                  <Label htmlFor='startDate'>Start Date</Label>
                  <Input id='startDate' type='date' min={today} {...register('startDate')} disabled={isSaving} />
                  {errors.startDate ? (
                    <p className={cn('text-sm text-destructive')}>{errors.startDate.message}</p>
                  ) : null}
                </div>
                <div className={cn('space-y-2')}>
                  <Label htmlFor='endDate'>End Date</Label>
                  <Input id='endDate' type='date' min={today} {...register('endDate')} disabled={isSaving} />
                  {errors.endDate ? (
                    <p className={cn('text-sm text-destructive')}>{errors.endDate.message}</p>
                  ) : null}
                </div>
              </div>

              <div className={cn('space-y-3')}> 
                <div className={cn('flex flex-col gap-1')}>
                  <Label>Assign Employees</Label>
                  <p className={cn('text-sm text-muted-foreground')}>
                    Select employees to include in this travel plan.
                  </p>
                </div>
                <Input
                  placeholder='Search by name or email...'
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
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
                  <div className={cn('max-h-64 overflow-auto rounded-lg border')}>
                    {filteredEmployees.map((employee) => {
                      const isSelected = selectedEmployeeIds.includes(employee.employeeId)
                      return (
                        <button
                          key={employee.employeeId}
                          type='button'
                          onClick={() => toggleEmployee(employee.employeeId)}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-3 text-sm text-left',
                            isSelected ? 'bg-primary-50' : 'bg-background',
                            'border-b last:border-b-0 hover:bg-muted/40'
                          )}
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

              <div className={cn('flex items-center gap-3')}>
                <Button type='submit' disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Spinner className={cn('mr-2 size-4')} />
                      Creating...
                    </>
                  ) : (
                    'Create Travel Plan'
                  )}
                </Button>
                <Button type='button' variant='outline' onClick={() => navigate('/hr/travels/created')} disabled={isSaving}>
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