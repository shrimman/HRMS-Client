import apiClient from './client'

export interface JobOpeningDto {
  jobId: number
  title: string
  summary?: string
  jdFilePath?: string
  isActive: boolean
  jobHROwnerId?: number
  postedAt: string
  updatedAt: string
  updatedByEmployee: {
    employeeId: number
    firstName: string
    lastName: string
  }
}

export interface CreateJobRequest {
  title: string
  summary?: string
  jobHROwnerId?: number
  jdFile?: File
}

export interface UpdateJobRequest {
  title?: string
  summary?: string
  jobHROwnerId?: number
  jdFile?: File
}

export const getAllJobs = async (): Promise<JobOpeningDto[]> => {
  const response = await apiClient.get<JobOpeningDto[]>('/jobs')
  return response.data
}

export const getActiveJobs = async (): Promise<JobOpeningDto[]> => {
  const response = await apiClient.get<JobOpeningDto[]>('/jobs/active')
  return response.data
}

export const getJobById = async (jobId: number): Promise<JobOpeningDto> => {
  const response = await apiClient.get<JobOpeningDto>(`/jobs/${jobId}`)
  return response.data
}

export const createJob = async (data: CreateJobRequest): Promise<JobOpeningDto> => {
  const formData = new FormData()
  formData.append('title', data.title)
  if (data.summary) formData.append('summary', data.summary)
  if (data.jobHROwnerId) formData.append('jobHROwnerId', data.jobHROwnerId.toString())
  if (data.jdFile) formData.append('jdFile', data.jdFile)

  const response = await apiClient.post<JobOpeningDto>('/jobs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const updateJob = async (jobId: number, data: UpdateJobRequest): Promise<JobOpeningDto> => {
  const formData = new FormData()
  if (data.title) formData.append('title', data.title)
  if (data.summary) formData.append('summary', data.summary)
  if (data.jobHROwnerId) formData.append('jobHROwnerId', data.jobHROwnerId.toString())
  if (data.jdFile) formData.append('jdFile', data.jdFile)

  const response = await apiClient.put<JobOpeningDto>(`/jobs/${jobId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const deactivateJob = async (jobId: number): Promise<void> => {
  await apiClient.patch(`/jobs/${jobId}/deactivate`)
}

export const activateJob = async (jobId: number): Promise<void> => {
  await apiClient.patch(`/jobs/${jobId}/activate`)
}
