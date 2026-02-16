import apiClient from './client'

export interface ReferralStatusDto {
  statusId: number
  statusName: string
  updatedAt: string
  updatedByEmployee: {
    employeeId: number
    firstName: string
    lastName: string
  }
}

export interface JobReferralDto {
  referralId: number
  jobOpening?: {
    jobId: number
    title: string
  }
  referrer: {
    employeeId: number
    firstName: string
    lastName: string
  }
  friendName: string
  friendEmail: string
  cvFilePath?: string
  note?: string
  referralStatus: {
    statusId: number
    statusName: string
  }
  createdAt: string
  updatedAt: string
  updatedByEmployee: {
    employeeId: number
    firstName: string
    lastName: string
  }
}

export interface CreateReferralRequest {
  jobId?: number
  friendName: string
  friendEmail: string
  note?: string
  cvFile?: File
}

export const createReferral = async (data: CreateReferralRequest): Promise<JobReferralDto> => {
  const formData = new FormData()
  if (data.jobId) formData.append('jobId', data.jobId.toString())
  formData.append('friendName', data.friendName)
  formData.append('friendEmail', data.friendEmail)
  if (data.note) formData.append('note', data.note)
  if (data.cvFile) formData.append('cvFile', data.cvFile)

  const response = await apiClient.post<JobReferralDto>('/referrals', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data;
}

export const getAllReferrals = async (): Promise<JobReferralDto[]> => {
  const response = await apiClient.get<JobReferralDto[]>('/referrals')
  return response.data
}

export const getReferralById = async (referralId: number): Promise<JobReferralDto> => {
  const response = await apiClient.get<JobReferralDto>(`/referrals/${referralId}`)
  return response.data
}

export const getMyReferrals = async (): Promise<JobReferralDto[]> => {
  const response = await apiClient.get<JobReferralDto[]>('/referrals/my-referrals')
  return response.data
}

export const getReferralsByJob = async (jobId: number): Promise<JobReferralDto[]> => {
  const response = await apiClient.get<JobReferralDto[]>(`/referrals/job/${jobId}`)
  return response.data
}

export const getReferralsByStatus = async (statusId: number): Promise<JobReferralDto[]> => {
  const response = await apiClient.get<JobReferralDto[]>(`/referrals/status/${statusId}`)
  return response.data
}

export const updateReferralStatus = async (referralId: number, statusId: number): Promise<JobReferralDto> => {
  const response = await apiClient.put<JobReferralDto>(`/referrals/${referralId}/status`, null, {
    params: { statusId }
  })
  return response.data
}

export const getReferralStatuses = async (): Promise<ReferralStatusDto[]> => {
  const response = await apiClient.get<ReferralStatusDto[]>('/referrals/statuses')
  return response.data
}

export const deleteReferral = async (referralId: number): Promise<void> => {
  await apiClient.delete(`/referrals/${referralId}`)
}
