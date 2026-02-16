import apiClient from './client'

export interface AchievementPostDto {
  postId: number
  title: string
  description: string
  createdAt: string
  updatedAt: string
  isSystemGenerated: boolean
  author: {
    employeeId: number
    firstName: string
    lastName: string
  }
  likeCount: number
  commentCount: number
  isLikedByCurrentUser: boolean
}

export interface CreatePostRequest {
  title: string
  description: string
}

export interface UpdatePostRequest {
  title: string
  description: string
}

export interface ModerationRequest {
  moderationTypeId: number
  reason: string
}

export interface AchievementLikeDto {
  likeId: number
  postId: number
  employee: {
    employeeId: number
    firstName: string
    lastName: string
  }
  createdAt: string
}

export interface AchievementCommentDto {
  commentId: number
  postId: number
  author: {
    employeeId: number
    firstName: string
    lastName: string
  }
  text: string
  createdAt: string
  updatedAt: string
}

export interface CreateCommentRequest {
  postId: number
  text: string
}

export interface UpdateCommentRequest {
  text: string
}

export const getFeed = async (): Promise<AchievementPostDto[]> => {
  const response = await apiClient.get<AchievementPostDto[]>('/achievements/feed')
  return response.data
}

export const getPostById = async (postId: number): Promise<AchievementPostDto> => {
  const response = await apiClient.get<AchievementPostDto>(`/achievements/posts/${postId}`)
  return response.data
}

export const getMyPosts = async (): Promise<AchievementPostDto[]> => {
  const response = await apiClient.get<AchievementPostDto[]>('/achievements/my-posts')
  return response.data
}

export const getSystemPosts = async (): Promise<AchievementPostDto[]> => {
  const response = await apiClient.get<AchievementPostDto[]>('/achievements/system-posts')
  return response.data
}

export const createPost = async (data: CreatePostRequest): Promise<AchievementPostDto> => {
  const response = await apiClient.post<AchievementPostDto>('/achievements/posts', data)
  return response.data
}

export const updatePost = async (postId: number, data: UpdatePostRequest): Promise<AchievementPostDto> => {
  const response = await apiClient.put<AchievementPostDto>(`/achievements/posts/${postId}`, data)
  return response.data
}

export const deletePost = async (postId: number): Promise<void> => {
  await apiClient.delete(`/achievements/posts/${postId}`)
}

export const moderateDeletePost = async (postId: number, data: ModerationRequest): Promise<void> => {
  await apiClient.delete(`/achievements/posts/${postId}/moderate`, { data })
}

export const likePost = async (postId: number): Promise<AchievementLikeDto> => {
  const response = await apiClient.post<AchievementLikeDto>(`/achievements/posts/${postId}/like`)
  return response.data
}

export const unlikePost = async (postId: number): Promise<void> => {
  await apiClient.delete(`/achievements/posts/${postId}/like`)
}

export const isPostLiked = async (postId: number): Promise<boolean> => {
  const response = await apiClient.get<boolean>(`/achievements/posts/${postId}/liked`)
  return response.data
}

export const getLikeCount = async (postId: number): Promise<number> => {
  const response = await apiClient.get<number>(`/achievements/posts/${postId}/likes/count`)
  return response.data
}

export const getPostLikes = async (postId: number): Promise<AchievementLikeDto[]> => {
  const response = await apiClient.get<AchievementLikeDto[]>(`/achievements/posts/${postId}/likes`)
  return response.data
}

export const createComment = async (data: CreateCommentRequest): Promise<AchievementCommentDto> => {
  const response = await apiClient.post<AchievementCommentDto>('/achievements/comments', data)
  return response.data
}

export const updateComment = async (commentId: number, data: UpdateCommentRequest): Promise<AchievementCommentDto> => {
  const response = await apiClient.put<AchievementCommentDto>(`/achievements/comments/${commentId}`, data)
  return response.data
}

export const deleteComment = async (commentId: number): Promise<void> => {
  await apiClient.delete(`/achievements/comments/${commentId}`)
}

export const moderateDeleteComment = async (commentId: number, data: ModerationRequest): Promise<void> => {
  await apiClient.delete(`/achievements/comments/${commentId}/moderate`, { data })
}

export const getCommentCount = async (postId: number): Promise<number> => {
  const response = await apiClient.get<number>(`/achievements/posts/${postId}/comments/count`)
  return response.data
}

export const getPostComments = async (postId: number): Promise<AchievementCommentDto[]> => {
  const response = await apiClient.get<AchievementCommentDto[]>(`/achievements/posts/${postId}/comments`)
  return response.data
}

export const searchPosts = async (keyword: string): Promise<AchievementPostDto[]> => {
  const response = await apiClient.get<AchievementPostDto[]>('/achievements/search', {
    params: { keyword }
  })
  return response.data
}

export const getPostsByAuthor = async (authorId: number): Promise<AchievementPostDto[]> => {
  const response = await apiClient.get<AchievementPostDto[]>(`/achievements/posts/author/${authorId}`)
  return response.data
}

export const getPostsByDateRange = async (startDate: string, endDate: string): Promise<AchievementPostDto[]> => {
  const response = await apiClient.get<AchievementPostDto[]>('/achievements/posts/filter/date-range', {
    params: { startDate, endDate }
  })
  return response.data
}
