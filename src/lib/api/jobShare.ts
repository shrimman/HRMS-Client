import apiClient from './client'

export interface JobShareLogDto {
  shareId: number
  jobOpening: {
    jobId: number
    title: string
  }
  sharedBy: {
    employeeId: number
    firstName: string
    lastName: string
  }
  recipientEmail: string
  sharedAt: string
}

export interface ShareJobRequest {
  recipientEmails: string[]
}

export const shareJob = async (jobId: number, data: ShareJobRequest): Promise<JobShareLogDto[]> => {
  const response = await apiClient.post<JobShareLogDto[]>(`/jobs/share/${jobId}`, data)
  return response.data
}

export const getJobShareLogs = async (jobId: number): Promise<JobShareLogDto[]> => {
  const response = await apiClient.get<JobShareLogDto[]>(`/jobs/share/job/${jobId}/logs`)
  return response.data
}

export const getMyShareHistory = async (): Promise<JobShareLogDto[]> => {
  const response = await apiClient.get<JobShareLogDto[]>('/jobs/share/my-history')
  return response.data
}
