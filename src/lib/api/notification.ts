import apiClient from './client'

export interface NotificationDto {
  notificationId: number
  employeeId: number
  employeeName: string
  title: string
  message: string
  notificationType: string
  relatedEntityId?: number
  isRead: boolean
  createdAt: string
}

export const getAllNotifications = async (page: number, size: number): Promise<NotificationDto[]> => {
  const response = await apiClient.get<NotificationDto[]>('/notifications/all', {
    params: { page, size }
  })
  return response.data
}

export const getUnreadNotifications = async (): Promise<NotificationDto[]> => {
  const response = await apiClient.get<NotificationDto[]>('/notifications/unread')
  return response.data
}

export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<number>('/notifications/unread/count')
  return response.data
}

export const markAsRead = async (id: number): Promise<void> => {
  await apiClient.patch(`/notifications/${id}/read`)
}

export const markAllAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all')
}

export const deleteNotification = async (id: number): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`)
}
