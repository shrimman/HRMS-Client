import apiClient from './client'
import type { EmployeeSummaryDto } from './employee'

export interface TravelPlanDto {
  travelPlanId: number
  title: string
  description?: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  createdBy: {
    employeeId: number
    firstName: string
    lastName: string
  }
  employees: EmployeeSummaryDto[]
}

export interface CreateTravelPlanRequest {
  title: string
  description?: string
  startDate: string
  endDate: string
  employeeIds: number[]
}

export interface UpdateTravelPlanRequest {
  title: string
  description?: string
  startDate: string
  endDate: string
  employeeIds: number[]
}

export const createTravelPlan = async (data: CreateTravelPlanRequest): Promise<TravelPlanDto> => {
  const response = await apiClient.post<TravelPlanDto>('/travels', data)
  return response.data
}

export const getTravelPlanById = async (travelId: number): Promise<TravelPlanDto> => {
  const response = await apiClient.get<TravelPlanDto>(`/travels/${travelId}`)
  return response.data
}

export const updateTravelPlan = async (travelId: number, data: UpdateTravelPlanRequest): Promise<TravelPlanDto> => {
  const response = await apiClient.put<TravelPlanDto>(`/travels/${travelId}`, data)
  return response.data
}

export const deleteTravelPlan = async (travelId: number): Promise<void> => {
  await apiClient.delete(`/travels/${travelId}`)
}

export const getAllTravelPlans = async (): Promise<TravelPlanDto[]> => {
  const response = await apiClient.get<TravelPlanDto[]>('/travels')
  return response.data
}

export const getMyTravels = async (): Promise<TravelPlanDto[]> => {
  const response = await apiClient.get<TravelPlanDto[]>('/travels/my-travels')
  return response.data
}

export const getCreatedByMe = async (): Promise<TravelPlanDto[]> => {
  const response = await apiClient.get<TravelPlanDto[]>('/travels/created-by-me')
  return response.data
}

export const getTravelEmployees = async (travelId: number): Promise<EmployeeSummaryDto[]> => {
  const response = await apiClient.get<EmployeeSummaryDto[]>(`/travels/${travelId}/employees`)
  return response.data
}

export const addEmployeeToTravel = async (travelId: number, employeeId: number): Promise<void> => {
  await apiClient.post(`/travels/${travelId}/employees/${employeeId}`)
}

export const removeEmployeeFromTravel = async (travelId: number, employeeId: number): Promise<void> => {
  await apiClient.delete(`/travels/${travelId}/employees/${employeeId}`)
}

export const canSubmitExpense = async (travelId: number): Promise<boolean> => {
  const response = await apiClient.get<boolean>(`/travels/${travelId}/can-submit-expense`)
  return response.data
}
