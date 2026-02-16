import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const navigate = useNavigate()


  return (
    <div className="w-full space-y-8">
      <div className="text-center space-y-6">

        <div className="space-y-4">
          <h1 className={cn(
            'text-4xl sm:text-5xl font-bold tracking-tight leading-tight',
            'text-slate-900 dark:text-white'
          )}>
            Human Resource Management System
          </h1>
          <p className={cn(
            'text-base sm:text-lg',
            'text-slate-600 dark:text-slate-400'
          )}>
            Streamline your focused on travel, expenses, social engagement, Game scheduling, org chart and referral workflows.
          </p>
        </div>

        <div className={cn('flex flex-col gap-3 pt-4')}>
          <Button
            onClick={() => navigate('/login')}
            className="w-full"
          >
            Login to Your Account
          </Button>
          <Button
            onClick={() => navigate('/signup')}
            variant="outline"
            className={cn(
              'w-full px-6 py-3 text-base font-semibold',
              'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-400 dark:hover:bg-primary-950/50 transition-colors'
            )}
          >
            Create New Account
          </Button>
        </div>
      </div>
    </div>
  )
}
