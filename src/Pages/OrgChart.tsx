import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchOrgChartStart, fetchOrgChartSuccess, fetchOrgChartError, clearError } from '@/lib/redux/slices/orgChartSlice'
import { getOrgChart, type EmployeeSummaryDto } from '@/lib/api/employee'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Loader2, Network, LayoutGrid } from 'lucide-react'
import OrgChartSearch from '@/components/OrgChartSearch'
import ManagerChainBreadcrumb from '@/components/ManagerChainBreadcrumb'
import DirectReportsGrid from '@/components/DirectReportsGrid'
import OrgChartTree from '@/components/OrgChartTree'

function OrgChart() {
  const dispatch = useAppDispatch()
  const { selectedEmployee, managerChain, directReports, isLoading, isError, error } = useAppSelector(
    (state) => state.orgChart
  )
  const [viewMode, setViewMode] = useState<'grid' | 'tree'>('tree')

  useEffect(() => {
    if (isError && error) {
      toast.error(error)
      dispatch(clearError());
    }
  }, [isError, error, dispatch])

  const handleSelectEmployee = async (employee: EmployeeSummaryDto) => {
    try {
      dispatch(fetchOrgChartStart())
      const response = await getOrgChart(employee.employeeId);

      dispatch(fetchOrgChartSuccess({
        selectedEmployee: response.selectedEmployee,
        managerChain: response.managerChain,
        directReports: response.directReports
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load organizational chart'
      dispatch(fetchOrgChartError(errorMessage))
    }
  }

  const handleNodeClick = (employee: EmployeeSummaryDto) => {
    handleSelectEmployee(employee)
  }

  return (
    <div className='space-y-6'>
      <Card className={cn('border-primary-200')}>
        <CardHeader>
          <CardTitle className={cn('text-primary-600')}>
            Organisation Chart
          </CardTitle>
          <CardDescription>
            Find and view the organizational structure of employees
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-6'>
            <div>
              <h3 className='text-sm font-semibold text-gray-700 mb-3'>
                Search Employee
              </h3>
              <OrgChartSearch
                onSelectEmployee={handleSelectEmployee}
                selectedEmployeeId={selectedEmployee?.employeeId}
              />
            </div>

            {isLoading && (
              <div className='flex items-center justify-center py-12'>
                <Loader2 className='w-8 h-8 animate-spin text-primary-600' />
              </div>
            )}

            {!isLoading && selectedEmployee && (
              <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-sm font-semibold text-gray-700'>
                    View Mode
                  </h3>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => setViewMode('tree')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                        viewMode === 'tree'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      <Network className='w-4 h-4' />
                      Tree View
                    </button>
                    <button
                      onClick={() => setViewMode('grid')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors',
                        viewMode === 'grid'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      )}
                    >
                      <LayoutGrid className='w-4 h-4' />
                      Grid View
                    </button>
                  </div>
                </div>

                {viewMode === 'tree' ? (
                  <OrgChartTree
                    rootEmployee={selectedEmployee}
                    onEmployeeClick={handleNodeClick}
                  />
                ) : (
                  <>
                    <Card className='bg-linear-to-br from-blue-50 to-indigo-50 border-blue-200'>
                      <CardContent className='pt-6'>
                        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                          <div className='flex-1'>
                            <h4 className='text-lg font-semibold text-gray-900'>
                              {selectedEmployee.firstName} {selectedEmployee.lastName}
                            </h4>
                            <p className='text-sm text-gray-600'>
                              {selectedEmployee.email}
                            </p>
                            <div className='mt-2 flex flex-wrap gap-2'>
                              {selectedEmployee.designation && (
                                <span className='inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full'>
                                  {selectedEmployee.designation.designationName}
                                </span>
                              )}
                              {selectedEmployee.role && (
                                <span className='inline-block px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full'>
                                  {selectedEmployee.role.roleName}
                                </span>
                              )}
                              {selectedEmployee.department && (
                                <span className='inline-block px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full'>
                                  {selectedEmployee.department.departmentName}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <ManagerChainBreadcrumb
                      managerChain={managerChain}
                      selectedEmployee={selectedEmployee}
                      onNodeClick={handleNodeClick}
                    />

                    <DirectReportsGrid
                      directReports={directReports}
                      onEmployeeClick={handleNodeClick}
                    />
                  </>
                )}
              </div>
            )}

            {!isLoading && !selectedEmployee && (
              <div className='flex items-center justify-center py-12 bg-gray-50 rounded-lg'>
                <p className='text-gray-600'>
                  Select an employee to view their organizational structure
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OrgChart;