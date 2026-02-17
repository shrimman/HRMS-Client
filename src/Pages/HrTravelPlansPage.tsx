import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { getCreatedByMe, type TravelPlanDto } from '@/lib/api/travel'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

export default function HrTravelPlansPage() {
  const [plans, setPlans] = useState<TravelPlanDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const navigate = useNavigate()

  const loadPlans = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const data = await getCreatedByMe()
      setPlans(data)
      toast.success('Travel plans loaded successfully')
    } catch (error) {
      toast.error('Failed to load travel plans')
      console.error('Error loading travel plans:', error)
      setErrorMessage('Failed to load travel plans. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])


  return (
    <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
      <div className={cn('max-w-6xl mx-auto space-y-6')}>
        <Card className={cn('border')}>
          <CardHeader>
            <CardTitle className={cn('text-2xl font-semibold text-foreground')}>
              My Created Travel Plans
            </CardTitle>
            <CardDescription>
              Review and manage travel plans you created for employees.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className={cn('flex items-center justify-center py-10 text-muted-foreground gap-2')}>
                <Spinner className="size-5" />
                <span>Loading travel plans...</span>
              </div>
            ) : errorMessage ? (
              <div className={cn('rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive')}>
                {errorMessage}
              </div>
            ) : plans.length === 0 ? (
              <div className={cn('rounded-lg border border-dashed p-8 text-center text-muted-foreground')}>
                No travel plans created yet.
              </div>
            ) : (
              <div className={cn('space-y-4')}>
                {plans.map((plan) => (
                  <div
                    key={plan.travelId}
                    className={cn('rounded-lg border p-4 hover:bg-muted/30 cursor-pointer transition-colors')}
                    onClick={() => navigate(`/hr/travels/${plan.travelId}`)}
                  >
                    <div className={cn('flex flex-wrap items-center justify-between gap-2')}>
                      <div className={cn('space-y-1')}>
                        <h3 className={cn('text-lg font-semibold text-foreground')}>{plan.title}</h3>
                        <p className={cn('text-sm text-muted-foreground')}>
                          {plan.description || 'No description'}
                        </p>
                      </div>
                      <span className={cn('rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700')}>
                        {(plan.travelers?.length ?? 0)} employees
                      </span>
                    </div>
                    <div className={cn('mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground')}>
                      <span>Start {new Date(plan.startDate).toLocaleDateString()}</span>
                      <span>End {new Date(plan.endDate).toLocaleDateString()}</span>
                      <span>Updated {new Date(plan.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
