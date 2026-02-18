import { useEffect, useState, useMemo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    createExpense,
    updateExpense,
    submitExpense,
    getExpenseById,
    uploadReceipt,
    deleteReceipt,
    getExpenseReceipts,
    addParticipant,
    removeParticipant,
    getExpenseParticipants,
    getExpenseTypes,
    type TravelExpenseDto,
    type ExpenseTypeDto,
    type CreateTravelExpenseRequest,
    type UpdateTravelExpenseRequest,
    type ExpenseReceiptDto
} from '@/lib/api/travelExpense'
import { getMyTravels, getTravelEmployees, type TravelPlanDto } from '@/lib/api/travel'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { getFileUrl } from '@/lib/api/file'
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react'
import { useUserId } from '@/lib/redux/hooks'

const expenseSchema = z.object({
    travelPlanId: z.number().positive('Please select a travel plan'),
    expenseTypeId: z.number().positive('Please select an expense type'),
    amount: z.number()
        .positive('Amount must be greater than 0')
        .max(100000, 'Amount cannot exceed ₹1,00,000'),
    expenseDate: z.string().min(1, 'Expense date is required'),
})

type ExpenseFormData = z.infer<typeof expenseSchema>

export default function CreateEditExpense() {
    const { expenseId } = useParams<{ expenseId: string }>()
    const isEditMode = Boolean(expenseId)
    const navigate = useNavigate()

    const [travelPlans, setTravelPlans] = useState<TravelPlanDto[]>([])
    const [expenseTypes, setExpenseTypes] = useState<ExpenseTypeDto[]>([])
    const [travelEmployees, setTravelEmployees] = useState<EmployeeSummaryDto[]>([])
    const currentUserIdRaw = useUserId()
    const currentUserId = currentUserIdRaw ? Number(currentUserIdRaw) : null
    const [selectedParticipantIds, setSelectedParticipantIds] = useState<number[]>([])
    const [receipts, setReceipts] = useState<ExpenseReceiptDto[]>([])
    const [uploadingFiles, setUploadingFiles] = useState<File[]>([])

    const [isLoadingTravel, setIsLoadingTravel] = useState(true)
    const [isLoadingTypes, setIsLoadingTypes] = useState(true)
    const [isLoadingExpense, setIsLoadingExpense] = useState(false)
    const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentExpense, setCurrentExpense] = useState<TravelExpenseDto | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        reset,
        setValue
    } = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
    })


    const selectedTravelId = watch('travelPlanId')
    const selectedExpenseDate = watch('expenseDate')

    const selectedTravel = useMemo(() => {
        return travelPlans.find(t => t.travelId === selectedTravelId)
    }, [travelPlans, selectedTravelId])

    const minExpenseDate = selectedTravel ? new Date(selectedTravel.startDate).toISOString().split('T')[0] : undefined
    const maxExpenseDate = new Date().toISOString().split('T')[0]

    const loadTravelPlans = async () => {
        setIsLoadingTravel(true)
        try {
            const data = await getMyTravels()
            setTravelPlans(data)
        } catch (error) {
            toast.error('Failed to load travel plans')
            console.error('Error loading travel plans:', error)
        } finally {
            setIsLoadingTravel(false)
        }
    }

    const loadExpenseTypes = async () => {
        setIsLoadingTypes(true)
        try {
            const data = await getExpenseTypes()
            setExpenseTypes(data)
        } catch (error) {
            toast.error('Failed to load expense types')
            console.error('Error loading expense types:', error)
        } finally {
            setIsLoadingTypes(false)
        }
    }

    const loadExpense = useCallback(async (id: number) => {
        setIsLoadingExpense(true)
        try {
            const expense = await getExpenseById(id)

            if (expense.approvalStatusName.toLowerCase() !== 'draft') {
                toast.error('Only draft expenses can be edited')
                navigate('/travel-expenses')
                return
            }

            setCurrentExpense(expense)

            reset({
                travelPlanId: expense.travelPlanId,
                expenseTypeId: expense.expenseTypeId,
                amount: expense.amount,
                expenseDate: expense.expenseDate.split('T')[0],
            })

            const [receiptData, participantData] = await Promise.all([
                getExpenseReceipts(id),
                getExpenseParticipants(id)
            ])

            setReceipts(receiptData)
            const selected = participantData
                .filter(p => !(currentUserId !== null && p.employeeId === currentUserId))
                .map(p => p.employeeId)
            setSelectedParticipantIds(selected)

        } catch (error) {
            toast.error('Failed to load expense details')
            console.error('Error loading expense:', error)
            navigate('/travel-expenses')
        } finally {
            setIsLoadingExpense(false)
        }
    }, [navigate, reset, currentUserId])

    const loadTravelEmployees = async (travelId: number) => {
        setIsLoadingEmployees(true)
        try {
            const data = await getTravelEmployees(travelId)
            setTravelEmployees(data)
        } catch (error) {
            toast.error('Failed to load travel employees')
            console.error('Error loading employees:', error)
        } finally {
            setIsLoadingEmployees(false)
        }
    }

    useEffect(() => {
        loadTravelPlans()
        loadExpenseTypes()
    }, [])

    useEffect(() => {
        if (isEditMode && expenseId) {
            loadExpense(Number(expenseId))
        }
    }, [expenseId, isEditMode, loadExpense])

    useEffect(() => {
        if (selectedTravelId) {
            loadTravelEmployees(selectedTravelId)
        } else {
            setTravelEmployees([])
            setSelectedParticipantIds([])
        }
    }, [selectedTravelId])

    const validateExpenseDate = (date: string): { valid: boolean; message?: string } => {
        if (!selectedTravel) return { valid: true }

        const expenseDate = new Date(date)
        const startDate = new Date(selectedTravel.startDate)
        const endDate = new Date(selectedTravel.endDate)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (expenseDate > today) {
            return { valid: false, message: 'Expense date cannot be in the future' }
        }

        if (expenseDate < startDate) {
            return { valid: false, message: `Expense date cannot be before trip start date (${new Date(selectedTravel.startDate).toLocaleDateString()})` }
        }

        const submissionDeadline = new Date(endDate)
        submissionDeadline.setDate(submissionDeadline.getDate() + 10)

        if (today > submissionDeadline) {
            return { valid: false, message: `Submission window closed. Deadline was ${submissionDeadline.toLocaleDateString()}` }
        }

        return { valid: true }
    }

    const toggleParticipant = (employeeId: number) => {
        setSelectedParticipantIds(prev =>
            prev.includes(employeeId)
                ? prev.filter(id => id !== employeeId)
                : [...prev, employeeId]
        )
    }

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files
        if (!files || files.length === 0) return

        const validFiles: File[] = []
        const invalidFiles: string[] = []

        Array.from(files).forEach(file => {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
            const maxSize = 5 * 1024 * 1024

            if (!validTypes.includes(file.type)) {
                invalidFiles.push(`${file.name}: Invalid file type`)
            } else if (file.size > maxSize) {
                invalidFiles.push(`${file.name}: File size exceeds 5MB`)
            } else {
                validFiles.push(file)
            }
        })

        if (invalidFiles.length > 0) {
            toast.error(invalidFiles.join('\n'))
        }

        if (validFiles.length > 0) {
            setUploadingFiles(prev => [...prev, ...validFiles])
        }

        event.target.value = ''
    }

    const removeUploadingFile = (index: number) => {
        setUploadingFiles(prev => prev.filter((_, i) => i !== index))
    }

    const handleAmountKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === '-' || e.key === 'e' || e.key === 'E') {
            e.preventDefault()
        }
    }

    const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const v = parseFloat((e.currentTarget as HTMLInputElement).value)
        if (isNaN(v) || v <= 0) {
            ; (e.currentTarget as HTMLInputElement).value = ''
            try {
                setValue('amount', NaN, { shouldValidate: true })
            } catch (err) {
                console.debug(err)
            }
        } else {
            const normalized = parseFloat(v.toFixed(2))
                ; (e.currentTarget as HTMLInputElement).value = normalized.toFixed(2)
            try {
                setValue('amount', normalized, { shouldValidate: true })
            } catch (err) {
                console.debug(err)
            }
        }
    }

    const handleDeleteReceipt = async (receiptId: number) => {
        if (!isEditMode) return

        try {
            await deleteReceipt(receiptId)
            setReceipts(prev => prev.filter(r => r.expenseReceiptId !== receiptId))
            toast.success('Receipt deleted successfully')
        } catch (error) {
            toast.error('Failed to delete receipt')
            console.error('Error deleting receipt:', error)
        }
    }

    const uploadPendingReceipts = async (expenseId: number) => {
        if (uploadingFiles.length === 0) return

        try {
            const uploadPromises = uploadingFiles.map(file => uploadReceipt(expenseId, file))
            await Promise.all(uploadPromises)
            setUploadingFiles([])
        } catch {
            throw new Error('Failed to upload receipts')
        }
    }

    const syncParticipants = async (expenseId: number, participantIds: number[]) => {
        try {
            const currentParticipants = isEditMode && currentExpense
                ? await getExpenseParticipants(expenseId)
                : []

            const currentIds = currentParticipants.map(p => p.employeeId)
            const toAdd = participantIds.filter(id => !currentIds.includes(id))
            const toRemove = currentIds.filter(id => !participantIds.includes(id))

            const addPromises = toAdd.map(id => addParticipant(expenseId, id))
            const removePromises = toRemove.map(id => removeParticipant(expenseId, id))

            await Promise.all([...addPromises, ...removePromises])
        } catch {
            throw new Error('Failed to update participants')
        }
    }

    const onSaveDraft = async (data: ExpenseFormData) => {
        setIsSaving(true)
        try {
            let expenseId: number

            if (isEditMode && currentExpense) {
                const updateData: UpdateTravelExpenseRequest = {
                    expenseTypeId: data.expenseTypeId,
                    amount: data.amount,
                    expenseDate: data.expenseDate
                }
                const updated = await updateExpense(currentExpense.expenseId, updateData)
                expenseId = updated.expenseId
                toast.success('Expense updated as draft')
            } else {
                const createData: CreateTravelExpenseRequest = {
                    travelPlanId: data.travelPlanId,
                    expenseTypeId: data.expenseTypeId,
                    amount: data.amount,
                    expenseDate: data.expenseDate
                }

                const created = await createExpense(createData);
                expenseId = created.expenseId
                toast.success('Expense saved as draft');
            }

            await uploadPendingReceipts(expenseId);
            await syncParticipants(expenseId, selectedParticipantIds);

            navigate('/travel-expenses')
        } catch (error) {
            toast.error('Failed to save expense')
            console.error('Error saving expense:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const onSubmit = async (data: ExpenseFormData) => {
        const dateValidation = validateExpenseDate(data.expenseDate)
        if (!dateValidation.valid) {
            toast.error(dateValidation.message || 'Invalid expense date')
            return
        }

        const totalReceipts = receipts.length + uploadingFiles.length
        if (totalReceipts === 0) {
            toast.error('At least one receipt is required before submitting')
            return
        }

        setIsSubmitting(true)
        try {
            let expenseId: number

            if (isEditMode && currentExpense) {
                const updateData: UpdateTravelExpenseRequest = {
                    expenseTypeId: data.expenseTypeId,
                    amount: data.amount,
                    expenseDate: data.expenseDate
                }
                const updated = await updateExpense(currentExpense.expenseId, updateData)
                expenseId = updated.expenseId
            } else {
                const createData: CreateTravelExpenseRequest = {
                    travelPlanId: data.travelPlanId,
                    expenseTypeId: data.expenseTypeId,
                    amount: data.amount,
                    expenseDate: data.expenseDate
                }
                const created = await createExpense(createData)
                expenseId = created.expenseId
            }

            await uploadPendingReceipts(expenseId)
            await syncParticipants(expenseId, selectedParticipantIds)
            await submitExpense(expenseId)

            toast.success('Expense submitted successfully')
            navigate('/travel-expenses')
        } catch (error) {
            toast.error('Failed to submit expense')
            console.error('Error submitting expense:', error)
        } finally {
            setIsSubmitting(false)
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

    const isLoading = isLoadingTravel || isLoadingTypes || isLoadingExpense

    if (isLoading) {
        return (
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('max-w-4xl mx-auto')}>
                    <div className={cn('flex items-center justify-center py-12 text-muted-foreground gap-2')}>
                        <Spinner className="size-5" />
                        <span>Loading...</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
            <div className={cn('max-w-4xl mx-auto space-y-6')}>
                <Card className={cn('border')}>
                    <CardHeader>
                        <CardTitle className={cn('text-2xl font-semibold text-foreground')}>
                            {isEditMode ? 'Edit Expense' : 'Create New Expense'}
                        </CardTitle>
                        <CardDescription>
                            {isEditMode
                                ? 'Update expense details and submit for approval'
                                : 'Fill in the expense details and upload receipts'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-6')}>
                            <div className={cn('grid gap-4 md:grid-cols-2')}>
                                <div className={cn('space-y-2')}>
                                    <Label htmlFor='travelPlanId'>Travel Plan</Label>
                                    <select
                                        id='travelPlanId'
                                        className={cn(
                                            'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                                            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                                            errors.travelPlanId && 'border-destructive'
                                        )}
                                        {...register('travelPlanId', { valueAsNumber: true })}
                                        required
                                        disabled={isEditMode || isSaving || isSubmitting}
                                    >
                                        <option value="">Select a travel plan</option>
                                        {travelPlans.map(travel => (
                                            <option key={travel.travelId} value={travel.travelId}>
                                                {travel.title} ({new Date(travel.startDate).toLocaleDateString()} - {new Date(travel.endDate).toLocaleDateString()})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.travelPlanId && (
                                        <p className={cn('text-sm text-destructive')}>{errors.travelPlanId.message}</p>
                                    )}
                                </div>

                                <div className={cn('space-y-2')}>
                                    <Label htmlFor='expenseTypeId'>Expense Type</Label>
                                    <select
                                        id='expenseTypeId'
                                        className={cn(
                                            'w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
                                            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                                            errors.expenseTypeId && 'border-destructive'
                                        )}
                                        {...register('expenseTypeId', { valueAsNumber: true })}
                                        required
                                        disabled={isSaving || isSubmitting}
                                    >
                                        <option value="">Select expense type</option>
                                        {expenseTypes.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.expenseTypeId && (
                                        <p className={cn('text-sm text-destructive')}>{errors.expenseTypeId.message}</p>
                                    )}
                                </div>

                                <div className={cn('space-y-2')}>
                                    <Label htmlFor='amount'>Amount (₹)</Label>
                                    <Input
                                        id='amount'
                                        type='number'
                                        step='0.01'
                                        min='0.01'
                                        inputMode='decimal'
                                        placeholder='0.00'
                                        {...register('amount', { valueAsNumber: true })}
                                        onKeyDown={handleAmountKeyDown}
                                        onBlur={handleAmountBlur}
                                        onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                                        required
                                        disabled={isSaving || isSubmitting}
                                    />
                                    {errors.amount && (
                                        <p className={cn('text-sm text-destructive')}>{errors.amount.message}</p>
                                    )}
                                </div>

                                <div className={cn('space-y-2')}>
                                    <Label htmlFor='expenseDate'>Expense Date</Label>
                                    <Input
                                        id='expenseDate'
                                        type='date'
                                        min={minExpenseDate}
                                        max={maxExpenseDate}
                                        {...register('expenseDate')}
                                        disabled={isSaving || isSubmitting}
                                        required
                                    />
                                    {errors.expenseDate && (
                                        <p className={cn('text-sm text-destructive')}>{errors.expenseDate.message}</p>
                                    )}
                                    {selectedExpenseDate && selectedTravel && (
                                        <p className={cn('text-xs text-muted-foreground')}>
                                            Trip period: {new Date(selectedTravel.startDate).toLocaleDateString()} to {new Date(selectedTravel.endDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {selectedTravelId && travelEmployees.length > 0 && (
                                <div className={cn('space-y-3')}>
                                    <Label>Participants (Optional)</Label>
                                    <p className={cn('text-sm text-muted-foreground')}>
                                        Select employees who shared this expense
                                    </p>
                                    {isLoadingEmployees ? (
                                        <div className={cn('flex items-center gap-2 py-4')}>
                                            <Spinner className="size-4" />
                                            <span className="text-sm text-muted-foreground">Loading employees...</span>
                                        </div>
                                    ) : (
                                        <div className={cn('max-h-48 overflow-auto rounded-lg border p-3 space-y-2')}>
                                            {travelEmployees
                                                .filter(employee => !(currentUserId !== null && employee.employeeId === currentUserId))
                                                .map(employee => (
                                                    <label
                                                        key={employee.employeeId}
                                                        className={cn(
                                                            'flex items-center gap-3 p-2 rounded hover:bg-muted cursor-pointer'
                                                        )}
                                                    >
                                                        <input
                                                            type='checkbox'
                                                            checked={selectedParticipantIds.includes(employee.employeeId)}
                                                            onChange={() => toggleParticipant(employee.employeeId)}
                                                            disabled={isSaving || isSubmitting}
                                                            className="h-4 w-4"
                                                        />
                                                        <span className="text-sm">
                                                            {employee.firstName} {employee.lastName} ({employee.email})
                                                        </span>
                                                    </label>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className={cn('space-y-3')}>
                                <Label>Receipts</Label>
                                <p className={cn('text-sm text-muted-foreground')}>
                                    Upload receipt images or PDFs (max 5MB each). At least one receipt required for submission.
                                </p>

                                <div className={cn('grid gap-4')}>
                                    {receipts.map(receipt => (
                                        <div
                                            key={receipt.expenseReceiptId}
                                            className={cn('flex items-center gap-3 p-3 border rounded-lg bg-muted/30')}
                                        >
                                            {receipt.fileName.toLowerCase().endsWith('.pdf') ? (
                                                <FileText className="h-8 w-8 text-red-500" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-blue-500" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{receipt.fileName}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Uploaded {new Date(receipt.uploadedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => window.open(getReceiptUrl(receipt.receiptPath), '_blank')}
                                            >
                                                View
                                            </Button>
                                            {isEditMode && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteReceipt(receipt.expenseReceiptId)}
                                                    className="text-destructive hover:text-destructive"
                                                    disabled={isSaving || isSubmitting}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}

                                    {uploadingFiles.map((file, index) => (
                                        <div
                                            key={index}
                                            className={cn('flex items-center gap-3 p-3 border rounded-lg border-dashed')}
                                        >
                                            {file.type === 'application/pdf' ? (
                                                <FileText className="h-8 w-8 text-red-500" />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-blue-500" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeUploadingFile(index)}
                                                disabled={isSaving || isSubmitting}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    <label
                                        className={cn(
                                            'flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer',
                                            'hover:border-primary hover:bg-muted/50 transition-colors',
                                            (isSaving || isSubmitting) && 'opacity-50 cursor-not-allowed'
                                        )}
                                    >
                                        <Upload className="h-8 w-8 text-muted-foreground" />
                                        <span className="text-sm font-medium">Upload Receipts</span>
                                        <span className="text-xs text-muted-foreground">
                                            JPG, PNG, or PDF (max 5MB)
                                        </span>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/jpeg,image/jpg,image/png,application/pdf"
                                            onChange={handleFileSelect}
                                            disabled={isSaving || isSubmitting}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className={cn('flex gap-3 justify-end')}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate('/travel-expenses')}
                                    disabled={isSaving || isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleSubmit(onSaveDraft)}
                                    disabled={isSaving || isSubmitting}
                                >
                                    {isSaving && <Spinner className="mr-2 h-4 w-4" />}
                                    Save as Draft
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSaving || isSubmitting}
                                >
                                    {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
                                    Submit for Approval
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
