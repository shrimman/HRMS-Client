import apiClient from './client'

export interface TravelDocumentDto {
  documentId: number
  travelPlanId: number
  travelPlanTitle: string
  employeeId: number
  employeeName: string
  documentTypeId: number
  documentTypeName: string
  documentName: string
  documentPath: string
  uploadedAt: string
  uploadedById: number
  uploadedByName: string
}

export interface UploadTravelDocumentRequest {
  travelPlanId: number
  employeeId: number
  documentTypeId: number
  documentName: string
  file: File
}

export const uploadDocument = async (data: UploadTravelDocumentRequest): Promise<TravelDocumentDto> => {
  const formData = new FormData()
  formData.append('travelPlanId', data.travelPlanId.toString())
  formData.append('employeeId', data.employeeId.toString())
  formData.append('documentTypeId', data.documentTypeId.toString())
  formData.append('documentName', data.documentName)
  formData.append('file', data.file)

  const response = await apiClient.post<TravelDocumentDto>('/travel-documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return response.data
}

export const getDocumentById = async (documentId: number): Promise<TravelDocumentDto> => {
  const response = await apiClient.get<TravelDocumentDto>(`/travel-documents/${documentId}`)
  return response.data
}

export const getDocumentsByTravel = async (travelId: number): Promise<TravelDocumentDto[]> => {
  const response = await apiClient.get<TravelDocumentDto[]>(`/travel-documents/travel/${travelId}`)
  return response.data
}

export const getDocumentsByTravelAndEmployee = async (travelId: number, employeeId: number): Promise<TravelDocumentDto[]> => {
  const response = await apiClient.get<TravelDocumentDto[]>(`/travel-documents/travel/${travelId}/employee/${employeeId}`)
  return response.data
}

export const getDocumentsByEmployee = async (employeeId: number): Promise<TravelDocumentDto[]> => {
  const response = await apiClient.get<TravelDocumentDto[]>(`/travel-documents/employee/${employeeId}`)
  return response.data
}

export const getDocumentsByManager = async (managerId: number): Promise<TravelDocumentDto[]> => {
  const response = await apiClient.get<TravelDocumentDto[]>(`/travel-documents/manager/${managerId}`)
  return response.data
}

export const getDocumentsByType = async (documentTypeId: number): Promise<TravelDocumentDto[]> => {
  const response = await apiClient.get<TravelDocumentDto[]>(`/travel-documents/type/${documentTypeId}`)
  return response.data
}

export const getDocumentsByTravelHR = async (travelId: number): Promise<TravelDocumentDto[]> => {
  const response = await apiClient.get<TravelDocumentDto[]>(`/travel-documents/travel/${travelId}/by-hr`)
  return response.data
}

export const getDocumentsByTravelEmployee = async (travelId: number, employeeId: number): Promise<TravelDocumentDto[]> => {
  const response = await apiClient.get<TravelDocumentDto[]>(`/travel-documents/travel/${travelId}/by-employee/${employeeId}`)
  return response.data
}

export const deleteDocument = async (documentId: number): Promise<void> => {
  await apiClient.delete(`/travel-documents/${documentId}`)
}
