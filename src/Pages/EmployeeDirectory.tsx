import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { searchEmployee, getAllEmployees } from '@/lib/api/hr'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { getDepartments, getDesignations } from '@/lib/api/employee'
import { Loader2, Search, X, User } from 'lucide-react'
import { getFileUrl } from '@/lib/api/file'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function EmployeeDirectory() {
    const [employees, setEmployees] = useState<EmployeeSummaryDto[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState<string>('')
    const [selectedDesignation, setSelectedDesignation] = useState<string>('')
    const [departments, setDepartments] = useState<string[]>([])
    const [designations, setDesignations] = useState<string[]>([])
    const navigate = useNavigate();

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
        </div>
    )
}
