import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useUser, useUserRole } from '@/lib/redux/hooks'
import {
    LayoutDashboard, Album, ChartGanttIcon, AwardIcon, ChevronDown, Briefcase, Trophy, PlaneIcon, FileUser, ReceiptIcon,
    TicketsPlane,
    UserPlus,
    University
} from 'lucide-react'

type NavigationItem = {
    label: string
    path?: string
    icon: typeof LayoutDashboard
    children?: { label: string; path: string; icon: typeof Album }[]
}

export default function Sidebar() {
    const location = useLocation()
    const user = useUser()
    const role = useUserRole() ?? 'Employee'
    const [expandedItems, setExpandedItems] = useState<string[]>([])

    const navigationItems: NavigationItem[] = [
        { label: 'Dashboard', path: '/home', icon: LayoutDashboard },
        {
            label: 'Organization',
            icon: University,
            children: [
                ...(role === 'HR' || role === 'Manager'
                    ?
                    [{ label: 'Org Chart', path: '/org-chart', icon: ChartGanttIcon }] : []),
                { label: 'Employee Directory', path: '/employee-directory', icon: FileUser },
                ...(role === 'Manager'
                    ?
                    [{ label: 'Team Overview', path: '/manager/team', icon: Album }] : []),
                ...(role === 'HR'
                    ?
                    [{ label: 'Add New Employee', path: '/signup', icon: UserPlus }] : []),
            ]
        },
        {
            label: 'Job',
            icon: Briefcase,
            children: [

                { label: 'Job Openings', path: '/job', icon: Album },
                { label: 'Job Reviews', path: '/job-reviews', icon: Album },
                { label: 'Job Referrals', path: '/job-referrals', icon: Album },
                ...(role === 'HR'
                    ? [
                        { label: 'Create Job Opening', path: '/hr/job/new', icon: Album },
                        { label: 'Share Logs', path: '/hr/job-share-logs', icon: Album },
                    ]
                    : []),
            ]
        },
        {
            label: 'Travel',
            icon: PlaneIcon,
            children: [
                { label: 'My Travel Plans', path: '/myTravels', icon: Album },
                { label: 'Travel Expenses', path: '/travel-expenses', icon: ReceiptIcon },
                ...(role === 'HR'
                    ? [{ label: 'Create Travel Plan', path: '/createTravel', icon: TicketsPlane }]
                    : []),
                ...(role === 'HR'
                    ? [{ label: 'My Created Plans', path: '/hr/travels/created', icon: Album }]
                    : []),
                ...(role === 'HR'
                    ? [{ label: 'Manage Expenses', path: '/hr/travel-expenses', icon: ReceiptIcon }]
                    : []),
                ...(role === 'Manager'
                    ? [{ label: 'Pending Approvals', path: '/manager/travel-expenses', icon: Album }]
                    : []),
            ]

        },
        {
            label: 'Achievements',
            icon: Trophy,
            children: [
                { label: 'Achievement Feed', path: '/feed', icon: AwardIcon },
                { label: 'My Post', path: '/my-post', icon: AwardIcon },
            ]
        },
    ]


    const isActive = (path: string) => location.pathname === path

    const toggleExpanded = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label)
                ? prev.filter(item => item !== label)
                : [...prev, label]
        )
    }

    const isExpanded = (label: string) => expandedItems.includes(label)

    const isParentActive = (item: NavigationItem) => {
        if (item.path && isActive(item.path)) return true
        return item.children?.some(child => isActive(child.path)) || false
    }

    return (
        <aside
            className={cn(
                'h-screen w-64 flex flex-col fixed left-0 top-14 pt-4',
                'bg-primary-900',
                'border-r border-slate-700/50',
                'overflow-y-auto'
            )}
        >
            <div className="px-4 py-4">
                <div className="flex items-center gap-3 bg-primary-800/50 rounded p-3 border border-slate-700/30">
                    <div
                        className={cn(
                            'h-10 w-10 rounded',
                            'bg-secondary-500',
                            'flex items-center justify-center',
                            'text-white font-semibold text-sm'
                        )}
                    >
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">
                            {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-primary-200">{role}</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navigationItems.map((item) => {
                    const Icon = item.icon
                    const hasChildren = item.children && item.children.length > 0
                    const expanded = isExpanded(item.label)
                    const parentActive = isParentActive(item)

                    return (
                        <div key={item.label} className="space-y-1">
                            {hasChildren ? (
                                <button
                                    onClick={() => toggleExpanded(item.label)}
                                    className={cn(
                                        'w-full group flex items-center gap-3',
                                        'px-3 py-2 rounded',
                                        'transition-colors duration-150',
                                        parentActive
                                            ? 'bg-secondary-500/90 text-white'
                                            : 'text-primary-100 hover:text-white hover:bg-primary-800'
                                    )}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span className="text-sm font-medium flex-1 text-left">
                                        {item.label}
                                    </span>
                                    <ChevronDown
                                        className={cn(
                                            'w-4 h-4 transition-transform duration-200 shrink-0',
                                            expanded ? 'rotate-180' : 'rotate-0'
                                        )}
                                    />
                                </button>
                            ) : (
                                <Link
                                    to={item.path!}
                                    className={cn(
                                        'group flex items-center gap-3',
                                        'px-3 py-2 rounded',
                                        'transition-colors duration-150',
                                        isActive(item.path!)
                                            ? 'bg-secondary-500/90 text-white'
                                            : 'text-primary-100 hover:text-white hover:bg-primary-800'
                                    )}
                                >
                                    <Icon className="w-4 h-4 shrink-0" />
                                    <span className="text-sm font-medium">
                                        {item.label}
                                    </span>
                                </Link>
                            )}

                            {hasChildren && expanded && (
                                <div className="ml-7 space-y-1 mt-1">
                                    {item.path && (
                                        <Link
                                            to={item.path}
                                            className={cn(
                                                'group flex items-center gap-2',
                                                'px-3 py-1.5 rounded text-sm',
                                                'transition-colors duration-150',
                                                isActive(item.path)
                                                    ? 'bg-secondary-500/70 text-white'
                                                    : 'text-primary-200 hover:text-white hover:bg-primary-800/50'
                                            )}
                                        >
                                            <span>{item.label}</span>
                                        </Link>
                                    )}
                                    {item.children?.map((child) => {
                                        const ChildIcon = child.icon
                                        const childActive = isActive(child.path)

                                        return (
                                            <Link
                                                key={child.path}
                                                to={child.path}
                                                className={cn(
                                                    'group flex items-center gap-2',
                                                    'px-3 py-1.5 rounded text-sm',
                                                    'transition-colors duration-150',
                                                    childActive
                                                        ? 'bg-secondary-500/70 text-white'
                                                        : 'text-primary-200 hover:text-white hover:bg-primary-800/50'
                                                )}
                                            >
                                                <ChildIcon className="w-3.5 h-3.5 shrink-0" />
                                                <span>{child.label}</span>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </nav>
        </aside>
    )
}
