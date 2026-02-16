import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { ChevronRight } from 'lucide-react'

interface ManagerChainBreadcrumbProps {
  managerChain: EmployeeSummaryDto[]
  selectedEmployee: EmployeeSummaryDto | null
  onNodeClick: (employee: EmployeeSummaryDto) => void
}

export default function ManagerChainBreadcrumb({
  managerChain,
  selectedEmployee,
  onNodeClick
}: ManagerChainBreadcrumbProps) {
  if (!selectedEmployee) {
    return null
  }

  const chain = [...managerChain, selectedEmployee]

  return (
    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
      <h3 className='text-sm font-semibold text-gray-700 mb-3'>Manager Chain</h3>
      <div className='flex flex-wrap items-center gap-2'>
        {chain.map((employee, index) => (
          <div key={employee.employeeId} className='flex items-center gap-2'>
            <button
              onClick={() => onNodeClick(employee)}
              className='px-3 py-2 rounded-lg bg-white border border-blue-300 hover:bg-blue-100 transition-colors text-sm font-medium text-blue-700'
            >
              {employee.firstName} {employee.lastName}
            </button>
            {index < chain.length - 1 && (
              <ChevronRight className='w-4 h-4 text-gray-400' />
            )}
          </div>
        ))}
      </div>

      {chain.length === 1 && (
        <p className='text-xs text-gray-600 mt-2'>
          This employee is at the top level of the organization
        </p>
      )}
    </div>
  )
}
