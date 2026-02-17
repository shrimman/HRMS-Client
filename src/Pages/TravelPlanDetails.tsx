import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import type { TravelPlanDto } from '@/lib/api/travel'
import { uploadDocument, getDocumentsByTravelEmployee, getDocumentsByTravelHR, getDocumentTypes, type DocumentTypeDto, type TravelDocumentDto } from '@/lib/api/travelDocument'
import { getFileUrl } from '@/lib/api/file'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { useLoaderData } from 'react-router-dom'
import { toast } from 'sonner'
import { useUserId } from '@/lib/redux/hooks'

function TravelPlanDetails() {
    const plan = useLoaderData() as TravelPlanDto
    const userId = useUserId()
    const [hrDocs, setHrDocs] = useState<TravelDocumentDto[]>([])
    const [employeeDocs, setEmployeeDocs] = useState<TravelDocumentDto[]>([])
    const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isTypesLoading, setIsTypesLoading] = useState(true)
    const [isUploading, setIsUploading] = useState(false)
    const [documentTypeId, setDocumentTypeId] = useState('')
    const [documentName, setDocumentName] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    const employeeId = useMemo(() => {
        if (!userId) return null
        const parsed = Number(userId)
        return Number.isNaN(parsed) ? null : parsed
    }, [userId])

    const getDocumentUrl = (path: string) => {
        const parts = path.split('/')
        if (parts.length >= 2) {
            const category = parts[0]
            const filename = parts.slice(1).join('/')
            return getFileUrl(category, filename)
        }
        return getFileUrl('travel-documents', path)
    }

    const loadDocuments = async () => {
        if (!employeeId) return
        setIsLoading(true)
        try {
            const [hrDocuments, employeeDocuments] = await Promise.all([
                getDocumentsByTravelHR(plan.travelId),
                getDocumentsByTravelEmployee(plan.travelId, employeeId),
            ])
            setHrDocs(hrDocuments)
            setEmployeeDocs(employeeDocuments)
        } catch (error) {
            toast.error('Failed to load travel documents')
            console.error('Error loading travel documents:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const loadDocumentTypes = async () => {
        setIsTypesLoading(true)
        try {
            const types = await getDocumentTypes()
            setDocumentTypes(types)
        } catch (error) {
            toast.error('Failed to load document types')
            console.error('Error loading document types:', error)
        } finally {
            setIsTypesLoading(false)
        }
    }

    useEffect(() => {
        loadDocuments()
    }, [employeeId, plan.travelId])

    useEffect(() => {
        loadDocumentTypes()
    }, [])

    const handleUpload = async () => {
        if (!employeeId) {
            toast.error('Unable to identify employee')
            return
        }
        if (!selectedFile || !documentTypeId || !documentName.trim()) {
            toast.error('Provide document type, name, and file')
            return
        }

        setIsUploading(true)
        try {
            const uploaded = await uploadDocument({
                travelPlanId: plan.travelId,
                employeeId,
                documentTypeId: Number(documentTypeId),
                documentName: documentName.trim(),
                file: selectedFile,
            })
            setEmployeeDocs((prev) => [uploaded, ...prev])
            setDocumentTypeId('')
            setDocumentName('')
            setSelectedFile(null)
            toast.success('Document uploaded successfully')
        } catch (error) {
            toast.error('Failed to upload document')
            console.error('Error uploading document:', error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
            <div className={cn('max-w-6xl mx-auto space-y-6')}>
                <Card className={cn('border')}>
                    <CardHeader>
                        <CardTitle className={cn('text-2xl font-semibold text-foreground')}>{plan.title}</CardTitle>
                        <CardDescription>{plan.description || 'No description provided.'}</CardDescription>
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
                        <CardTitle className={cn('text-xl font-semibold text-foreground')}>Upload Document</CardTitle>
                        <CardDescription>Upload travel-related documents for this plan.</CardDescription>
                    </CardHeader>
                    <CardContent className={cn('space-y-4')}>
                        <div className={cn('grid gap-4 md:grid-cols-3')}>
                            <div className={cn('space-y-2')}>
                                <Label htmlFor='documentTypeId'>Document Type</Label>
                                <select
                                    id='documentTypeId'
                                    value={documentTypeId}
                                    onChange={(event) => setDocumentTypeId(event.target.value)}
                                    className={cn('h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground')}
                                    disabled={isTypesLoading}
                                >
                                    <option value=''>Select type</option>
                                    {documentTypes.map((type) => (
                                        <option key={type.id} value={String(type.id)}>
                                            {type.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className={cn('space-y-2 md:col-span-2')}>
                                <Label htmlFor='documentName'>Document Name</Label>
                                <Input
                                    id='documentName'
                                    value={documentName}
                                    onChange={(event) => setDocumentName(event.target.value)}
                                />
                            </div>
                            <div className={cn('space-y-2 md:col-span-3')}>
                                <Label htmlFor='documentFile'>File</Label>
                                <Input
                                    id='documentFile'
                                    type='file'
                                    onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                                />
                            </div>
                        </div>
                        <Button onClick={handleUpload} disabled={isUploading}>
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
                        <CardTitle className={cn('text-xl font-semibold text-foreground')}>Documents</CardTitle>
                        <CardDescription>Documents uploaded by HR and employees.</CardDescription>
                    </CardHeader>
                    <CardContent className={cn('space-y-6')}>
                        {isLoading ? (
                            <div className={cn('flex items-center justify-center py-8 text-muted-foreground gap-2')}>
                                <Spinner className="size-4" />
                                <span>Loading documents...</span>
                            </div>
                        ) : (
                            <div className={cn('grid gap-6 md:grid-cols-2')}>
                                <div className={cn('space-y-3')}>
                                    <h3 className={cn('text-sm font-semibold text-foreground')}>HR Documents</h3>
                                    {hrDocs.length === 0 ? (
                                        <div className={cn('rounded-lg border border-dashed p-4 text-sm text-muted-foreground')}>
                                            No documents uploaded by HR yet.
                                        </div>
                                    ) : (
                                        hrDocs.map((doc) => (
                                            <div key={doc.documentId} className={cn('rounded-lg border p-3 text-sm')}>
                                                <p className={cn('font-medium text-foreground')}>{doc.documentName}</p>
                                                <p className={cn('text-xs text-muted-foreground')}>{doc.documentTypeName}</p>
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
                                <div className={cn('space-y-3')}>
                                    <h3 className={cn('text-sm font-semibold text-foreground')}>Your Documents</h3>
                                    {employeeDocs.length === 0 ? (
                                        <div className={cn('rounded-lg border border-dashed p-4 text-sm text-muted-foreground')}>
                                            No documents uploaded yet.
                                        </div>
                                    ) : (
                                        employeeDocs.map((doc) => (
                                            <div key={doc.documentId} className={cn('rounded-lg border p-3 text-sm')}>
                                                <p className={cn('font-medium text-foreground')}>{doc.documentName}</p>
                                                <p className={cn('text-xs text-muted-foreground')}>{doc.documentTypeName}</p>
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
        </div>
    )
}

export default TravelPlanDetails