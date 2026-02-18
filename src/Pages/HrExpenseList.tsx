import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    filterExpenses,
    getExpenseStatusTypes,
    getExpenseTypes,
    type TravelExpenseDto,
    type ExpenseStatusTypeDto,
    type ExpenseTypeDto,
    type ExpenseFilterRequest
} from '@/lib/api/travelExpense'
import { getAllTravelPlans, type TravelPlanDto } from '@/lib/api/travel'
import { getAllEmployees } from '@/lib/api/hr'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import ExpenseStatusBadge from '@/components/ExpenseStatusBadge'
import { Eye, Filter, X } from 'lucide-react'

export default function HrExpenseList() {
    const navigate = useNavigate()

    const [expenses, setExpenses] = useState<TravelExpenseDto[]>([])
    const [employees, setEmployees] = useState<EmployeeSummaryDto[]>([])
    const [travelPlans, setTravelPlans] = useState<TravelPlanDto[]>([])
    const [statusTypes, setStatusTypes] = useState<ExpenseStatusTypeDto[]>([])
    const [expenseTypes, setExpenseTypes] = useState<ExpenseTypeDto[]>([])

    const [isLoading, setIsLoading] = useState(true)
    const [isLoadingFilters, setIsLoadingFilters] = useState(true)
    const [showFilters, setShowFilters] = useState(false)

    const [filters, setFilters] = useState<ExpenseFilterRequest>({})
    const [searchQuery, setSearchQuery] = useState('')

    const loadFilterData = async () => {
        setIsLoadingFilters(true)
        try {
            const [employeeData, travelData, statusData, typeData] = await Promise.all([
                getAllEmployees(),
                getAllTravelPlans(),
                getExpenseStatusTypes(),
                getExpenseTypes()
            ])
            setEmployees(employeeData)
            setTravelPlans(travelData)
            setExpenseTypes(typeData)

            const filteredStatusData = statusData.filter(status => status.name.toLowerCase() !== 'draft')
            setStatusTypes(filteredStatusData)
        } catch (error) {
            toast.error('Failed to load filter options')
            console.error('Error loading filter data:', error)
        } finally {
            setIsLoadingFilters(false)
        }
    }

    const loadExpenses = useCallback(async () => {
        setIsLoading(true)
        try {
            const data = await filterExpenses(filters)
            const filteredData = data.filter(expense =>
                expense.approvalStatusName.toLowerCase() !== 'draft'
            )
            setExpenses(filteredData)
        } catch (error) {
            toast.error('Failed to load expenses')
            console.error('Error loading expenses:', error)
        } finally {
            setIsLoading(false)
        }
    }, [filters])

    useEffect(() => {
        loadFilterData()
    }, [])

    useEffect(() => {
        loadExpenses()
    }, [loadExpenses])

    const filteredExpenses = useMemo(() => {
        if (!searchQuery.trim()) return expenses

        const query = searchQuery.toLowerCase()
        return expenses.filter(expense => {
            const employeeName = `${expense.submittedBy.firstName} ${expense.submittedBy.lastName}`.toLowerCase()
            const travelTitle = expense.travelPlanTitle.toLowerCase()
            const expenseType = expense.expenseTypeName.toLowerCase()
            const expenseId = expense.expenseId.toString()

            return (
                employeeName.includes(query) ||
                travelTitle.includes(query) ||
                expenseType.includes(query) ||
                expenseId.includes(query)
            )
        })
    }, [expenses, searchQuery])

    const handleFilterChange = (key: keyof ExpenseFilterRequest, value: number | string | undefined) => {
        setFilters(prev => ({
            ...prev,
            [key]: value || undefined
        }))
    }

    const clearFilters = () => {
        setFilters({})
        setSearchQuery('')
    }

    const activeFilterCount = useMemo(() => {
        return Object.values(filters).filter(v => v !== undefined).length
    }, [filters])

    const stats = useMemo(() => {
        const total = expenses.length
        const pending = expenses.filter(e => e.approvalStatusName.toLowerCase() === 'submitted' || e.approvalStatusName.toLowerCase() === 'pending').length
        const approved = expenses.filter(e => e.approvalStatusName.toLowerCase() === 'approved').length
        const rejected = expenses.filter(e => e.approvalStatusName.toLowerCase() === 'rejected').length
        const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)

        return { total, pending, approved, rejected, totalAmount }
    }, [expenses])

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    return (
        <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
            <div className={cn('max-w-7xl mx-auto space-y-6')}>
                <Card className={cn('border')}>
                    <CardHeader>
                        <div className={cn('flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4')}>
                            <div>
                                <CardTitle className={cn('text-2xl font-semibold text-foreground')}>
                                    Manage Expenses
                                </CardTitle>
                                <CardDescription>
                                    Review and approve employee travel expenses
                                </CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className={cn('gap-2')}
                            >
                                <Filter className="h-4 w-4" />
                                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className={cn('space-y-6')}>
                        <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4')}>
                            <Card>
                                <CardContent className={cn('pt-6')}>
                                    <div className={cn('space-y-1')}>
                                        <p className={cn('text-sm font-medium text-muted-foreground')}>Total Expenses</p>
                                        <p className={cn('text-2xl font-bold')}>{stats.total}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className={cn('pt-6')}>
                                    <div className={cn('space-y-1')}>
                                        <p className={cn('text-sm font-medium text-muted-foreground')}>Pending</p>
                                        <p className={cn('text-2xl font-bold text-blue-600')}>{stats.pending}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className={cn('pt-6')}>
                                    <div className={cn('space-y-1')}>
                                        <p className={cn('text-sm font-medium text-muted-foreground')}>Approved</p>
                                        <p className={cn('text-2xl font-bold text-green-600')}>{stats.approved}</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardContent className={cn('pt-6')}>
                                    <div className={cn('space-y-1')}>
                                        <p className={cn('text-sm font-medium text-muted-foreground')}>Total Amount</p>
                                        <p className={cn('text-2xl font-bold')}>{formatCurrency(stats.totalAmount)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {showFilters && (
                            <Card className={cn('border-2')}>
                                <CardContent className={cn('pt-6')}>
                                    {isLoadingFilters ? (
                                        <div className={cn('flex items-center gap-2 py-4')}>
                                            <Spinner className="size-4" />
                                            <span className="text-sm text-muted-foreground">Loading filters...</span>
                                        </div>
                                    ) : (
                                        <div className={cn('space-y-4')}>
                                            <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3')}>
                                                <div className={cn('space-y-2')}>
                                                    <Label htmlFor="employee-filter">Employee</Label>
                                                    <select
                                                        id="employee-filter"
                                                        className={cn(
                                                            'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                                                            'focus:outline-none focus:ring-2 focus:ring-ring'
                                                        )}
                                                        value={filters.employeeId || ''}
                                                        onChange={(e) => handleFilterChange('employeeId', e.target.value ? Number(e.target.value) : undefined)}
                                                    >
                                                        <option value="">All Employees</option>
                                                        {employees.map(emp => (
                                                            <option key={emp.employeeId} value={emp.employeeId}>
                                                                {emp.firstName} {emp.lastName}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className={cn('space-y-2')}>
                                                    <Label htmlFor="travel-filter">Travel Plan</Label>
                                                    <select
                                                        id="travel-filter"
                                                        className={cn(
                                                            'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                                                            'focus:outline-none focus:ring-2 focus:ring-ring'
                                                        )}
                                                        value={filters.travelPlanId || ''}
                                                        onChange={(e) => handleFilterChange('travelPlanId', e.target.value ? Number(e.target.value) : undefined)}
                                                    >
                                                        <option value="">All Travel Plans</option>
                                                        {travelPlans.map(travel => (
                                                            <option key={travel.travelId} value={travel.travelId}>
                                                                {travel.title}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className={cn('space-y-2')}>
                                                    <Label htmlFor="status-filter">Status</Label>
                                                    <select
                                                        id="status-filter"
                                                        className={cn(
                                                            'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                                                            'focus:outline-none focus:ring-2 focus:ring-ring'
                                                        )}
                                                        value={filters.statusId || ''}
                                                        onChange={(e) => handleFilterChange('statusId', e.target.value ? Number(e.target.value) : undefined)}
                                                    >
                                                        <option value="">All Statuses</option>
                                                        {statusTypes.map(status => (
                                                            <option key={status.id} value={status.id}>
                                                                {status.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className={cn('space-y-2')}>
                                                    <Label htmlFor="expense-type-filter">Expense Type</Label>
                                                    <select
                                                        id="expense-type-filter"
                                                        className={cn(
                                                            'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                                                            'focus:outline-none focus:ring-2 focus:ring-ring'
                                                        )}
                                                        value={filters.expenseTypeId || ''}
                                                        onChange={(e) => handleFilterChange('expenseTypeId', e.target.value ? Number(e.target.value) : undefined)}
                                                    >
                                                        <option value="">All Types</option>
                                                        {expenseTypes.map(type => (
                                                            <option key={type.id} value={type.id}>
                                                                {type.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div className={cn('space-y-2')}>
                                                    <Label htmlFor="start-date-filter">Start Date</Label>
                                                    <Input
                                                        id="start-date-filter"
                                                        type="date"
                                                        value={filters.startDate || ''}
                                                        onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                                    />
                                                </div>

                                                <div className={cn('space-y-2')}>
                                                    <Label htmlFor="end-date-filter">End Date</Label>
                                                    <Input
                                                        id="end-date-filter"
                                                        type="date"
                                                        value={filters.endDate || ''}
                                                        onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                            {activeFilterCount > 0 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearFilters}
                                                    className={cn('gap-2')}
                                                >
                                                    <X className="h-4 w-4" />
                                                    Clear All Filters
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <div className={cn('space-y-4')}>
                            <Input
                                placeholder="Search by employee name, travel title, expense type, or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn('max-w-md')}
                            />

                            {isLoading ? (
                                <div className={cn('flex items-center justify-center py-12 text-muted-foreground gap-2')}>
                                    <Spinner className="size-5" />
                                    <span>Loading expenses...</span>
                                </div>
                            ) : filteredExpenses.length === 0 ? (
                                <div className={cn('rounded-lg border border-dashed p-12 text-center text-muted-foreground')}>
                                    {expenses.length === 0
                                        ? 'No expenses found'
                                        : 'No expenses match your search criteria'}
                                </div>
                            ) : (
                                <div className={cn('overflow-x-auto')}>
                                    <table className={cn('w-full min-w-200')}>
                                        <thead>
                                            <tr className={cn('border-b bg-muted/50')}>
                                                <th className={cn('text-left p-3 text-sm font-medium text-muted-foreground')}>
                                                    ID
                                                </th>
                                                <th className={cn('text-left p-3 text-sm font-medium text-muted-foreground')}>
                                                    Employee
                                                </th>
                                                <th className={cn('text-left p-3 text-sm font-medium text-muted-foreground')}>
                                                    Travel Plan
                                                </th>
                                                <th className={cn('text-left p-3 text-sm font-medium text-muted-foreground')}>
                                                    Type
                                                </th>
                                                <th className={cn('text-left p-3 text-sm font-medium text-muted-foreground')}>
                                                    Amount
                                                </th>
                                                <th className={cn('text-left p-3 text-sm font-medium text-muted-foreground')}>
                                                    Expense Date
                                                </th>
                                                <th className={cn('text-left p-3 text-sm font-medium text-muted-foreground')}>
                                                    Submitted
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
                                            {filteredExpenses.map((expense) => (
                                                <tr
                                                    key={expense.expenseId}
                                                    className={cn('border-b hover:bg-muted/30 transition-colors cursor-pointer')}
                                                    onClick={() => navigate(`/hr/travel-expenses/${expense.expenseId}`)}
                                                >
                                                    <td className={cn('p-3 text-sm font-medium')}>
                                                        #{expense.expenseId}
                                                    </td>
                                                    <td className={cn('p-3 text-sm')}>
                                                        {expense.submittedBy.firstName} {expense.submittedBy.lastName}
                                                    </td>
                                                    <td className={cn('p-3 text-sm')}>
                                                        {expense.travelPlanTitle}
                                                    </td>
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
                                                        <div className={cn('flex items-center justify-end gap-2')} onClick={(e) => e.stopPropagation()}>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => navigate(`/hr/travel-expenses/${expense.expenseId}`)}
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
