import apiClient from './client'
import type { JobOpeningDto } from './job'

export interface JobReviewerDto {
  reviewerId: number
  jobOpening: {
    jobId: number
    title: string
  }
  reviewer: {
    employeeId: number
    firstName: string
    lastName: string
  }
  assignedBy: {
    employeeId: number
    firstName: string
    lastName: string
  }
  assignedAt: string
  updatedAt: string
  updatedByEmployee: {
    employeeId: number
    firstName: string
    lastName: string
  }
}

export const assignReviewer = async (jobId: number, reviewerId: number): Promise<JobReviewerDto> => {
  const response = await apiClient.post<JobReviewerDto>('/reviewers/assign', null, {
    params: { jobId, reviewerId }
  })
  return response.data
}

export const removeReviewer = async (jobReviewerId: number): Promise<void> => {
  await apiClient.delete(`/reviewers/${jobReviewerId}`)
}

export const getReviewersByJob = async (jobId: number): Promise<JobReviewerDto[]> => {
  const response = await apiClient.get<JobReviewerDto[]>(`/reviewers/job/${jobId}`)
  return response.data
}

export const getMyReviewerJobs = async (): Promise<JobOpeningDto[]> => {
  const response = await apiClient.get<JobOpeningDto[]>('/reviewers/my-jobs')
  return response.data
}
