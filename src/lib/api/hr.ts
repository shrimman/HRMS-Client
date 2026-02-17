import apiClient from './client';
import type { EmployeeSummaryDto } from './employee';

export const getAllEmployees = async (): Promise<EmployeeSummaryDto[]> => {
  const response = await apiClient.get<EmployeeSummaryDto[]>('/hr/allemployees');
  return response.data;
}

export const getEmployeeById = async (id: number): Promise<EmployeeSummaryDto> => {
  const response = await apiClient.get<EmployeeSummaryDto>(`/hr/${id}`);
  return response.data;
}

export interface SearchEmployeeParams {
  query?: string
  department?: string
  designation?: string
  role?: string
}

export const searchEmployee = async (params: SearchEmployeeParams): Promise<EmployeeSummaryDto[]> => {
  const response = await apiClient.get<EmployeeSummaryDto[]>('/hr/searchEmployee', {
    params
  });
  return response.data;
}

export interface UpdateEmployeeProfileDto {
  dateOfJoining?: string
  managerId?: number
  departmentId?: number
  designationId?: number
  roleId?: number
  isActive?: boolean
}

export const updateEmployeeProfile = async (id: number, data: UpdateEmployeeProfileDto): Promise<EmployeeSummaryDto> => {
  const response = await apiClient.post<EmployeeSummaryDto>(`/hr/profile/${id}`, data);
  return response.data;
}
