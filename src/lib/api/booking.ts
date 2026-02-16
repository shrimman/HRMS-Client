import apiClient from './client'
import type { GameSlotDto } from './game'

export interface SlotBookingDto {
  bookingId: number
  slotId: number
  slotDate: string
  slotStartDateTime: string
  slotEndDateTime: string
  gameId: number
  gameName: string
  slotMaxPlayers: number
  bookedByEmployeeId: number
  bookedByEmployeeName: string
  bookingStatusId: number
  bookingStatusName: string
  participantCount: number
  createdAt: string
  updatedAt: string
  updatedByEmployeeId: number
  participants: Array<{
    employeeId: number
    firstName: string
    lastName: string
  }>
}

export interface SlotParticipantDto {
  slotParticipantId: number
  bookingId: number
  employee: {
    employeeId: number
    firstName: string
    lastName: string
  }
  createdAt: string
}

export interface BookingStatus {
  bookingStatusId: number
  statusName: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  updatedByEmployee: {
    employeeId: number
    firstName: string
    lastName: string
  }
}

export interface BookSlotRequest {
  slotId: number
  participantIds: number[]
}

export interface AddParticipantRequest {
  participantEmployeeId: number
}

export const bookSlot = async (data: BookSlotRequest): Promise<SlotBookingDto> => {
  const response = await apiClient.post<SlotBookingDto>('/bookings', data)
  return response.data
}

export const getBookingById = async (bookingId: number): Promise<SlotBookingDto> => {
  const response = await apiClient.get<SlotBookingDto>(`/bookings/${bookingId}`)
  return response.data
}

export const cancelBooking = async (bookingId: number): Promise<void> => {
  await apiClient.delete(`/bookings/${bookingId}`)
}

export const getMyBookings = async (): Promise<SlotBookingDto[]> => {
  const response = await apiClient.get<SlotBookingDto[]>('/bookings/my-bookings')
  return response.data
}

export const getMyActiveBookings = async (): Promise<SlotBookingDto[]> => {
  const response = await apiClient.get<SlotBookingDto[]>('/bookings/my-bookings/active')
  return response.data
}

export const getMyBookingHistory = async (): Promise<SlotBookingDto[]> => {
  const response = await apiClient.get<SlotBookingDto[]>('/bookings/my-bookings/history')
  return response.data
}

export const getBookingsBySlot = async (slotId: number): Promise<SlotBookingDto[]> => {
  const response = await apiClient.get<SlotBookingDto[]>(`/bookings/slot/${slotId}`)
  return response.data
}

export const getAvailableSlots = async (): Promise<GameSlotDto[]> => {
  const response = await apiClient.get<GameSlotDto[]>('/bookings/available-slots')
  return response.data
}

export const getAvailableSlotsByGame = async (gameId: number): Promise<GameSlotDto[]> => {
  const response = await apiClient.get<GameSlotDto[]>(`/bookings/available-slots/game/${gameId}`)
  return response.data
}

export const getAvailableSlotsByDate = async (date: string): Promise<GameSlotDto[]> => {
  const response = await apiClient.get<GameSlotDto[]>('/bookings/available-slots/date', {
    params: { date }
  })
  return response.data
}

export const getAvailableSlotsByGameAndDate = async (gameId: number, date: string): Promise<GameSlotDto[]> => {
  const response = await apiClient.get<GameSlotDto[]>(`/bookings/available-slots/game/${gameId}/date`, {
    params: { date }
  })
  return response.data
}

export const addParticipant = async (bookingId: number, data: AddParticipantRequest): Promise<SlotParticipantDto> => {
  const response = await apiClient.post<SlotParticipantDto>(`/bookings/${bookingId}/participants`, data)
  return response.data
}

export const removeParticipant = async (participantId: number): Promise<void> => {
  await apiClient.delete(`/bookings/participants/${participantId}`)
}

export const getBookingParticipants = async (bookingId: number): Promise<SlotParticipantDto[]> => {
  const response = await apiClient.get<SlotParticipantDto[]>(`/bookings/${bookingId}/participants`)
  return response.data
}

export const getBookingStatuses = async (): Promise<BookingStatus[]> => {
  const response = await apiClient.get<BookingStatus[]>('/bookings/statuses')
  return response.data
}

export const checkBookingOnDate = async (date: string): Promise<boolean> => {
  const response = await apiClient.get<boolean>('/bookings/check-booking', {
    params: { date }
  })
  return response.data
}

export const checkParticipantOnDate = async (date: string): Promise<boolean> => {
  const response = await apiClient.get<boolean>('/bookings/check-participant', {
    params: { date }
  })
  return response.data
}
