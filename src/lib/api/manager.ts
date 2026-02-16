import apiClient from './client'
import type { EmployeeSummaryDto } from './employee'

export const getMyTeam = async (): Promise<EmployeeSummaryDto[]> => {
  const response = await apiClient.get<EmployeeSummaryDto[]>('/managers/myTeam')
  return response.data
}
