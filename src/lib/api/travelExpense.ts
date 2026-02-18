import apiClient from './client'
import type { EmployeeSummaryDto } from './employee'

export interface ExpenseReceiptDto {
  expenseReceiptId: number
  fileName: string
  receiptPath: string
  uploadedAt: string
  updatedAt: string
  updatedByEmployee: {
    employeeId: number
    firstName: string
    lastName: string
  }
}

export interface TravelExpenseDto {
  expenseId: number
  travelPlanId: number
  travelPlanTitle: string
  expenseTypeId: number
  expenseTypeName: string
  amount: number
  expenseDate: string
  submittedAt?: string
  updatedAt: string
  hrRemarks?: string
  approvalStatusId: number
  approvalStatusName: string
  hrActionBy?: {
    employeeId: number
    firstName: string
    lastName: string
  }
  submittedBy: {
    employeeId: number
    firstName: string
    lastName: string
  }
  receipts: ExpenseReceiptDto[]
  participants: EmployeeSummaryDto[]
}

export interface CreateTravelExpenseRequest {
  travelPlanId: number
  expenseTypeId: number
  amount: number
  expenseDate: string
}

export interface UpdateTravelExpenseRequest {
  expenseTypeId: number
  amount: number
  expenseDate: string
}

export interface ApproveExpenseRequest {
  remarks?: string
}

export interface ExpenseFilterRequest {
  employeeId?: number
  travelPlanId?: number
  statusId?: number
  startDate?: string
  endDate?: string
  expenseTypeId?: number
}

export interface ExpenseStatusTypeDto {
  id: number
  name: string
}

export interface ExpenseTypeDto {
  id: number
  name: string
}

export const createExpense = async (data: CreateTravelExpenseRequest): Promise<TravelExpenseDto> => {
  const response = await apiClient.post<TravelExpenseDto>('/travel-expenses', data)
  return response.data
}

export const updateExpense = async (expenseId: number, data: UpdateTravelExpenseRequest): Promise<TravelExpenseDto> => {
  const response = await apiClient.put<TravelExpenseDto>(`/travel-expenses/${expenseId}`, data)
  return response.data
}

export const submitExpense = async (expenseId: number): Promise<TravelExpenseDto> => {
  const response = await apiClient.post<TravelExpenseDto>(`/travel-expenses/${expenseId}/submit`)
  return response.data
}

export const getExpenseById = async (expenseId: number): Promise<TravelExpenseDto> => {
  const response = await apiClient.get<TravelExpenseDto>(`/travel-expenses/${expenseId}`)
  return response.data
}

export const getExpensesByTravel = async (travelId: number): Promise<TravelExpenseDto[]> => {
  const response = await apiClient.get<TravelExpenseDto[]>(`/travel-expenses/travel/${travelId}`)
  return response.data
}

export const getMyExpenses = async (): Promise<TravelExpenseDto[]> => {
  const response = await apiClient.get<TravelExpenseDto[]>('/travel-expenses/my-expenses')
  return response.data
}

export const getExpensesByStatus = async (statusId: number): Promise<TravelExpenseDto[]> => {
  const response = await apiClient.get<TravelExpenseDto[]>(`/travel-expenses/status/${statusId}`)
  return response.data
}

export const getExpensesByDateRange = async (startDate: string, endDate: string): Promise<TravelExpenseDto[]> => {
  const response = await apiClient.get<TravelExpenseDto[]>('/travel-expenses/date-range', {
    params: { startDate, endDate }
  })
  return response.data
}

export const filterExpenses = async (filter: ExpenseFilterRequest): Promise<TravelExpenseDto[]> => {
  const response = await apiClient.post<TravelExpenseDto[]>('/travel-expenses/filter', filter)
  return response.data
}

export const getTravelTotal = async (travelId: number): Promise<number> => {
  const response = await apiClient.get<number>(`/travel-expenses/travel/${travelId}/total`)
  return response.data
}

export const getTravelEmployeeTotal = async (travelId: number, employeeId: number): Promise<number> => {
  const response = await apiClient.get<number>(`/travel-expenses/travel/${travelId}/employee/${employeeId}/total`)
  return response.data
}

export const approveExpense = async (expenseId: number, data: ApproveExpenseRequest): Promise<TravelExpenseDto> => {
  const response = await apiClient.post<TravelExpenseDto>(`/travel-expenses/${expenseId}/approve`, data)
  return response.data
}

export const rejectExpense = async (expenseId: number, data: ApproveExpenseRequest): Promise<TravelExpenseDto> => {
  const response = await apiClient.post<TravelExpenseDto>(`/travel-expenses/${expenseId}/reject`, data)
  return response.data
}

export const approveExpenseByManager = async (expenseId: number, data: ApproveExpenseRequest): Promise<TravelExpenseDto> => {
  const response = await apiClient.post<TravelExpenseDto>(`/travel-expenses/${expenseId}/approve-by-manager`, data)
  return response.data
}

export const rejectExpenseByManager = async (expenseId: number, data: ApproveExpenseRequest): Promise<TravelExpenseDto> => {
  const response = await apiClient.post<TravelExpenseDto>(`/travel-expenses/${expenseId}/reject-by-manager`, data)
  return response.data
}

export const getPendingManagerApprovals = async (): Promise<TravelExpenseDto[]> => {
  const response = await apiClient.get<TravelExpenseDto[]>('/travel-expenses/manager/pending')
  return response.data
}

export const deleteExpense = async (expenseId: number): Promise<void> => {
  console.log("delete expense id : ", expenseId);

  await apiClient.delete(`/travel-expenses/${expenseId}`)
}

export const uploadReceipt = async (expenseId: number, file: File, fileName?: string): Promise<ExpenseReceiptDto> => {
  const formData = new FormData()
  formData.append('file', file)
  if (fileName) {
    formData.append('fileName', fileName)
  }
  const response = await apiClient.post<ExpenseReceiptDto>(
    `/travel-expenses/${expenseId}/receipts/upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  )
  return response.data
}

export const getExpenseReceipts = async (expenseId: number): Promise<ExpenseReceiptDto[]> => {
  const response = await apiClient.get<ExpenseReceiptDto[]>(`/travel-expenses/${expenseId}/receipts`)
  return response.data
}

export const deleteReceipt = async (receiptId: number): Promise<void> => {
  await apiClient.delete(`/travel-expenses/receipts/${receiptId}`)
}

export const addParticipant = async (expenseId: number, participantId: number): Promise<void> => {
  await apiClient.post(`/travel-expenses/${expenseId}/participants/${participantId}`)
}

export const removeParticipant = async (expenseId: number, participantId: number): Promise<void> => {
  console.log(expenseId, participantId);
  await apiClient.delete(`/travel-expenses/${expenseId}/participants/${participantId}`)
}

export const getExpenseParticipants = async (expenseId: number): Promise<EmployeeSummaryDto[]> => {
  const response = await apiClient.get<EmployeeSummaryDto[]>(`/travel-expenses/${expenseId}/participants`)
  return response.data
}

export const getExpenseStatusTypes = async (): Promise<ExpenseStatusTypeDto[]> => {
  const response = await apiClient.get<ExpenseStatusTypeDto[]>('/travel-expenses/status-types')
  return response.data
}

export const getExpenseTypes = async (): Promise<ExpenseTypeDto[]> => {
  const response = await apiClient.get<ExpenseTypeDto[]>('/travel-expenses/expense-types')
  return response.data
}