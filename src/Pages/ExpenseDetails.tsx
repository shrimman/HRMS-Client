import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    getExpenseById,
    getExpenseReceipts,
    getExpenseParticipants,
    deleteExpense,
    type TravelExpenseDto,
    type ExpenseReceiptDto
} from '@/lib/api/travelExpense'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { getFileUrl } from '@/lib/api/file'
import ExpenseStatusBadge from '@/components/ExpenseStatusBadge'
import { ArrowLeft, Pencil, Trash2, FileText, Image as ImageIcon, ExternalLink } from 'lucide-react'

export default function ExpenseDetails() {
    const { expenseId } = useParams<{ expenseId: string }>()
    const navigate = useNavigate()

    const [expense, setExpense] = useState<TravelExpenseDto | null>(null)
    const [receipts, setReceipts] = useState<ExpenseReceiptDto[]>([])
    const [participants, setParticipants] = useState<EmployeeSummaryDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)

    const loadExpenseDetails = useCallback(async () => {
        if (!expenseId) {
            navigate('/travel-expenses')
            return
        }

        setIsLoading(true)
        try {
            const [expenseData, receiptData, participantData] = await Promise.all([
                getExpenseById(Number(expenseId)),
                getExpenseReceipts(Number(expenseId)),
                getExpenseParticipants(Number(expenseId))
            ])

            setExpense(expenseData)
            setReceipts(receiptData)
            setParticipants(participantData)
        } catch (error) {
            toast.error('Failed to load expense details')
            console.error('Error loading expense:', error)
            navigate('/travel-expenses')
        } finally {
            setIsLoading(false)
        }
    }, [expenseId, navigate])

    useEffect(() => {
        loadExpenseDetails()
    }, [loadExpenseDetails])

    const handleDelete = async () => {
        if (!expense || !expenseId) return

        const confirmed = window.confirm('Are you sure you want to delete this expense?')
        if (!confirmed) return

        setIsDeleting(true)
        try {
            await deleteExpense(Number(expenseId))
            toast.success('Expense deleted successfully')
            navigate('/travel-expenses')
        } catch (error) {
            toast.error('Failed to delete expense')
            console.error('Error deleting expense:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getReceiptUrl = (path: string) => {
        const parts = path.split('/')
        if (parts.length >= 2) {
            const category = parts[0]
            const filename = parts.slice(1).join('/')
            return getFileUrl(category, filename)
        }
        return getFileUrl('expense-receipts', path)
    }

    const isDraft = expense?.approvalStatusName.toLowerCase() === 'draft'
    const isPending = expense?.approvalStatusName.toLowerCase() === 'submitted' || expense?.approvalStatusName.toLowerCase() === 'pending'
    const isApproved = expense?.approvalStatusName.toLowerCase() === 'approved'
    const isRejected = expense?.approvalStatusName.toLowerCase() === 'rejected'

    if (isLoading) {
        return (
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('max-w-5xl mx-auto')}>
                    <div className={cn('flex items-center justify-center py-12 text-muted-foreground gap-2')}>
                        <Spinner className="size-5" />
                        <span>Loading expense details...</span>
                    </div>
                </div>
            </div>
        )
    }

    if (!expense) {
        return (
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('max-w-5xl mx-auto')}>
                    <div className={cn('rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive')}>
                        Expense not found
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
            <div className={cn('max-w-5xl mx-auto space-y-6')}>
                <div className={cn('flex items-center justify-between')}>
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/travel-expenses')}
                        className={cn('gap-2')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Expenses
                    </Button>
                    {isDraft && (
                        <div className={cn('flex gap-2')}>
                            <Button
                                variant="outline"
                                onClick={() => navigate(`/travel-expenses/${expenseId}/edit`)}
                                className={cn('gap-2')}
                            >
                                <Pencil className="h-4 w-4" />
                                Edit
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className={cn('gap-2')}
                            >
                                {isDeleting ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                                Delete
                            </Button>
                        </div>
                    )}
                </div>

                <Card className={cn('border')}>
                    <CardHeader>
                        <div className={cn('flex items-start justify-between gap-4')}>
                            <div className={cn('space-y-1')}>
                                <CardTitle className={cn('text-2xl font-semibold text-foreground')}>
                                    Expense #{expense.expenseId}
                                </CardTitle>
                                <Link
                                    to={`/travel/${expense.travelPlanId}`}
                                    className={cn('text-sm text-primary hover:underline inline-flex items-center gap-1')}
                                >
                                    {expense.travelPlanTitle}
                                    <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                            <ExpenseStatusBadge status={expense.approvalStatusName} />
                        </div>
                    </CardHeader>
                    <CardContent className={cn('space-y-6')}>
                        <div className={cn('grid gap-6 md:grid-cols-2')}>
                            <div className={cn('space-y-1')}>
                                <p className={cn('text-sm font-medium text-muted-foreground')}>Expense Type</p>
                                <p className={cn('text-base font-semibold')}>{expense.expenseTypeName}</p>
                            </div>

                            <div className={cn('space-y-1')}>
                                <p className={cn('text-sm font-medium text-muted-foreground')}>Amount</p>
                                <p className={cn('text-base font-semibold text-primary')}>
                                    {formatCurrency(expense.amount)}
                                </p>
                            </div>

                            <div className={cn('space-y-1')}>
                                <p className={cn('text-sm font-medium text-muted-foreground')}>Expense Date</p>
                                <p className={cn('text-base')}>{formatDate(expense.expenseDate)}</p>
                            </div>

                            <div className={cn('space-y-1')}>
                                <p className={cn('text-sm font-medium text-muted-foreground')}>Submitted By</p>
                                <p className={cn('text-base')}>
                                    {expense.submittedBy.firstName} {expense.submittedBy.lastName}
                                </p>
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
                            <div className={cn('space-y-3')}>
                                <h3 className={cn('text-lg font-semibold')}>Participants</h3>
                                <div className={cn('grid gap-2 sm:grid-cols-2 lg:grid-cols-3')}>
                                    {participants.map(participant => (
                                        <div
                                            key={participant.employeeId}
                                            className={cn('flex items-center gap-2 p-3 rounded-lg border bg-muted/30')}
                                        >
                                            <div className={cn('h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold')}>
                                                {participant.firstName[0]}{participant.lastName[0]}
                                            </div>
                                            <div className={cn('min-w-0 flex-1')}>
                                                <p className={cn('text-sm font-medium truncate')}>
                                                    {participant.firstName} {participant.lastName}
                                                </p>
                                                <p className={cn('text-xs text-muted-foreground truncate')}>
                                                    {participant.email}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={cn('space-y-3')}>
                            <h3 className={cn('text-lg font-semibold')}>Receipts</h3>
                            {receipts.length === 0 ? (
                                <p className={cn('text-sm text-muted-foreground')}>No receipts uploaded</p>
                            ) : (
                                <div className={cn('grid gap-3 sm:grid-cols-2')}>
                                    {receipts.map(receipt => (
                                        <div
                                            key={receipt.expenseReceiptId}
                                            className={cn('flex items-center gap-3 p-4 border rounded-lg hover:bg-muted/30 transition-colors')}
                                        >
                                            {receipt.fileName.toLowerCase().endsWith('.pdf') ? (
                                                <FileText className="h-10 w-10 text-red-500 shrink-0" />
                                            ) : (
                                                <ImageIcon className="h-10 w-10 text-blue-500 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{receipt.fileName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Uploaded {formatDate(receipt.uploadedAt)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    By {receipt.updatedByEmployee.firstName} {receipt.updatedByEmployee.lastName}
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(getReceiptUrl(receipt.receiptPath), '_blank')}
                                            >
                                                View
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {(isApproved || isRejected) && (
                            <div className={cn('space-y-3 border-t pt-6')}>
                                <h3 className={cn('text-lg font-semibold')}>Approval Information</h3>
                                <div className={cn('grid gap-4 md:grid-cols-2')}>
                                    <div className={cn('space-y-1')}>
                                        <p className={cn('text-sm font-medium text-muted-foreground')}>
                                            {isApproved ? 'Approved By' : 'Rejected By'}
                                        </p>
                                        <p className={cn('text-base')}>
                                            {expense.hrActionBy
                                                ? `${expense.hrActionBy.firstName} ${expense.hrActionBy.lastName}`
                                                : 'N/A'}
                                        </p>
                                    </div>

                                    {expense.hrRemarks && (
                                        <div className={cn('space-y-1 md:col-span-2')}>
                                            <p className={cn('text-sm font-medium text-muted-foreground')}>Remarks</p>
                                            <p className={cn('text-base p-3 rounded-lg bg-muted/50')}>
                                                {expense.hrRemarks}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {isDraft && (
                            <div className={cn('rounded-lg border border-blue-200 bg-blue-50 p-4')}>
                                <p className={cn('text-sm text-blue-900')}>
                                    This expense is in draft status. You can edit or delete it before submitting for approval.
                                </p>
                            </div>
                        )}

                        {isPending && (
                            <div className={cn('rounded-lg border border-yellow-200 bg-yellow-50 p-4')}>
                                <p className={cn('text-sm text-yellow-900')}>
                                    This expense is pending HR review. You will be notified once it's approved or rejected.
                                </p>
                            </div>
                        )}

                        {isRejected && (
                            <div className={cn('rounded-lg border border-red-200 bg-red-50 p-4')}>
                                <p className={cn('text-sm text-red-900 font-medium')}>
                                    This expense was rejected. Please check the remarks above for details.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
