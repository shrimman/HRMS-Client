import { cn } from '@/lib/utils'

interface ExpenseStatusBadgeProps {
  status: string
  className?: string
}

export default function ExpenseStatusBadge({ status, className }: ExpenseStatusBadgeProps) {
  const getStatusStyles = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    
    if (normalizedStatus === 'draft') {
      return 'bg-gray-100 text-gray-700 border-gray-300'
    }
    if (normalizedStatus === 'submitted' || normalizedStatus === 'pending') {
      return 'bg-blue-100 text-blue-700 border-blue-300'
    }
    if (normalizedStatus === 'approved') {
      return 'bg-green-100 text-green-700 border-green-300'
    }
    if (normalizedStatus === 'rejected') {
      return 'bg-red-100 text-red-700 border-red-300'
    }
    
    return 'bg-gray-100 text-gray-700 border-gray-300'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        getStatusStyles(status),
        className
      )}
    >
      {status}
    </span>
  )
}
