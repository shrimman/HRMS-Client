import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { checkAuth } from '@/lib/redux/slices/authSlice'
import { Spinner } from '@/components/ui/spinner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const dispatch = useAppDispatch()
  const { isAuthenticated, authChecked, loading } = useAppSelector((state) => state.auth)

  useEffect(() => {
    if (!authChecked) {
      dispatch(checkAuth())
    }
  }, [authChecked, dispatch])

  if (!authChecked || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Spinner className="size-6" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
