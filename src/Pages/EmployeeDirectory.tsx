import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { searchEmployee, getAllEmployees, updateEmployeeProfile, type UpdateEmployeeProfileDto } from '@/lib/api/hr'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { getDepartments, getDesignations } from '@/lib/api/employee'
import { Edit, Loader2, Search, X, User } from 'lucide-react'
import { getFileUrl } from '@/lib/api/file'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { useUserRole } from '@/lib/redux/hooks'

export default function EmployeeDirectory() {
    const [employees, setEmployees] = useState<EmployeeSummaryDto[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState<string>('')
    const [selectedDesignation, setSelectedDesignation] = useState<string>('')
    const [departments, setDepartments] = useState<string[]>([])
    const [designations, setDesignations] = useState<string[]>([])
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSummaryDto | null>(null)
    const [managerQuery, setManagerQuery] = useState('')
    const [managerResults, setManagerResults] = useState<EmployeeSummaryDto[]>([])
    const [isManagerSearching, setIsManagerSearching] = useState(false)
    const [modalDepartmentName, setModalDepartmentName] = useState('')
    const [modalDesignationName, setModalDesignationName] = useState('')
    const [editForm, setEditForm] = useState<UpdateEmployeeProfileDto>({
        dateOfJoining: '',
        managerId: undefined,
        departmentId: undefined,
        designationId: undefined,
        roleId: undefined,
        isActive: true
    })
    const navigate = useNavigate();
    const currentRole = useUserRole()
    const canEdit = currentRole === 'HR'

    useEffect(() => {
        loadInitialData()
    }, [])

    const loadInitialData = async () => {
        setIsLoading(true)
        try {
            const [allEmployees, deptList, desigList] = await Promise.all([
                getAllEmployees(),
                getDepartments(),
                getDesignations()
            ])

            setEmployees(allEmployees)
            setDepartments(deptList)
            setDesignations(desigList)
        } catch (error) {
            toast.error('Failed to load employees')
            console.error('Error loading employees:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSearch = async () => {
        setIsLoading(true)
        try {
            const params = {
                query: searchQuery || undefined,
                department: selectedDepartment && selectedDepartment !== 'all' ? selectedDepartment : undefined,
                designation: selectedDesignation && selectedDesignation !== 'all' ? selectedDesignation : undefined,
            }

            const results = await searchEmployee(params)
            setEmployees(results)
        } catch (error) {
            toast.error('Failed to search employees')
            console.error('Error searching employees:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleClearFilters = async () => {
        setSearchQuery('')
        setSelectedDepartment('')
        setSelectedDesignation('')
        await loadInitialData()
    }

    const getPhotoUrl = (photoPath?: string) => {
        if (!photoPath) return null
        const parts = photoPath.split('/')
        if (parts.length >= 2) {
            const category = parts[0]
            const filename = parts.slice(1).join('/')
            return getFileUrl(category, filename)
        }
        return null
    }

    const handleRowClick = (employee: EmployeeSummaryDto) => {
        toast.info(`View details for ${employee.firstName} ${employee.lastName}`);
        navigate(`/employee-directory/${employee.employeeId}`);
    }

    const departmentOptions = departments
    const designationOptions = designations

    const roleOptions = Array.from(
        new Map(
            employees.map((employee) => [employee.role.roleId, employee.role.roleName])
        )
    ).map(([roleId, roleName]) => ({
        roleId,
        roleName
    }))

    const managerOptions = (managerResults.length > 0 ? managerResults : employees).map((employee) => ({
        employeeId: employee.employeeId,
        fullName: `${employee.firstName} ${employee.lastName}`
    }))

    const departmentIdByName = new Map(
        employees
            .filter((employee) => employee.department)
            .map((employee) => [employee.department!.departmentName, employee.department!.departmentId])
    )

    const designationIdByName = new Map(
        employees
            .filter((employee) => employee.designation)
            .map((employee) => [employee.designation!.designationName, employee.designation!.designationId])
    )

    const openEditModal = (employee: EmployeeSummaryDto) => {
        setSelectedEmployee(employee)
        setManagerQuery('')
        setManagerResults([])
        setModalDepartmentName(employee.department?.departmentName ?? '')
        setModalDesignationName(employee.designation?.designationName ?? '')
        setEditForm({
            dateOfJoining: employee.dateOfJoining || '',
            managerId: employee.managerId,
            departmentId: employee.department?.departmentId,
            designationId: employee.designation?.designationId,
            roleId: employee.role.roleId,
            isActive: employee.active
        })
        setIsEditOpen(true)
    }

    const handleManagerSearch = async () => {
        if (!managerQuery.trim()) {
            setManagerResults([])
            return
        }

        setIsManagerSearching(true)
        try {
            const results = await searchEmployee({ query: managerQuery.trim() })
            setManagerResults(results)
        } catch (error) {
            toast.error('Failed to search managers')
            console.error('Error searching managers:', error)
        } finally {
            setIsManagerSearching(false)
        }
    }

    const handleSave = async () => {
        if (!selectedEmployee) return

        const payload: UpdateEmployeeProfileDto = {
            dateOfJoining: editForm.dateOfJoining || undefined,
            managerId: editForm.managerId,
            departmentId: editForm.departmentId,
            designationId: editForm.designationId,
            roleId: editForm.roleId,
            isActive: editForm.isActive
        }

        setIsSaving(true)
        try {
            const updated = await updateEmployeeProfile(selectedEmployee.employeeId, payload)
            setEmployees((prev) =>
                prev.map((employee) => employee.employeeId === updated.employeeId ? updated : employee)
            )
            toast.success('Employee updated successfully')
            setIsEditOpen(false)
        } catch (error) {
            toast.error('Failed to update employee')
            console.error('Error updating employee:', error)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className='space-y-6'>
            <Card className={cn('border-primary-200')}>
                <CardHeader>
                    <CardTitle className={cn('text-primary-600')}>Employee Directory</CardTitle>
                    <CardDescription>
                        Search and filter employees by name, department, or designation
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className='space-y-4'>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                            <div className='md:col-span-2'>
                                <Input
                                    placeholder='Search by name or email...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    className='w-full'
                                />
                            </div>

                            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                                <SelectTrigger>
                                    <SelectValue placeholder='All Departments' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>All Departments</SelectItem>
                                    {departments.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedDesignation} onValueChange={setSelectedDesignation}>
                                <SelectTrigger>
                                    <SelectValue placeholder='All Designations' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>All Designations</SelectItem>
                                    {designations.map((desig) => (
                                        <SelectItem key={desig} value={desig}>
                                            {desig}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='flex gap-2'>
                            <Button onClick={handleSearch} disabled={isLoading}>
                                <Search className='w-4 h-4 mr-2' />
                                Search
                            </Button>
                            <Button onClick={handleClearFilters} variant='outline' disabled={isLoading}>
                                <X className='w-4 h-4 mr-2' />
                                Clear Filters
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className='flex items-center justify-center py-12'>
                                <Loader2 className='w-8 h-8 animate-spin text-primary-600' />
                            </div>
                        ) : (
                            <div className='rounded-md border'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className='w-16'></TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead>Designation</TableHead>
                                            <TableHead>Role</TableHead>
                                            {canEdit ? (
                                                <TableHead className='w-20 text-right'>Action</TableHead>
                                            ) : null}
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employees.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className='text-center py-8 text-gray-500'>
                                                    No employees found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            employees.map((employee) => {
                                                const photoUrl = getPhotoUrl(employee.photoPath)
                                                return (
                                                    <TableRow
                                                        key={employee.employeeId}
                                                        className='hover:bg-gray-50 cursor-pointer'
                                                        onClick={() => handleRowClick(employee)}
                                                    >
                                                        <TableCell>
                                                            {photoUrl ? (
                                                                <img
                                                                    src={photoUrl}
                                                                    alt={`${employee.firstName} ${employee.lastName}`}
                                                                    className='w-10 h-10 rounded-full object-cover'
                                                                    onError={(e) => {
                                                                        e.currentTarget.style.display = 'none'
                                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                                                    }}
                                                                />
                                                            ) : null}
                                                            <div
                                                                className={cn(
                                                                    'w-10 h-10 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center',
                                                                    photoUrl && 'hidden'
                                                                )}
                                                            >
                                                                <User className='w-5 h-5 text-white' />
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className='font-medium'>
                                                            {employee.firstName} {employee.lastName}
                                                        </TableCell>
                                                        <TableCell>{employee.email}</TableCell>
                                                        <TableCell>
                                                            {employee.department ? (
                                                                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                                                                    {employee.department.departmentName}
                                                                </span>
                                                            ) : (
                                                                <span className='text-gray-400'>-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {employee.designation ? (
                                                                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                                                                    {employee.designation.designationName}
                                                                </span>
                                                            ) : (
                                                                <span className='text-gray-400'>-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800'>
                                                                {employee.role.roleName}
                                                            </span>
                                                        </TableCell>
                                                        {canEdit ? (
                                                            <TableCell className='text-right'>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='sm'
                                                                    onClick={(event) => {
                                                                        event.stopPropagation()
                                                                        openEditModal(employee)
                                                                    }}
                                                                >
                                                                    <Edit className='w-4 h-4 mr-1' />
                                                                    Edit
                                                                </Button>
                                                            </TableCell>
                                                        ) : null}
                                                    </TableRow>
                                                )
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {!isLoading && employees.length > 0 && (
                            <div className='text-sm text-gray-600'>
                                Showing {employees.length} employee{employees.length !== 1 ? 's' : ''}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className={cn('sm:max-w-2xl')}>
                    <DialogHeader>
                        <DialogTitle>Edit Employee Profile</DialogTitle>
                        <DialogDescription>
                            Update employee details and status.
                        </DialogDescription>
                    </DialogHeader>
                    {selectedEmployee ? (
                        <div className={cn('space-y-6')}>
                            <div className={cn('grid gap-4 md:grid-cols-2')}>
                                <div className={cn('space-y-2')}>
                                    <Label>Employee</Label>
                                    <div className={cn('rounded-md border px-3 py-2 text-sm text-foreground')}>
                                        {selectedEmployee.firstName} {selectedEmployee.lastName}
                                    </div>
                                    <div className={cn('text-xs text-muted-foreground')}>
                                        {selectedEmployee.email}
                                    </div>
                                </div>
                                <div className={cn('space-y-2')}>
                                    <Label htmlFor='dateOfJoining'>Date of Joining</Label>
                                    <Input
                                        id='dateOfJoining'
                                        type='date'
                                        value={editForm.dateOfJoining || ''}
                                        onChange={(event) => setEditForm((prev) => ({
                                            ...prev,
                                            dateOfJoining: event.target.value
                                        }))}
                                    />
                                </div>
                                <div className={cn('space-y-2')}>
                                    <Label>Manager</Label>
                                    <div className={cn('flex gap-2')}>
                                        <Input
                                            placeholder='Search by name...'
                                            value={managerQuery}
                                            onChange={(event) => setManagerQuery(event.target.value)}
                                            onKeyDown={(event) => event.key === 'Enter' && handleManagerSearch()}
                                        />
                                        <Button variant='outline' onClick={handleManagerSearch} disabled={isManagerSearching}>
                                            {isManagerSearching ? 'Searching...' : 'Search'}
                                        </Button>
                                    </div>
                                    <Select
                                        value={editForm.managerId ? String(editForm.managerId) : 'none'}
                                        onValueChange={(value) => setEditForm((prev) => ({
                                            ...prev,
                                            managerId: value === 'none' ? undefined : Number(value)
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select manager' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='none'>No manager</SelectItem>
                                            {managerOptions.map((manager) => (
                                                <SelectItem key={manager.employeeId} value={String(manager.employeeId)}>
                                                    {manager.fullName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className={cn('space-y-2')}>
                                    <Label>Department</Label>
                                    <Select
                                        value={modalDepartmentName || 'none'}
                                        onValueChange={(value) => {
                                            const nextName = value === 'none' ? '' : value
                                            const nextId = nextName ? departmentIdByName.get(nextName) : undefined
                                            setModalDepartmentName(nextName)
                                            setEditForm((prev) => ({
                                                ...prev,
                                                departmentId: nextId
                                            }))
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select department' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='none'>Not assigned</SelectItem>
                                            {departmentOptions.map((department) => (
                                                <SelectItem key={department} value={department}>
                                                    {department}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className={cn('space-y-2')}>
                                    <Label>Designation</Label>
                                    <Select
                                        value={modalDesignationName || 'none'}
                                        onValueChange={(value) => {
                                            const nextName = value === 'none' ? '' : value
                                            const nextId = nextName ? designationIdByName.get(nextName) : undefined
                                            setModalDesignationName(nextName)
                                            setEditForm((prev) => ({
                                                ...prev,
                                                designationId: nextId
                                            }))
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select designation' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='none'>Not assigned</SelectItem>
                                            {designationOptions.map((designation) => (
                                                <SelectItem key={designation} value={designation}>
                                                    {designation}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className={cn('space-y-2')}>
                                    <Label>Role</Label>
                                    <Select
                                        value={editForm.roleId ? String(editForm.roleId) : 'none'}
                                        onValueChange={(value) => setEditForm((prev) => ({
                                            ...prev,
                                            roleId: value === 'none' ? undefined : Number(value)
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select role' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='none'>Not assigned</SelectItem>
                                            {roleOptions.map((role) => (
                                                <SelectItem key={role.roleId} value={String(role.roleId)}>
                                                    {role.roleName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className={cn('space-y-2')}>
                                    <Label>Status</Label>
                                    <Select
                                        value={editForm.isActive ? 'active' : 'inactive'}
                                        onValueChange={(value) => setEditForm((prev) => ({
                                            ...prev,
                                            isActive: value === 'active'
                                        }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder='Select status' />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='active'>Active</SelectItem>
                                            <SelectItem value='inactive'>Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant='outline' onClick={() => setIsEditOpen(false)} disabled={isSaving}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSave} disabled={isSaving}>
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
