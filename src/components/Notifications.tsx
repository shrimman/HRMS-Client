import { getUnreadNotifications, markAsRead, markAllAsRead, type NotificationDto } from "@/lib/api/notification";
import { cn } from "@/lib/utils"
import { Check, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

type Props = {
    onMarked?: () => void
}

function Notifications({ onMarked }: Props) {
    const [isLoading, setIsLoading] = useState(false)
    const [markingIds, setMarkingIds] = useState<number[]>([])
    const [notifications, setNotifications] = useState<NotificationDto[]>([])

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })

    const formatTime = (dateString: string) =>
        new Date(dateString).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
        })

    const loadNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getUnreadNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to load notifications", error);
        } finally {
            setIsLoading(false);
        }
    }, [])

    useEffect(() => {
        loadNotifications()
    }, [loadNotifications])


    const markAsReadHandler = useCallback(async (id: number) => {
        setMarkingIds((s) => [...s, id])
        try {
            await markAsRead(id);
            setNotifications((prev) => prev.filter((n) => n.notificationId !== id));
            onMarked?.()
        } catch (error) {
            console.error("Failed to mark notification as read", error);
        } finally {
            setMarkingIds((s) => s.filter((i) => i !== id))
        }
    }, [onMarked])

    const markAllHandler = useCallback(async () => {
        if (notifications.length === 0) return
        setIsLoading(true)
        try {
            await markAllAsRead();
            setNotifications([])
            onMarked?.()
        } catch (error) {
            console.error('Failed to mark all as read', error)
        } finally {
            setIsLoading(false)
        }
    }, [notifications.length, onMarked])


    return (
        <>
            {isLoading ? (
                <div className='flex items-center justify-center py-8 px-6'>
                    <Loader2 className='animate-spin h-6 w-6 text-gray-400' />
                </div>
            ) : (

                <div className={cn('absolute right-0 top-full mt-2 w-96 rounded-lg z-50')}>
                    <div className={cn('bg-linear-to-b from-white to-slate-50 border border-slate-200 rounded-lg shadow-lg py-2 ring-1 ring-primary-50')}>
                        <div className="flex items-center justify-between px-4 pb-2">
                            <p className="text-sm font-semibold text-slate-900">Notifications</p>
                            <div className="flex items-center gap-2">
                                {notifications.length > 0 && (
                                    <button onClick={markAllHandler} className="text-sm text-white bg-primary-600 hover:bg-primary-700 px-3 py-1 rounded-md shadow-sm">
                                        Mark all as read
                                    </button>
                                )}
                                <button onClick={loadNotifications} className="text-sm text-slate-600 hover:bg-slate-100 px-2 py-1 rounded">Refresh</button>
                            </div>
                        </div>

                        <div className="max-h-80 overflow-y-auto px-3">
                            {notifications.length === 0 ? (
                                <div className={cn('text-slate-500 py-8 flex items-center justify-center')}>
                                    <p className="text-sm">No new notifications</p>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {notifications.map((notification) => (
                                        <div key={notification.notificationId} className={cn('flex items-start justify-between gap-3 py-3')}>
                                            <div className="flex items-start gap-3 w-full">
                                                <div className="w-1.5 h-12 rounded-full bg-linear-to-b from-primary-500 to-primary-300 mt-1 mr-2" />
                                                <div className="flex-1 pr-2">
                                                    <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                                                    <p className="text-xs text-slate-500 mt-1">• {formatDate(notification.createdAt)} {formatTime(notification.createdAt)}</p>
                                                    <p className="mt-2 text-sm text-slate-700">{notification.message}</p>
                                                </div>
                                            </div>

                                            <div className="shrink-0 pl-2">
                                                {markingIds.includes(notification.notificationId) ? (
                                                    <Loader2 className='animate-spin h-5 w-5 text-slate-400' />
                                                ) : (
                                                    <button aria-label="Mark as read" onClick={() => markAsReadHandler(notification.notificationId)} className="p-1 rounded-md hover:bg-slate-100">
                                                        <Check className="h-5 w-5 text-primary-600" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Notifications