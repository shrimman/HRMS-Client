import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { getPendingManagerApprovals, type TravelExpenseDto } from '@/lib/api/travelExpense'
import ExpenseStatusBadge from '@/components/ExpenseStatusBadge'
import { Eye } from 'lucide-react'

export default function ManagerPendingApprovals() {
  const [expenses, setExpenses] = useState<TravelExpenseDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()

  const loadPending = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await getPendingManagerApprovals()
      setExpenses(data)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load pending approvals')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPending()
  }, [loadPending])

  return (
    <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
      <div className={cn('max-w-6xl mx-auto space-y-6')}>
        <Card className={cn('border')}>
          <CardHeader>
            <div className={cn('flex items-center justify-between')}>
              <div>
                <CardTitle className={cn('text-2xl font-semibold')}>Manager - Pending Expense Approvals</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className={cn('flex items-center justify-center py-12 text-muted-foreground gap-2')}>
                <Spinner className="size-5" />
                <span>Loading pending approvals...</span>
              </div>
            ) : expenses.length === 0 ? (
              <div className={cn('rounded-lg border border-dashed p-12 text-center text-muted-foreground')}>
                No pending approvals
              </div>
            ) : (
              <div className={cn('space-y-4')}>
                {expenses.map(exp => (
                  <div key={exp.expenseId} className={cn('flex items-center justify-between p-4 border rounded-lg')}>
                    <div className={cn('min-w-0')}>
                      <p className={cn('text-sm text-muted-foreground')}>{exp.travelPlanTitle}</p>
                      <p className={cn('text-base font-semibold truncate')}>Expense #{exp.expenseId} — {exp.expenseTypeName} — {new Date(exp.expenseDate).toLocaleDateString()}</p>
                      <p className={cn('text-sm')}>Submitted by {exp.submittedBy.firstName} {exp.submittedBy.lastName}</p>
                    </div>
                    <div className={cn('flex items-center gap-3')}>
                      <ExpenseStatusBadge status={exp.approvalStatusName} />
                      <Button variant="outline" size="sm" onClick={() => navigate(`/manager/travel-expenses/${exp.expenseId}`)}>
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
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
