import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    getExpenseById,
    getExpenseReceipts,
    getExpenseParticipants,
    approveExpense,
    rejectExpense,
    getTravelEmployeeTotal,
    getTravelTotal,
    type TravelExpenseDto,
    type ExpenseReceiptDto
} from '@/lib/api/travelExpense'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { getFileUrl } from '@/lib/api/file'
import ExpenseDetailsView from '@/components/ExpenseDetailsView'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog'
import { ArrowLeft, Check, X as XIcon } from 'lucide-react'

export default function HrExpenseDetails() {
    const { expenseId } = useParams<{ expenseId: string }>()
    const navigate = useNavigate()

    const [expense, setExpense] = useState<TravelExpenseDto | null>(null)
    const [receipts, setReceipts] = useState<ExpenseReceiptDto[]>([])
    const [participants, setParticipants] = useState<EmployeeSummaryDto[]>([])
    const [employeeTotal, setEmployeeTotal] = useState<number>(0)
    const [travelTotal, setTravelTotal] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(true)
    const [isApproving, setIsApproving] = useState(false)
    const [isRejecting, setIsRejecting] = useState(false)
    const [showApprovalForm, setShowApprovalForm] = useState(false)
    const [showRejectionForm, setShowRejectionForm] = useState(false)
    const [approvalRemarks, setApprovalRemarks] = useState('')
    const [rejectionRemarks, setRejectionRemarks] = useState('')

    const loadExpenseDetails = useCallback(async () => {
        if (!expenseId) {
            navigate('/hr/travel-expenses')
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

            const [empTotal, travTotal] = await Promise.all([
                getTravelEmployeeTotal(expenseData.travelPlanId, expenseData.submittedBy.employeeId),
                getTravelTotal(expenseData.travelPlanId)
            ])

            setEmployeeTotal(empTotal)
            setTravelTotal(travTotal)
        } catch (error) {
            toast.error('Failed to load expense details')
            console.error('Error loading expense:', error)
            navigate('/hr/travel-expenses')
        } finally {
            setIsLoading(false)
        }
    }, [expenseId, navigate])

    useEffect(() => {
        loadExpenseDetails()
    }, [loadExpenseDetails])

    const handleApprove = async () => {
        if (!expense || !expenseId) return

        setIsApproving(true)
        try {
            const updatedExpense = await approveExpense(Number(expenseId), { 
                remarks: approvalRemarks || undefined 
            })
            setExpense(updatedExpense)
            setShowApprovalForm(false)
            setApprovalRemarks('')
            toast.success('Expense approved successfully')
        } catch (error) {
            toast.error('Failed to approve expense')
            console.error('Error approving expense:', error)
        } finally {
            setIsApproving(false)
        }
    }

    const handleReject = async () => {
        if (!expense || !expenseId) return

        if (!rejectionRemarks.trim()) {
            toast.error('Remarks are required for rejection')
            return
        }

        if (rejectionRemarks.trim().length < 10) {
            toast.error('Remarks must be at least 10 characters')
            return
        }

        setIsRejecting(true)
        try {
            const updatedExpense = await rejectExpense(Number(expenseId), { 
                remarks: rejectionRemarks 
            })
            setExpense(updatedExpense)
            setShowRejectionForm(false)
            setRejectionRemarks('')
            toast.success('Expense rejected')
        } catch (error) {
            toast.error('Failed to reject expense')
            console.error('Error rejecting expense:', error)
        } finally {
            setIsRejecting(false)
        }
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

    const statusLower = expense?.approvalStatusName?.toLowerCase()
    const canApproveOrReject = statusLower === 'submitted' || statusLower === 'pending'
    const isApproved = statusLower === 'approved'
    const isRejected = statusLower === 'rejected'

    if (isLoading) {
        return (
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('max-w-6xl mx-auto')}>
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
                <div className={cn('max-w-6xl mx-auto')}>
                    <div className={cn('rounded-lg border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive')}>
                        Expense not found
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
            <div className={cn('max-w-6xl mx-auto space-y-6')}>
                <div className={cn('flex items-center justify-between')}>
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/hr/travel-expenses')}
                        className={cn('gap-2')}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Expenses
                    </Button>
                    {canApproveOrReject && (
                        <div className={cn('flex gap-2')}>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowApprovalForm(true)
                                    setShowRejectionForm(false)
                                }}
                                className={cn('gap-2 text-green-600 hover:text-green-700 border-green-300')}
                            >
                                <Check className="h-4 w-4" />
                                Approve
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowRejectionForm(true)
                                    setShowApprovalForm(false)
                                }}
                                className={cn('gap-2 text-red-600 hover:text-red-700 border-red-300')}
                            >
                                <XIcon className="h-4 w-4" />
                                Reject
                            </Button>
                        </div>
                    )}
                </div>

                                <Dialog open={showApprovalForm} onOpenChange={setShowApprovalForm}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Approve Expense</DialogTitle>
                                        </DialogHeader>
                                        <div className={cn('space-y-4 pt-2')}>
                                            <Label htmlFor="approval-remarks">Remarks (Optional)</Label>
                                            <Input
                                                id="approval-remarks"
                                                placeholder="Add any comments about this approval..."
                                                value={approvalRemarks}
                                                onChange={(e) => setApprovalRemarks(e.target.value)}
                                                disabled={isApproving}
                                            />
                                        </div>
                                        <DialogFooter>
                                            <div className={cn('flex gap-2 w-full justify-end')}> 
                                                <Button variant="outline" onClick={() => setShowApprovalForm(false)} disabled={isApproving}>Cancel</Button>
                                                <Button onClick={handleApprove} disabled={isApproving} className={cn('bg-green-600 hover:bg-green-700')}> {isApproving && <Spinner className="mr-2 h-4 w-4"/>} Confirm Approval</Button>
                                            </div>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                                <Dialog open={showRejectionForm} onOpenChange={setShowRejectionForm}>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Reject Expense</DialogTitle>
                                            <DialogDescription>Please provide a reason for rejection (min 10 characters).</DialogDescription>
                                        </DialogHeader>
                                        <div className={cn('space-y-4 pt-2')}>
                                            <Label htmlFor="rejection-remarks">Remarks (Required)</Label>
                                            <Input
                                                id="rejection-remarks"
                                                placeholder="Please provide a reason for rejection (min 10 characters)..."
                                                value={rejectionRemarks}
                                                onChange={(e) => setRejectionRemarks(e.target.value)}
                                                disabled={isRejecting}
                                            />
                                            {rejectionRemarks.length > 0 && rejectionRemarks.length < 10 && (
                                                <p className={cn('text-xs text-destructive')}>Remarks must be at least 10 characters</p>
                                            )}
                                        </div>
                                        <DialogFooter>
                                            <div className={cn('flex gap-2 w-full justify-end')}> 
                                                <Button variant="outline" onClick={() => setShowRejectionForm(false)} disabled={isRejecting}>Cancel</Button>
                                                <Button onClick={handleReject} disabled={isRejecting || rejectionRemarks.trim().length < 10} variant="destructive">{isRejecting && <Spinner className="mr-2 h-4 w-4"/>} Confirm Rejection</Button>
                                            </div>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>

                <ExpenseDetailsView
                  expense={expense}
                  receipts={receipts}
                  participants={participants}
                  employeeTotal={employeeTotal}
                  travelTotal={travelTotal}
                  canApproveOrReject={canApproveOrReject}
                  isApproved={isApproved}
                  isRejected={isRejected}
                  onViewReceipt={(path) => window.open(getReceiptUrl(path), '_blank')}
                  travelLink={`/hr/travels/${expense.travelPlanId}`}
                />
            </div>
        </div>
    )
}
