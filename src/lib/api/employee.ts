import apiClient from './client';

export interface EmployeeSummaryDto {
  employeeId: number
  firstName: string
  lastName: string
  email: string
  role: { roleId: number; roleName: string }
  managerId?: number
  managerName?: string
  department?: { departmentId: number; departmentName: string }
  designation?: { designationId: number; designationName: string }
  active: boolean
  photoPath?: string
  dateOfBirth?: string
  dateOfJoining?: string
};

export interface OrgChartResponseDto {
  selectedEmployee: EmployeeSummaryDto
  managerChain: EmployeeSummaryDto[]
  directReports: EmployeeSummaryDto[]
};

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  dateOfBirth?: string
};

export const getProfile = async (): Promise<EmployeeSummaryDto> => {
  const response = await apiClient.get<EmployeeSummaryDto>('/employees/profile');
  return response.data;
};

export const getOrgChart = async (id: number): Promise<OrgChartResponseDto> => {
  const response = await apiClient.get<OrgChartResponseDto>(`/employees/orgchart/${id}`);
  return response.data;
};

export const updateProfile = async (data: UpdateProfileRequest): Promise<EmployeeSummaryDto> => {
  const response = await apiClient.post<EmployeeSummaryDto>('/employees/profile', data);
  return response.data;
};

export const getEmployeesByDepartment = async (department: string): Promise<EmployeeSummaryDto[]> => {
  const response = await apiClient.get<EmployeeSummaryDto[]>('/employees/department', {
    params: { department }
  });
  return response.data;
};

export const getEmployeesByDesignation = async (designation: string): Promise<EmployeeSummaryDto[]> => {
  const response = await apiClient.get<EmployeeSummaryDto[]>('/employees/designation', {
    params: { designation }
  });
  return response.data;
};

export const uploadProfilePhoto = async (file: File): Promise<EmployeeSummaryDto> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiClient.post<EmployeeSummaryDto>('/employees/profile/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const deleteProfilePhoto = async (): Promise<EmployeeSummaryDto> => {
  const response = await apiClient.delete<EmployeeSummaryDto>('/employees/profile/photo');
  return response.data;
};

export const getDepartments = async (): Promise<string[]> => {
  const response = await apiClient.get<string[]>('/employees/departments');
  return response.data;
};

export const getDesignations = async (): Promise<string[]> => {
  const response = await apiClient.get<string[]>('/employees/designations');
  return response.data;
};
