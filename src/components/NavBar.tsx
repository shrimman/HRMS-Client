import { cn } from '@/lib/utils'
import { Building2, Bell, User, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useAppDispatch } from '@/lib/redux/hooks'
import { logout as logoutAction } from '@/lib/redux/slices/authSlice'
import { logout as logoutAPI } from '@/lib/api/auth/auth'
import Notifications from './Notifications'
import { getUnreadCount } from '@/lib/api/notification'

function NavBar() {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const profileMenuRef = useRef<HTMLDivElement>(null)
    const notificationsRef = useRef<HTMLDivElement>(null)
    const dispatch = useAppDispatch()
    const isMountedRef = useRef(true)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false)
            }
            if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
                setNotificationsOpen(false)
            }
        }

        if (profileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        if (notificationsOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [profileMenuOpen, notificationsOpen])

    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }
    }, [])

    const fetchUnreadCount = async () => {
        try {
            const count = await getUnreadCount();
            if (isMountedRef.current) setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch unread notifications count:', error)
        }
    }

    useEffect(() => {
        fetchUnreadCount()
    }, [])

    const handleLogout = useCallback(async () => {
        try {
            await logoutAPI()
            dispatch(logoutAction())
            setProfileMenuOpen(false)
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }, [dispatch])
    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50',
                'bg-primary-900',
                'border-b border-slate-700/50',
                'shadow-sm',
                'h-14',
                'flex items-center justify-between px-6'
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    'w-8 h-8 rounded',
                    'bg-secondary-500',
                    'flex items-center justify-center'
                )}>
                    <Building2 className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:flex sm:flex-col leading-tight">
                    <h2 className="text-base font-semibold text-white">ROIMA</h2>
                    <p className="text-xs text-primary-200">India</p>
                </div>
            </div>

            <div className="flex items-center gap-2" >
                <div className="relative" ref={notificationsRef}>
                    <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className={cn(
                            'relative p-2 rounded',
                            'text-primary-100 hover:text-white hover:bg-primary-800',
                            'transition-colors duration-200'
                        )}
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5" />
                        <span className={cn(
                            'absolute -top-1 -right-1 min-w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-0.5',
                        )}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    </button>

                    {notificationsOpen && (
                        <Notifications onMarked={fetchUnreadCount} />
                    )}
                </div>


                <div className="relative" ref={profileMenuRef}>
                    <button
                        onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                        className={cn(
                            'p-2 rounded',
                            'text-primary-100 hover:text-white hover:bg-primary-800',
                            'transition-colors duration-200'
                        )}
                        aria-label="Profile Menu"
                    >
                        <User className="w-5 h-5" />
                    </button>

                    {profileMenuOpen && (
                        <div className={cn(
                            'absolute right-0 top-full mt-2',
                            'w-48 rounded-lg',
                            'bg-primary-900 border border-slate-700/50',
                            'shadow-lg',
                            'py-1',
                            'z-50'
                        )}>
                            <Link
                                to="/profile"
                                onClick={() => setProfileMenuOpen(false)}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-2.5',
                                    'text-primary-100 hover:text-white hover:bg-primary-800',
                                    'transition-colors duration-150'
                                )}
                            >
                                <User className="w-4 h-4" />
                                <span className="text-sm font-medium">My Profile</span>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className={cn(
                                    'w-full flex items-center gap-3 px-4 py-2.5',
                                    'text-primary-100 hover:text-white hover:bg-red-600',
                                    'transition-colors duration-150',
                                    'border-t border-slate-700/30 mt-1 pt-2.5'
                                )}
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm font-medium">Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}

export default NavBar