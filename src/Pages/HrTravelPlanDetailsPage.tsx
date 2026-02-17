import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { addEmployeeToTravel, getTravelEmployees, getTravelPlanById, removeEmployeeFromTravel, updateTravelPlan, type TravelPlanDto, type UpdateTravelPlanRequest } from '@/lib/api/travel'
import { searchEmployee } from '@/lib/api/hr'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { uploadDocument, getDocumentsByTravelHR, getDocumentsByTravel, getDocumentTypes, deleteDocument, type DocumentTypeDto, type TravelDocumentDto } from '@/lib/api/travelDocument'
import { getFileUrl } from '@/lib/api/file'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

export default function HrTravelPlanDetailsPage() {
    const { travelId } = useParams()
    const [plan, setPlan] = useState<TravelPlanDto | null>(null)
    const [employees, setEmployees] = useState<EmployeeSummaryDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [editForm, setEditForm] = useState<UpdateTravelPlanRequest | null>(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<EmployeeSummaryDto[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [hrDocs, setHrDocs] = useState<TravelDocumentDto[]>([])
    const [employeeDocs, setEmployeeDocs] = useState<TravelDocumentDto[]>([])
    const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([])
    const [isDocsLoading, setIsDocsLoading] = useState(false)
    const [selectedEmployeeForUpload, setSelectedEmployeeForUpload] = useState<number | string | null>(null)
    const [documentTypeId, setDocumentTypeId] = useState('')
    const [documentName, setDocumentName] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [isUploading, setIsUploading] = useState(false)

    const canEditAssignments = useMemo(() => {
        if (!plan?.startDate) return false
        return new Date(plan.startDate) > new Date()
    }, [plan?.startDate])

    const loadPlan = async () => {
        if (!travelId) return
        setIsLoading(true)
        setErrorMessage('')
        try {
            const [planData, employeeData] = await Promise.all([
                getTravelPlanById(Number(travelId)),
                getTravelEmployees(Number(travelId)),
            ])
            setPlan(planData)
            setEmployees(employeeData)
            setEditForm({
                title: planData.title,
                description: planData.description,
                startDate: planData.startDate,
                endDate: planData.endDate,
                employeeIds: employeeData.map((employee) => employee.employeeId),
            })
        } catch (error) {
            toast.error('Failed to load travel plan')
            console.error('Error loading travel plan:', error)
            setErrorMessage('Failed to load travel plan. Please try again later.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadPlan()
    }, [travelId])

    useEffect(() => {
        if (travelId) {
            loadDocuments()
            loadDocumentTypes()
        }
    }, [travelId])


    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([])
            return
        }
        setIsSearching(true)
        try {
            const results = await searchEmployee({ query: searchQuery.trim() })
            setSearchResults(results)
        } catch (error) {
            toast.error('Failed to search employees')
            console.error('Error searching employees:', error)
        } finally {
            setIsSearching(false)
        }
    }

    const loadDocuments = async () => {
        if (!travelId) return
        setIsDocsLoading(true)
        try {
            const [hrDocuments, allDocuments] = await Promise.all([
                getDocumentsByTravelHR(Number(travelId)),
                getDocumentsByTravel(Number(travelId))
            ])
            setHrDocs(hrDocuments)
            const employeeDocuments = allDocuments.filter(
                doc => !hrDocuments.some(hrDoc => hrDoc.documentId === doc.documentId)
            )
            setEmployeeDocs(employeeDocuments)
        } catch (error) {
            console.error('Error loading documents:', error)
        } finally {
            setIsDocsLoading(false)
        }
    }

    const loadDocumentTypes = async () => {
        try {
            const types = await getDocumentTypes()
            setDocumentTypes(types)
        } catch (error) {
            console.error('Error loading document types:', error)
        }
    }

    const getDocumentUrl = (path: string) => {
        const parts = path.split('/')
        if (parts.length >= 2) {
            const category = parts[0]
            const filename = parts.slice(1).join('/')
            return getFileUrl(category, filename)
        }
        return getFileUrl('travel-documents', path)
    }

    const handleUploadDocument = async () => {
        if (!travelId || !selectedEmployeeForUpload || !documentTypeId || !documentName || !selectedFile) {
            toast.error('Please fill all fields and select a file')
            return
        }

        if (selectedEmployeeForUpload === 'all') {
            if (employees.length === 0) {
                toast.error('No employees assigned to this travel plan')
                return
            }

            setIsUploading(true)
            try {
                const uploadPromises = employees.map((employee) =>
                    uploadDocument({
                        travelPlanId: Number(travelId),
                        employeeId: employee.employeeId,
                        documentTypeId: Number(documentTypeId),
                        documentName,
                        file: selectedFile
                    })
                )

                const results = await Promise.allSettled(uploadPromises)
                const succeeded = results.filter((r) => r.status === 'fulfilled').length
                const failed = results.filter((r) => r.status === 'rejected').length

                if (failed === 0) {
                    toast.success(`Document uploaded successfully for all ${succeeded} employees`)
                } else {
                    toast.error(`Uploaded for ${succeeded} employees, failed for ${failed}`)
                }

                setDocumentTypeId('')
                setDocumentName('')
                setSelectedFile(null)
                setSelectedEmployeeForUpload(null)
                loadDocuments()
            } catch (error) {
                toast.error('Failed to upload documents')
                console.error('Error uploading documents:', error)
            } finally {
                setIsUploading(false)
            }
        } else {
            setIsUploading(true)
            try {
                await uploadDocument({
                    travelPlanId: Number(travelId),
                    employeeId: Number(selectedEmployeeForUpload),
                    documentTypeId: Number(documentTypeId),
                    documentName,
                    file: selectedFile
                })
                toast.success('Document uploaded successfully')
                setDocumentTypeId('')
                setDocumentName('')
                setSelectedFile(null)
                setSelectedEmployeeForUpload(null)
                loadDocuments()
            } catch (error) {
                toast.error('Failed to upload document')
                console.error('Error uploading document:', error)
            } finally {
                setIsUploading(false)
            }
        }
    }

    const handleDeleteDocument = async (documentId: number) => {
        if (!confirm('Are you sure you want to delete this document?')) return
        try {
            await deleteDocument(documentId)
            toast.success('Document deleted successfully')
            loadDocuments()
        } catch (error) {
            toast.error('Failed to delete document')
            console.error('Error deleting document:', error)
        }
    }

    const handleAddEmployee = async (employeeId: number) => {
        if (!travelId) return
        if (!canEditAssignments) {
            toast.error('Assignments can only be updated before the start date')
            return
        }
        try {
            await addEmployeeToTravel(Number(travelId), employeeId)
            const employee = searchResults.find((item) => item.employeeId === employeeId)
            if (employee) {
                setEmployees((prev) => [...prev, employee])
                setEditForm((prev) =>
                    prev
                        ? { ...prev, employeeIds: [...prev.employeeIds, employee.employeeId] }
                        : prev
                )
            }
            toast.success('Employee added to travel plan')
        } catch (error) {
            toast.error('Failed to add employee')
            console.error('Error adding employee:', error)
        }
    }

    const handleRemoveEmployee = async (employeeId: number) => {
        if (!travelId) return
        if (!canEditAssignments) {
            toast.error('Assignments can only be updated before the start date')
            return
        }
        try {
            await removeEmployeeFromTravel(Number(travelId), employeeId)
            setEmployees((prev) => prev.filter((employee) => employee.employeeId !== employeeId))
            setEditForm((prev) =>
                prev
                    ? { ...prev, employeeIds: prev.employeeIds.filter((id) => id !== employeeId) }
                    : prev
            )
            toast.success('Employee removed from travel plan')
        } catch (error) {
            toast.error('Failed to remove employee')
            console.error('Error removing employee:', error)
        }
    }

    const handleUpdatePlan = async () => {
        if (!travelId || !editForm) return
        setIsSaving(true)
        try {
            const updated = await updateTravelPlan(Number(travelId), editForm)
            setPlan(updated)
            toast.success('Travel plan updated successfully')
            setIsEditOpen(false)
        } catch (error) {
            toast.error('Failed to update travel plan')
            console.error('Error updating travel plan:', error)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('flex items-center justify-center py-12 text-muted-foreground gap-2')}>
                    <Spinner className="size-5" />
                    <span>Loading travel plan...</span>
                </div>
            </div>
        )
    }

    if (errorMessage) {
        return (
            <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
                <div className={cn('rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive')}>
                    {errorMessage}
                </div>
            </div>
        )
    }

    if (!plan) {
        return null
    }

    return (
        <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
            <div className={cn('max-w-6xl mx-auto space-y-6')}>
                <Card className={cn('border')}>
                    <CardHeader className={cn('flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between')}>
                        <div>
                            <CardTitle className={cn('text-2xl font-semibold text-foreground')}>{plan.title}</CardTitle>
                            <CardDescription>{plan.description || 'No description provided.'}</CardDescription>
                        </div>
                        <Button variant='outline' onClick={() => setIsEditOpen(true)}>
                            Update Plan
                        </Button>
                    </CardHeader>
                    <CardContent className={cn('grid gap-4 md:grid-cols-3 text-sm')}>
                        <div>
                            <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>Start Date</p>
                            <p className={cn('mt-1 text-sm font-semibold text-foreground')}>{new Date(plan.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>End Date</p>
                            <p className={cn('mt-1 text-sm font-semibold text-foreground')}>{new Date(plan.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>Created By</p>
                            <p className={cn('mt-1 text-sm font-semibold text-foreground')}>
                                {plan.createdByHRName || 'Not available'}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className={cn('border')}>
                    <CardHeader>
                        <CardTitle className={cn('text-xl font-semibold text-foreground')}>Assigned Employees</CardTitle>
                        <CardDescription>
                            {canEditAssignments
                                ? 'Add or remove employees before the travel start date.'
                                : 'Assignments are locked after the travel start date.'}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className={cn('space-y-4')}>
                        <div className={cn('flex flex-col gap-3 sm:flex-row sm:items-center')}>
                            <Input
                                placeholder='Search employees by name or email...'
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                onKeyDown={(event) => event.key === 'Enter' && handleSearch()}
                                disabled={!canEditAssignments}
                            />
                            <Button variant='outline' onClick={handleSearch} disabled={!canEditAssignments || isSearching}>
                                {isSearching ? 'Searching...' : 'Search'}
                            </Button>
                        </div>

                        {searchResults.length > 0 ? (
                            <div className={cn('rounded-lg border p-3 space-y-2')}>
                                {searchResults.map((employee) => {
                                    const isAssigned = employees.some((item) => item.employeeId === employee.employeeId)
                                    return (
                                        <div key={employee.employeeId} className={cn('flex items-center justify-between gap-3 text-sm')}>
                                            <div>
                                                <p className={cn('font-medium text-foreground')}>
                                                    {employee.firstName} {employee.lastName}
                                                </p>
                                                <p className={cn('text-xs text-muted-foreground')}>{employee.email}</p>
                                            </div>
                                            <Button
                                                size='sm'
                                                variant={isAssigned ? 'outline' : 'default'}
                                                disabled={!canEditAssignments || isAssigned}
                                                onClick={() => handleAddEmployee(employee.employeeId)}
                                            >
                                                {isAssigned ? 'Assigned' : 'Add'}
                                            </Button>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : null}

                        {employees.length === 0 ? (
                            <div className={cn('rounded-lg border border-dashed p-6 text-center text-muted-foreground')}>
                                No employees assigned to this travel plan yet.
                            </div>
                        ) : (
                            <div className={cn('space-y-2')}>
                                {employees.map((employee) => (
                                    <div key={employee.employeeId} className={cn('flex items-center justify-between rounded-lg border p-3 text-sm')}>
                                        <div>
                                            <p className={cn('font-medium text-foreground')}>
                                                {employee.firstName} {employee.lastName}
                                            </p>
                                            <p className={cn('text-xs text-muted-foreground')}>{employee.email}</p>
                                        </div>
                                        <Button
                                            size='sm'
                                            variant='destructive'
                                            disabled={!canEditAssignments}
                                            onClick={() => handleRemoveEmployee(employee.employeeId)}
                                        >
                                            Remove
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className={cn('border')}>
                    <CardHeader>
                        <CardTitle className={cn('text-xl font-semibold text-foreground')}>Upload Document</CardTitle>
                        <CardDescription>Upload documents on behalf of employees for this travel plan.</CardDescription>
                    </CardHeader>
                    <CardContent className={cn('space-y-4')}>
                        <div className={cn('grid gap-4 md:grid-cols-2')}>
                            <div className={cn('space-y-2')}>
                                <Label htmlFor='employeeSelect'>Select Employee</Label>
                                <select
                                    id='employeeSelect'
                                    value={selectedEmployeeForUpload || ''}
                                    onChange={(event) => setSelectedEmployeeForUpload(event.target.value || null)}
                                    className={cn('h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground')}
                                >
                                    <option value=''>Select employee</option>
                                    <option value='all'>Upload for All Employees</option>
                                    {employees.map((emp) => (
                                        <option key={emp.employeeId} value={emp.employeeId}>
                                            {emp.firstName} {emp.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={cn('space-y-2')}>
                                <Label htmlFor='docType'>Document Type</Label>
                                <select
                                    id='docType'
                                    value={documentTypeId}
                                    onChange={(event) => setDocumentTypeId(event.target.value)}
                                    className={cn('h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground')}
                                >
                                    <option value=''>Select type</option>
                                    {documentTypes.map((type) => (
                                        <option key={type.id} value={String(type.id)}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={cn('space-y-2')}>
                                <Label htmlFor='docName'>Document Name</Label>
                                <Input
                                    id='docName'
                                    value={documentName}
                                    onChange={(event) => setDocumentName(event.target.value)}
                                    placeholder='Enter document name'
                                />
                            </div>
                            <div className={cn('space-y-2')}>
                                <Label htmlFor='docFile'>File</Label>
                                <Input
                                    id='docFile'
                                    type='file'
                                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                                />
                            </div>
                        </div>
                        <Button onClick={handleUploadDocument} disabled={isUploading}>
                            {isUploading ? (
                                <>
                                    <Spinner className={cn('mr-2 size-4')} />
                                    Uploading...
                                </>
                            ) : (
                                'Upload Document'
                            )}
                        </Button>
                    </CardContent>
                </Card>

                <Card className={cn('border')}>
                    <CardHeader>
                        <CardTitle className={cn('text-xl font-semibold text-foreground')}>Travel Documents</CardTitle>
                        <CardDescription>All documents uploaded for this travel plan.</CardDescription>
                    </CardHeader>
                    <CardContent className={cn('space-y-6')}>
                        {isDocsLoading ? (
                            <div className={cn('flex items-center justify-center py-8 text-muted-foreground gap-2')}>
                                <Spinner className='size-4' />
                                <span>Loading documents...</span>
                            </div>
                        ) : (
                            <div className={cn('grid gap-6 md:grid-cols-2')}>
                                <div className={cn('space-y-3')}>
                                    <h3 className={cn('text-sm font-semibold text-foreground')}>HR Uploaded Documents</h3>
                                    {hrDocs.length === 0 ? (
                                        <div className={cn('rounded-lg border border-dashed p-4 text-sm text-muted-foreground')}>
                                            No documents uploaded by HR yet.
                                        </div>
                                    ) : (
                                        hrDocs.map((doc) => (
                                            <div key={doc.documentId} className={cn('rounded-lg border p-3 text-sm')}>
                                                <p className={cn('font-medium text-foreground')}>{doc.documentName}</p>
                                                <p className={cn('text-xs text-muted-foreground')}>
                                                    {doc.documentTypeName} • {doc.employeeName}
                                                </p>
                                                <div className={cn('mt-2 flex gap-2')}>
                                                    <a
                                                        href={getDocumentUrl(doc.documentPath)}
                                                        target='_blank'
                                                        rel='noopener noreferrer'
                                                        className={cn('text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-800')}
                                                    >
                                                        View
                                                    </a>
                                                    <button
                                                        onClick={() => handleDeleteDocument(doc.documentId)}
                                                        className={cn('text-sm font-semibold text-destructive underline decoration-destructive/30 underline-offset-4 hover:text-destructive/80')}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className={cn('space-y-3')}>
                                    <h3 className={cn('text-sm font-semibold text-foreground')}>Employee Uploaded Documents</h3>
                                    {employeeDocs.length === 0 ? (
                                        <div className={cn('rounded-lg border border-dashed p-4 text-sm text-muted-foreground')}>
                                            No documents uploaded by employees yet.
                                        </div>
                                    ) : (
                                        employeeDocs.map((doc) => (
                                            <div key={doc.documentId} className={cn('rounded-lg border p-3 text-sm')}>
                                                <p className={cn('font-medium text-foreground')}>{doc.documentName}</p>
                                                <p className={cn('text-xs text-muted-foreground')}>
                                                    {doc.documentTypeName} • {doc.employeeName}
                                                </p>
                                                <a
                                                    href={getDocumentUrl(doc.documentPath)}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className={cn('mt-2 inline-flex text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-800')}
                                                >
                                                    View Document
                                                </a>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className={cn('sm:max-w-lg')}>
                    <DialogHeader>
                        <DialogTitle>Update Travel Plan</DialogTitle>
                        <DialogDescription>Adjust travel plan details.</DialogDescription>
                    </DialogHeader>
                    {editForm ? (
                        <div className={cn('space-y-4')}>
                            <div className={cn('space-y-2')}>
                                <Label htmlFor='editTitle'>Title</Label>
                                <Input
                                    id='editTitle'
                                    value={editForm.title}
                                    onChange={(event) => setEditForm((prev) =>
                                        prev ? { ...prev, title: event.target.value } : prev
                                    )}
                                />
                            </div>
                            <div className={cn('space-y-2')}>
                                <Label htmlFor='editDescription'>Description</Label>
                                <Input
                                    id='editDescription'
                                    value={editForm.description || ''}
                                    onChange={(event) => setEditForm((prev) =>
                                        prev ? { ...prev, description: event.target.value } : prev
                                    )}
                                />
                            </div>
                            <div className={cn('space-y-2')}>
                                <Label htmlFor='editStartDate'>Start Date</Label>
                                <Input
                                    id='editStartDate'
                                    type='date'
                                    value={editForm.startDate}
                                    onChange={(event) => setEditForm((prev) =>
                                        prev ? { ...prev, startDate: event.target.value } : prev
                                    )}
                                />
                            </div>
                            <div className={cn('space-y-2')}>
                                <Label htmlFor='editEndDate'>End Date</Label>
                                <Input
                                    id='editEndDate'
                                    type='date'
                                    value={editForm.endDate}
                                    onChange={(event) => setEditForm((prev) =>
                                        prev ? { ...prev, endDate: event.target.value } : prev
                                    )}
                                />
                            </div>
                            <DialogFooter>
                                <Button variant='outline' onClick={() => setIsEditOpen(false)} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={handleUpdatePlan} disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : null}
                </DialogContent>
            </Dialog>
        </div>
    )
}
