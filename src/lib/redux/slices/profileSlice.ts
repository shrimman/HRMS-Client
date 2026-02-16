import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { EmployeeSummaryDto } from '@/lib/api/employee'

export interface ProfileState {
  profile: EmployeeSummaryDto | null
  loading: boolean
  error: string | null
}

const initialState: ProfileState = {
  profile: null,
  loading: false,
  error: null,
}

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    fetchProfileStart: (state) => {
      state.loading = true
      state.error = null
    },
    fetchProfileSuccess: (state, action: PayloadAction<EmployeeSummaryDto>) => {
      state.loading = false
      state.profile = action.payload
      state.error = null
    },
    fetchProfileError: (state, action: PayloadAction<string>) => {
      state.loading = false
      state.error = action.payload
    },
    clearProfileError: (state) => {
      state.error = null
    },
    updateProfileData: (state, action: PayloadAction<Partial<EmployeeSummaryDto>>) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload }
      }
    },
  },
})

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileError,
  clearProfileError,
  updateProfileData,
} = profileSlice.actions

export default profileSlice.reducer
