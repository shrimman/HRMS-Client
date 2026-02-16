import type { EmployeeSummaryDto } from '@/lib/api/employee'
import EmployeeCard from './EmployeeCard'

interface DirectReportsGridProps {
  directReports: EmployeeSummaryDto[]
  onEmployeeClick: (employee: EmployeeSummaryDto) => void
}

export default function DirectReportsGrid({
  directReports,
  onEmployeeClick
}: DirectReportsGridProps) {
  if (directReports.length === 0) {
    return (
      <div className='bg-gray-50 border border-gray-200 rounded-lg p-8 text-center'>
        <p className='text-gray-600'>No direct reports</p>
      </div>
    )
  }

  return (
    <div>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        Direct Reports ({directReports.length})
      </h3>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
        {directReports.map((employee) => (
          <div key={employee.employeeId} onClick={() => onEmployeeClick(employee)}>
            <EmployeeCard employee={employee} onClick={() => onEmployeeClick(employee)} />
          </div>
        ))}
      </div>
    </div>
  )
}
