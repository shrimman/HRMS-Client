import { cn } from '@/lib/utils'
import { Building2, Bell, User, LogOut } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAppDispatch } from '@/lib/redux/hooks'
import { logout as logoutAction } from '@/lib/redux/slices/authSlice'
import { logout as logoutAPI } from '@/lib/api/auth/auth'

function NavBar() {
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const profileMenuRef = useRef<HTMLDivElement>(null)
    const dispatch = useAppDispatch()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false)
            }
        }

        if (profileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [profileMenuOpen])

    const handleLogout = async () => {
        try {
            await logoutAPI()
            dispatch(logoutAction())
            setProfileMenuOpen(false)
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }
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

            <div className="flex items-center gap-2">
                <button
                    className={cn(
                        'relative p-2 rounded',
                        'text-primary-100 hover:text-white hover:bg-primary-800',
                        'transition-colors duration-200'
                    )}
                    aria-label="Notifications"
                >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                </button>

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