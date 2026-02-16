import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

export default function PublicLayout() {
  return (
    <div
      className={cn(
        'flex min-h-screen flex-col items-center justify-center',
        'bg-background px-4 py-8 sm:px-6 lg:px-8'
      )}
    >
      <div className={cn('w-full max-w-md')}>
        <Outlet />
      </div>
    </div>
  )
}
