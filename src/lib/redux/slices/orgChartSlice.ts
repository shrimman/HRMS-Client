import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { EmployeeSummaryDto } from '@/lib/api/employee'

interface OrgChartState {
  selectedEmployee: EmployeeSummaryDto | null
  managerChain: EmployeeSummaryDto[]
  directReports: EmployeeSummaryDto[]
  isLoading: boolean
  isError: boolean
  error: string | null
}

const initialState: OrgChartState = {
  selectedEmployee: null,
  managerChain: [],
  directReports: [],
  isLoading: false,
  isError: false,
  error: null
}

const orgChartSlice = createSlice({
  name: 'orgChart',
  initialState,
  reducers: {
    fetchOrgChartStart: (state) => {
      state.isLoading = true
      state.isError = false
      state.error = null
    },
    fetchOrgChartSuccess: (state, action: PayloadAction<{
      selectedEmployee: EmployeeSummaryDto
      managerChain: EmployeeSummaryDto[]
      directReports: EmployeeSummaryDto[]
    }>) => {
      state.isLoading = false
      state.selectedEmployee = action.payload.selectedEmployee
      state.managerChain = action.payload.managerChain
      state.directReports = action.payload.directReports
    },
    fetchOrgChartError: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.isError = true
      state.error = action.payload
    },
    clearError: (state) => {
      state.isError = false
      state.error = null
    }
  }
})

export const {
  fetchOrgChartStart,
  fetchOrgChartSuccess,
  fetchOrgChartError,
  clearError
} = orgChartSlice.actions

export default orgChartSlice.reducer
