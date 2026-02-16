import apiClient from './client'

export interface GameDto {
  gameId: number
  gameName: string
  createdAt: string
  updatedAt: string
  updatedByEmployeeId: number
}

export interface GameConfigDto {
  configId: number
  gameId: number
  gameName: string
  gameDuration: number
  maxPlayers: number
  startTime: string
  endTime: string
  createdAt: string
  updatedAt: string
  updatedByEmployeeId: number
}

export interface GameSlotDto {
  slotId: number
  gameId: number
  gameName: string
  slotDate: string
  startDateTime: string
  endDateTime: string
  maxPlayers: number
  currentParticipants: number
  availableSpots: number
  slotStatusId: number
  slotStatusName: string
  createdAt: string
  updatedAt: string
  updatedByEmployeeId: number
}

export interface SlotStatus {
  slotStatusId: number
  statusName: string
  description: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  updatedByEmployee: {
    employeeId: number
    firstName: string
    lastName: string
  }
}

export interface CreateGameRequest {
  gameName: string
}

export interface UpdateGameRequest {
  gameName: string
}

export interface CreateGameConfigRequest {
  gameId: number
  gameDuration: number
  maxPlayers: number
  startTime: string
  endTime: string
}

export interface UpdateGameConfigRequest {
  gameDuration: number
  maxPlayers: number
  startTime: string
  endTime: string
}

export interface GenerateSlotsRequest {
  startDate: string
  endDate: string
}

export interface UpdateSlotRequest {
  maxPlayers?: number
  slotStatusId?: number
}

export const createGame = async (data: CreateGameRequest): Promise<GameDto> => {
  const response = await apiClient.post<GameDto>('/games', data)
  return response.data
}

export const getAllGames = async (): Promise<GameDto[]> => {
  const response = await apiClient.get<GameDto[]>('/games')
  return response.data
}

export const getGameById = async (gameId: number): Promise<GameDto> => {
  const response = await apiClient.get<GameDto>(`/games/${gameId}`)
  return response.data
}

export const updateGame = async (gameId: number, data: UpdateGameRequest): Promise<GameDto> => {
  const response = await apiClient.put<GameDto>(`/games/${gameId}`, data)
  return response.data
}

export const deleteGame = async (gameId: number): Promise<void> => {
  await apiClient.delete(`/games/${gameId}`)
}

export const createGameConfig = async (data: CreateGameConfigRequest): Promise<GameConfigDto> => {
  const response = await apiClient.post<GameConfigDto>(`/games/${data.gameId}/config`, data)
  return response.data
}

export const getAllGameConfigs = async (): Promise<GameConfigDto[]> => {
  const response = await apiClient.get<GameConfigDto[]>('/games/configs')
  return response.data
}

export const getGameConfigById = async (configId: number): Promise<GameConfigDto> => {
  const response = await apiClient.get<GameConfigDto>(`/games/configs/${configId}`)
  return response.data
}

export const getGameConfigByGameId = async (gameId: number): Promise<GameConfigDto> => {
  const response = await apiClient.get<GameConfigDto>(`/games/${gameId}/config`)
  return response.data
}

export const updateGameConfig = async (configId: number, data: UpdateGameConfigRequest): Promise<GameConfigDto> => {
  const response = await apiClient.put<GameConfigDto>(`/games/configs/${configId}`, data)
  return response.data
}

export const deleteGameConfig = async (configId: number): Promise<void> => {
  await apiClient.delete(`/games/configs/${configId}`)
}

export const generateSlots = async (gameId: number, data: GenerateSlotsRequest): Promise<GameSlotDto[]> => {
  const response = await apiClient.post<GameSlotDto[]>(`/games/${gameId}/slots/generate`, data)
  return response.data
}

export const getSlotById = async (slotId: number): Promise<GameSlotDto> => {
  const response = await apiClient.get<GameSlotDto>(`/games/slots/${slotId}`)
  return response.data
}

export const updateSlot = async (slotId: number, data: UpdateSlotRequest): Promise<GameSlotDto> => {
  const response = await apiClient.put<GameSlotDto>(`/games/slots/${slotId}`, data)
  return response.data
}

export const deleteSlot = async (slotId: number): Promise<void> => {
  await apiClient.delete(`/games/slots/${slotId}`)
}

export const getSlotsByGame = async (gameId: number): Promise<GameSlotDto[]> => {
  const response = await apiClient.get<GameSlotDto[]>(`/games/${gameId}/slots`)
  return response.data
}

export const getSlotsByDateRange = async (startDate: string, endDate: string): Promise<GameSlotDto[]> => {
  const response = await apiClient.get<GameSlotDto[]>('/games/slots', {
    params: { startDate, endDate }
  })
  return response.data
}

export const getSlotsByGameAndDate = async (gameId: number, slotsdate: string): Promise<GameSlotDto[]> => {
  const response = await apiClient.get<GameSlotDto[]>(`/games/${gameId}/slots/date`, {
    params: { slotsdate }
  })
  return response.data
}

export const getSlotStatuses = async (): Promise<SlotStatus[]> => {
  const response = await apiClient.get<SlotStatus[]>('/games/slots/statuses')
  return response.data
}
