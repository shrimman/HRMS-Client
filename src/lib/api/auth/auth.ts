import apiClient from '../client'
import type { User, UserRole } from '@/lib/redux/slices/authSlice'

export interface LoginRequest {
    email: string
    password: string
}

export interface SignupRequest {
    firstName: string
    lastName: string
    email: string
    password: string
    dateOfBirth: string
    dateOfJoining: string
    roleName: UserRole
}

interface AuthApiUser {
    id?: string
    employeeId?: string
    firstName: string
    lastName: string
    email: string
    roleName: string
}

interface AuthApiResponse {
    success: boolean
    message: string
    user: AuthApiUser
}

const normalizeRole = (roleName: string): UserRole => {
    const normalized = roleName.trim().toLowerCase()
    if (normalized === 'employee') return 'Employee'
    if (normalized === 'manager') return 'Manager'
    if (normalized === 'hr') return 'HR'
    return 'Employee'
}

const toUser = (payload: AuthApiUser): User => {
    const source = payload
    return {
        id: source.id ?? source.employeeId ?? '',
        firstName: source.firstName,
        lastName: source.lastName,
        email: source.email,
        roleName: normalizeRole(source.roleName),
    }
}

export const login = async (credentials: LoginRequest): Promise<User> => {
    const response = await apiClient.post<AuthApiResponse>('/auth/login', credentials);
    return toUser(response.data.user);
}

export const signup = async (data: SignupRequest): Promise<User> => {
    const response = await apiClient.post<AuthApiResponse>('/auth/signup', data);
    return toUser(response.data.user);
}

export const logout = async (): Promise<void> => {
    await apiClient.post('/auth/logout');
}

export const getCurrentUser = async (): Promise<User> => {
    const response = await apiClient.get<AuthApiResponse>('/auth/me');
    return toUser(response.data.user);
}
