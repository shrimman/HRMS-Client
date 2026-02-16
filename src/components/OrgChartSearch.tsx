import { useState, useEffect, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { searchEmployee } from '@/lib/api/hr'
import { Loader2 } from 'lucide-react'
import EmployeeCard from './EmployeeCard'

interface OrgChartSearchProps {
    onSelectEmployee: (employee: EmployeeSummaryDto) => void
    selectedEmployeeId?: number
}

export default function OrgChartSearch({
    onSelectEmployee,
    selectedEmployeeId
}: OrgChartSearchProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [filteredEmployees, setFilteredEmployees] = useState<EmployeeSummaryDto[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const performSearch = useCallback(async (query: string) => {
        if (query.trim().length < 2) {
            setFilteredEmployees([])
            setIsOpen(false)
            setError(null)
            return
        }

        try {
            setIsLoading(true)
            setError(null)
            const data = await searchEmployee({ query })
            setFilteredEmployees(data)
            setIsOpen(true)
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to search employees'
            setError(errorMessage)
            setFilteredEmployees([])
            setIsOpen(true)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            performSearch(searchQuery)
        }, 300)

        return () => clearTimeout(timer)
    }, [searchQuery, performSearch])

    const handleSelectEmployee = (employee: EmployeeSummaryDto) => {
        setSearchQuery('')
        setIsOpen(false)
        setFilteredEmployees([])
        setError(null)
        onSelectEmployee(employee)
    }

    return (
        <div className='w-full max-w-md mx-auto relative'>
            <div className='relative'>
                <Input
                    type='text'
                    placeholder='Search employee by name or email...'
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery && setIsOpen(true)}
                    className='w-full'
                    disabled={isLoading}
                />
                {isLoading && (
                    <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400' />
                )}
            </div>

            {isOpen && (
                <div className='absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto'>
                    {error ? (
                        <div className='p-4 text-center text-red-600 text-sm'>
                            {error}
                        </div>
                    ) : filteredEmployees.length > 0 ? (
                        <div className='grid grid-cols-1 gap-2 p-2'>
                            {filteredEmployees.map((employee) => (
                                <div
                                    key={employee.employeeId}
                                    onClick={() => handleSelectEmployee(employee)}
                                    className='cursor-pointer'
                                >
                                    <EmployeeCard
                                        employee={employee}
                                        isSelected={selectedEmployeeId === employee.employeeId}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='p-4 text-center text-gray-500 text-sm'>
                            No employees found
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
