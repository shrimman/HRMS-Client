import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { getFileUrl } from '@/lib/api/file'
import { Card } from '@/components/ui/card'
import { User } from 'lucide-react'

interface EmployeeCardProps {
  employee: EmployeeSummaryDto
  onClick?: () => void
  isSelected?: boolean
}

export default function EmployeeCard({ 
  employee, 
  onClick, 
  isSelected = false 
}: EmployeeCardProps) {
  const getPhotoUrl = () => {
    if (!employee.photoPath) return null

    const parts = employee.photoPath.split('/')

    if (parts.length >= 2) {
      const category = parts[0]
      const filename = parts.slice(1).join('/')
      return getFileUrl(category, filename)
    } else {
      return getFileUrl('profile-photos', employee.photoPath)
    }
  }

  const photoUrl = getPhotoUrl()

  return (
    <Card
      onClick={onClick}
      className={`p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      } ${onClick ? 'hover:bg-gray-50' : ''}`}
    >
      <div className='flex flex-col items-center text-center gap-3'>
        <div className='relative'>
          {photoUrl ? (
            <img
              src={photoUrl}
              alt={`${employee.firstName} ${employee.lastName}`}
              className='w-16 h-16 rounded-full object-cover border-2 border-gray-200'
            />
          ) : (
            <div className='w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center'>
              <User className='w-8 h-8 text-gray-400' />
            </div>
          )}
        </div>

        <div className='min-w-0'>
          <h3 className='font-semibold text-sm truncate'>
            {employee.firstName} {employee.lastName}
          </h3>
          <p className='text-xs text-gray-600'>
            {employee.email}
          </p>
        </div>

        {employee.designation && (
          <p className='text-xs font-medium text-blue-600'>
            {employee.designation.designationName}
          </p>
        )}

        {employee.department && (
          <p className='text-xs text-gray-500'>
            {employee.department.departmentName}
          </p>
        )}

        {employee.role && (
          <span className='inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded'>
            {employee.role.roleName}
          </span>
        )}
      </div>
    </Card>
  )
}
