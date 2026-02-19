import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { getCurrentUser } from '@/lib/api/auth/auth'

export type UserRole = 'Employee' | 'HR' | 'Manager'

export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  dateOfBirth?: string
  roleName: UserRole
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  authChecked: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  authChecked: false,
  error: null,
}

export const checkAuth = createAsyncThunk('auth/checkAuth', async () => {
  const user = await getCurrentUser()
  return user
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },

    loginSuccess: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user
      state.isAuthenticated = true
      state.loading = false
      state.authChecked = true
      state.error = null
    },

    signupSuccess: (state) => {
      state.loading = false
      state.error = null
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
    },

    clearError: (state) => {
      state.error = null
    },

    logout: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      state.authChecked = true
      state.error = null
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
        state.loading = false
        state.authChecked = true
      })
      .addCase(checkAuth.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.loading = false
        state.authChecked = true
      })
  },
})

export const {
  setLoading,
  loginSuccess,
  signupSuccess,
  setError,
  clearError,
  logout,
  updateUser,
} = authSlice.actions

export default authSlice.reducer
