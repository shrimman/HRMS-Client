import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { getMyExpenses, getExpenseStatusTypes, deleteExpense, type TravelExpenseDto, type ExpenseStatusTypeDto } from '@/lib/api/travelExpense'
import { toast } from 'sonner'
import ExpenseStatusBadge from '@/components/ExpenseStatusBadge'
import { Eye, Pencil, Trash2, Plus } from 'lucide-react'

function TravelExpense() {
    const [expenses, setExpenses] = useState<TravelExpenseDto[]>([])
    const [statusTypes, setStatusTypes] = useState<ExpenseStatusTypeDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [filterStatus, setFilterStatus] = useState<string>('all')
    const navigate = useNavigate()

    const loadExpenses = async () => {
        setIsLoading(true)
        try {
            const [expensesData, statusTypesData] = await Promise.all([
                getMyExpenses(),
                getExpenseStatusTypes()
            ])

            setExpenses(expensesData)
            setStatusTypes(statusTypesData)
        } catch (error) {
            toast.error('Failed to load expenses')
            console.error('Error loading expenses:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadExpenses()
    }, [])


    const filteredExpenses = filterStatus === 'all'
        ? expenses
        : expenses.filter(exp => exp.approvalStatusName.toLowerCase() === filterStatus.toLowerCase())

    const groupedExpenses = filteredExpenses.reduce((acc, expense) => {
        const travelId = expense.travelPlanId
        if (!acc[travelId]) {
            acc[travelId] = {
                travelTitle: expense.travelPlanTitle,
                expenses: [],
                total: 0
            }
        }
        acc[travelId].expenses.push(expense)
        acc[travelId].total += expense.amount
        return acc
    }, {} as Record<number, { travelTitle: string; expenses: TravelExpenseDto[]; total: number }>)

    const handleDeleteExpense = async (expenseId: number) => {
        const ok = window.confirm('Are you sure you want to delete this expense? This cannot be undone.')
        if (!ok) return

        try {
            await deleteExpense(expenseId)
            setExpenses(prev => prev.filter(e => e.expenseId !== expenseId))
            toast.success('Expense deleted')
        } catch (err) {
            console.error('Failed to delete expense:', err)
            toast.error('Failed to delete expense')
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
            month: 'short',
            day: 'numeric'
        })
    }

    const isDraft = (status: string) => status.toLowerCase() === 'draft'

    return (
        <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
            <div className={cn('max-w-7xl mx-auto space-y-6')}>
                <Card className={cn('border')}>
                    <CardHeader>
                        <div className={cn('flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4')}>
                            <div>
                                <CardTitle className={cn('text-2xl font-semibold text-foreground')}>
                                    Travel Expenses
                                </CardTitle>
                                <CardDescription>
                                    View and manage your travel expense claims
                                </CardDescription>
                            </div>
                            <Button
                                onClick={() => navigate('/travel-expenses/new')}
                                className={cn('gap-2')}
                            >
                                <Plus className="h-4 w-4" />
                                Add New Expense
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className={cn('mb-4 flex gap-2 flex-wrap')}>
                            <Button
                                variant={filterStatus === 'all' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setFilterStatus('all')}
                            >
                                All
                            </Button>
                            {statusTypes.map(status => (
                                <Button
                                    key={status.id}
                                    variant={filterStatus === status.name.toLowerCase() ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setFilterStatus(status.name.toLowerCase())}
                                >
                                    {status.name}
                                </Button>
                            ))}
                        </div>

                        {isLoading ? (
                            <div className={cn('flex items-center justify-center py-12 text-muted-foreground gap-2')}>
                                <Spinner className="size-5" />
                                <span>Loading expenses...</span>
                            </div>
                        ) : filteredExpenses.length === 0 ? (
                            <div className={cn('rounded-lg border border-dashed p-12 text-center text-muted-foreground')}>
                                {filterStatus === 'all'
                                    ? 'No expenses found. Click "Add New Expense" to create one.'
                                    : `No ${filterStatus} expenses found.`}
                            </div>
                        ) : (
                            <div className={cn('space-y-6')}>
                                {Object.entries(groupedExpenses).map(([travelId, group]) => (
                                    <div key={travelId} className={cn('space-y-3')}>
                                        <div className={cn('flex items-center justify-between border-b pb-2')}>
                                            <h3 className={cn('font-semibold text-lg text-foreground')}>
                                                {group.travelTitle}
                                            </h3>
                                            <span className={cn('text-sm font-medium text-muted-foreground')}>
                                                Total: {formatCurrency(group.total)}
                                            </span>
                                        </div>
                                        <div className={cn('overflow-x-auto')}>
                                            <table className={cn('w-full min-w-200')}>
                                                <thead>
                                                    <tr className={cn('border-b bg-muted/50')}>
                                                        <th className={cn('text-left p-3 text-sm font-medium text-muted-foreground')}>
                                                            Expense Type
                                                        </th>
                                                        <th className={cn('text-left p-3 text-sm font-medium text-muted-foreground')}>
                                                            Amount
                                                        </th>
                                                        <th className={cn('text-left p-3 text-sm font-medium text-muted-foreground')}>
                                                            Expense Date
                                                        </th>
                                                        <th className={cn('text-left p-3 text-sm font-medium text-muted-foreground')}>
                                                            Submitted Date
                                                        </th>
                                                        <th className={cn('text-left p-3 text-sm font-medium text-muted-foreground')}>
                                                            Status
                                                        </th>
                                                        <th className={cn('text-right p-3 text-sm font-medium text-muted-foreground')}>
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {group.expenses.map((expense) => (
                                                        <tr
                                                            key={expense.expenseId}
                                                            className={cn('border-b hover:bg-muted/30 transition-colors')}
                                                        >
                                                            <td className={cn('p-3 text-sm')}>
                                                                {expense.expenseTypeName}
                                                            </td>
                                                            <td className={cn('p-3 text-sm font-medium')}>
                                                                {formatCurrency(expense.amount)}
                                                            </td>
                                                            <td className={cn('p-3 text-sm text-muted-foreground')}>
                                                                {formatDate(expense.expenseDate)}
                                                            </td>
                                                            <td className={cn('p-3 text-sm text-muted-foreground')}>
                                                                {expense.submittedAt ? formatDate(expense.submittedAt) : '-'}
                                                            </td>
                                                            <td className={cn('p-3')}>
                                                                <ExpenseStatusBadge status={expense.approvalStatusName} />
                                                            </td>
                                                            <td className={cn('p-3')}>
                                                                <div className={cn('flex items-center justify-end gap-2')}>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => navigate(`/travel-expenses/${expense.expenseId}`)}
                                                                        title="View Details"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                    </Button>
                                                                    {isDraft(expense.approvalStatusName) && (
                                                                        <>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => navigate(`/travel-expenses/${expense.expenseId}/edit`)}
                                                                                title="Edit"
                                                                            >
                                                                                <Pencil className="h-4 w-4" />
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                className="text-destructive hover:text-destructive"
                                                                                title="Delete"
                                                                                onClick={() => handleDeleteExpense(expense.expenseId)}
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
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

export default TravelExpense