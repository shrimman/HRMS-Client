import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ExpenseStatusBadge from '@/components/ExpenseStatusBadge'
import { FileText, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TravelExpenseDto, ExpenseReceiptDto } from '@/lib/api/travelExpense'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { Button } from '@/components/ui/button'

type Props = {
  expense: TravelExpenseDto
  receipts: ExpenseReceiptDto[]
  participants: EmployeeSummaryDto[]
  employeeTotal: number
  travelTotal: number
  canApproveOrReject: boolean
  isApproved: boolean
  isRejected: boolean
  onViewReceipt: (path: string) => void
  travelLink?: string
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount)

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })

const formatDateTime = (dateString: string) =>
  new Date(dateString).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default function ExpenseDetailsView({
  expense,
  receipts,
  participants,
  employeeTotal,
  travelTotal,
  canApproveOrReject,
  isApproved,
  isRejected,
  onViewReceipt,
  travelLink,
}: Props) {
  return (
    <div className={cn('grid gap-6 lg:grid-cols-3')}>
      <Card className={cn('lg:col-span-2 border')}>
        <CardHeader>
          <div className={cn('flex items-start justify-between gap-4')}>
            <div className={cn('space-y-1')}>
              <CardTitle className={cn('text-2xl font-semibold text-foreground')}>
                Expense #{expense.expenseId}
              </CardTitle>
              {travelLink ? (
                <a href={travelLink} className={cn('text-sm text-primary hover:underline inline-flex items-center gap-1')}>
                  {expense.travelPlanTitle}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <p className={cn('text-sm text-muted-foreground')}>{expense.travelPlanTitle}</p>
              )}
            </div>
            <ExpenseStatusBadge status={expense.approvalStatusName} />
          </div>
        </CardHeader>
        <CardContent className={cn('space-y-6')}>
          <div className={cn('grid gap-4 sm:grid-cols-2')}>
            <div className={cn('space-y-1')}>
              <p className={cn('text-sm font-medium text-muted-foreground')}>Employee</p>
              <p className={cn('text-base font-semibold')}>{expense.submittedBy.firstName} {expense.submittedBy.lastName}</p>
            </div>

            <div className={cn('space-y-1')}>
              <p className={cn('text-sm font-medium text-muted-foreground')}>Expense Type</p>
              <p className={cn('text-base font-semibold')}>{expense.expenseTypeName}</p>
            </div>

            <div className={cn('space-y-1')}>
              <p className={cn('text-sm font-medium text-muted-foreground')}>Amount</p>
              <p className={cn('text-base font-semibold text-primary')}>{formatCurrency(expense.amount)}</p>
            </div>

            <div className={cn('space-y-1')}>
              <p className={cn('text-sm font-medium text-muted-foreground')}>Expense Date</p>
              <p className={cn('text-base')}>{formatDate(expense.expenseDate)}</p>
            </div>

            {expense.submittedAt && (
              <div className={cn('space-y-1')}>
                <p className={cn('text-sm font-medium text-muted-foreground')}>Submitted Date</p>
                <p className={cn('text-base')}>{formatDateTime(expense.submittedAt)}</p>
              </div>
            )}

            <div className={cn('space-y-1')}>
              <p className={cn('text-sm font-medium text-muted-foreground')}>Last Updated</p>
              <p className={cn('text-base')}>{formatDateTime(expense.updatedAt)}</p>
            </div>
          </div>

          {participants.length > 0 && (
            <div className={cn('space-y-3 border-t pt-4')}>
              <h3 className={cn('text-base font-semibold')}>Participants</h3>
              <div className={cn('grid gap-2 sm:grid-cols-2')}>
                {participants.map(p => (
                  <div key={p.employeeId} className={cn('flex items-center gap-2 p-2 rounded-lg border bg-muted/30')}>
                    <div className={cn('h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold')}>
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div className={cn('min-w-0 flex-1')}>
                      <p className={cn('text-sm font-medium truncate')}>{p.firstName} {p.lastName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={cn('space-y-3 border-t pt-4')}>
            <h3 className={cn('text-base font-semibold')}>Receipts</h3>
            {receipts.length === 0 ? (
              <p className={cn('text-sm text-muted-foreground')}>No receipts uploaded</p>
            ) : (
              <div className={cn('grid gap-3')}>
                {receipts.map(r => (
                  <div key={r.expenseReceiptId} className={cn('flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors')}>
                    {r.fileName.toLowerCase().endsWith('.pdf') ? (
                      <FileText className="h-8 w-8 text-red-500 shrink-0" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-blue-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{r.fileName}</p>
                      <p className="text-xs text-muted-foreground">Uploaded {formatDate(r.uploadedAt)}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onViewReceipt(r.receiptPath)}>View</Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(isApproved || isRejected) && (
            <div className={cn('space-y-3 border-t pt-4')}>
              <h3 className={cn('text-base font-semibold')}>Approval Information</h3>
              <div className={cn('grid gap-3')}>
                <div className={cn('space-y-1')}>
                  <p className={cn('text-sm font-medium text-muted-foreground')}>{isApproved ? 'Approved By' : 'Rejected By'}</p>
                  <p className={cn('text-base')}>{expense.hrActionBy ? `${expense.hrActionBy.firstName} ${expense.hrActionBy.lastName}` : 'N/A'}</p>
                </div>

                {expense.hrRemarks && (
                  <div className={cn('space-y-1')}>
                    <p className={cn('text-sm font-medium text-muted-foreground')}>Remarks</p>
                    <p className={cn('text-sm p-3 rounded-lg bg-muted/50')}>{expense.hrRemarks}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className={cn('space-y-4')}>
        <Card>
          <CardHeader>
            <CardTitle className={cn('text-base')}>Expense Summary</CardTitle>
          </CardHeader>
          <CardContent className={cn('space-y-4')}>
            <div className={cn('space-y-1')}>
              <p className={cn('text-sm text-muted-foreground')}>Employee Total (This Travel)</p>
              <p className={cn('text-lg font-bold')}>{formatCurrency(employeeTotal)}</p>
            </div>
            <div className={cn('space-y-1')}>
              <p className={cn('text-sm text-muted-foreground')}>Travel Total (All Employees)</p>
              <p className={cn('text-lg font-bold')}>{formatCurrency(travelTotal)}</p>
            </div>
          </CardContent>
        </Card>

        {canApproveOrReject && (
          <Card className={cn('border-yellow-200 bg-yellow-50/50')}>
            <CardContent className={cn('pt-6')}>
              <p className={cn('text-sm text-yellow-900')}>This expense is pending review. Verify details and receipts before action.</p>
            </CardContent>
          </Card>
        )}

        {isRejected && (
          <Card className={cn('border-red-200 bg-red-50/50')}>
            <CardContent className={cn('pt-6')}>
              <p className={cn('text-sm text-red-900 font-medium')}>This expense has been rejected.</p>
            </CardContent>
          </Card>
        )}

        {isApproved && (
          <Card className={cn('border-green-200 bg-green-50/50')}>
            <CardContent className={cn('pt-6')}>
              <p className={cn('text-sm text-green-900 font-medium')}>This expense has been approved.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
