import { useDispatch, useSelector } from 'react-redux'
import type { TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '../redux/store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useAuth = () => useAppSelector((state) => state.auth)
export const useUser = () => useAppSelector((state) => state.auth.user)
export const useUserRole = () => useAppSelector((state) => state.auth.user?.roleName ?? null)
export const useIsAuthenticated = () => useAppSelector((state) => state.auth.isAuthenticated)
export const useAuthLoading = () => useAppSelector((state) => state.auth.loading)
export const useAuthError = () => useAppSelector((state) => state.auth.error)
export const useAuthChecked = () => useAppSelector((state) => state.auth.authChecked)