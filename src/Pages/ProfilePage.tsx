import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAppDispatch, useAppSelector } from '@/lib/redux/hooks'
import { fetchProfileStart, fetchProfileSuccess, fetchProfileError } from '@/lib/redux/slices/profileSlice'
import { getProfile, type EmployeeSummaryDto } from '@/lib/api/employee'
import { getFileUrl } from '@/lib/api/file'
import { Spinner } from '@/components/ui/spinner'
import UpdateProfileModal from '@/components/UpdateProfileModal'
import { AxiosError } from 'axios'

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const { profile, loading, error } = useAppSelector((state) => state.profile)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      dispatch(fetchProfileStart());
      try {
        const data = await getProfile();
        dispatch(fetchProfileSuccess(data));
      } catch (err) {
        const errorMessage = err instanceof AxiosError
          ? err.response?.data?.message || 'Failed to fetch profile'
          : 'Failed to fetch profile';
        dispatch(fetchProfileError(errorMessage));
      }
    }

    fetchData();
  }, [dispatch])

  const handleProfileUpdate = (updatedProfile: EmployeeSummaryDto) => {
    dispatch(fetchProfileSuccess(updatedProfile))
    setIsModalOpen(false)
  }

  const getProfilePhotoUrl = (photoPath: string | undefined): string | null => {
    if (!photoPath) return null;

    const parts = photoPath.split('/');

    if (parts.length >= 2) {
      const category = parts[0];
      const filename = parts.slice(1).join('/');
      return getFileUrl(category, filename);
    } else {
      return getFileUrl('profile-photos', photoPath);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner className="size-8" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>No profile data available</p>
      </div>
    )
  }

  return (
    <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
      <div className={cn('max-w-6xl mx-auto')}>
        <h1 className={cn('text-4xl font-bold text-foreground mb-2')}>
          Profile
        </h1>

        {profile.photoPath && (
          <Card className={cn('mb-6 border-primary-200')}>
            <CardContent className={cn('pt-6')}>
              <div className={cn('flex items-center gap-6')}>
                <img
                  src={getProfilePhotoUrl(profile.photoPath) || 'https://png.pngtree.com/png-vector/20220901/ourmid/pngtree-company-employee-avatar-icon-wearing-a-suit-png-image_6133899.png'}
                  alt={`${profile.firstName} ${profile.lastName}`}
                  className={cn('w-32 h-32 rounded-full object-cover border-4 border-primary-200')}
                  onError={(e) => {
                    e.currentTarget.src = 'https://png.pngtree.com/png-vector/20220901/ourmid/pngtree-company-employee-avatar-icon-wearing-a-suit-png-image_6133899.png'
                  }}
                />
                <div>
                  <h2 className={cn('text-2xl font-bold text-foreground')}>
                    {profile.firstName} {profile.lastName}
                  </h2>
                  <p className={cn('text-muted-foreground mt-1')}>{profile.role.roleName}</p>
                  <p className={cn('text-sm text-muted-foreground mt-1')}>{profile.email}</p>

                  <span className={cn(
                    'inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold',
                    profile.active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  )}>
                    {profile.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

            </CardContent>
          </Card>
        )}

        <Card className={cn('mb-8 border-primary-200')}>
          <CardHeader>
            <CardTitle className={cn('text-primary-600')}>Your Profile</CardTitle>
            <CardDescription>
              Your account information and role permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn('grid grid-cols-1 md:grid-cols-2 gap-6')}>
              <div>
                <p className={cn('text-sm font-medium text-muted-foreground')}>
                  First Name
                </p>
                <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                  {profile.firstName}
                </p>
              </div>

              <div>
                <p className={cn('text-sm font-medium text-muted-foreground')}>
                  Last Name
                </p>
                <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                  {profile.lastName}
                </p>
              </div>

              <div>
                <p className={cn('text-sm font-medium text-muted-foreground')}>
                  Email
                </p>
                <p className={cn('text-lg font-semibold text-foreground mt-1')}>
                  {profile.email}
                </p>
              </div>

              <div>
                <p className={cn('text-sm font-medium text-muted-foreground')}>
                  Employee ID
                </p>
                <p className={cn('text-lg font-semibold text-foreground mt-1 font-mono')}>
                  {profile.employeeId}
                </p>
              </div>

              <div>
                <p className={cn('text-sm font-medium text-muted-foreground')}>
                  Role
                </p>
                <span className={cn(
                  'inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold',
                  'bg-primary-100 text-primary-700'
                )}>
                  {profile.role.roleName}
                </span>
              </div>

              <div>
                <p className={cn('text-sm font-medium text-muted-foreground')}>
                  Manager
                </p>
                <span className={cn(
                  'inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold',
                  profile.managerName
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                )}>
                  {profile.managerName || 'Not assigned'}
                </span>
              </div>
              <div>
                <p className={cn('text-sm font-medium text-muted-foreground')}>
                  Department
                </p>
                <span className={cn(
                  'inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold',
                  profile.department
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                )}>
                  {profile.department ? profile.department.departmentName : 'Not assigned'}
                </span>
              </div>

              <div>
                <p className={cn('text-sm font-medium text-muted-foreground')}>
                  Designation
                </p>
                <span className={cn(
                  'inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold',
                  profile.designation
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                )}>
                  {profile.designation ? profile.designation.designationName : 'Not assigned'}
                </span>
              </div>


              <div>
                <p className={cn('text-sm font-medium text-muted-foreground')}>
                  Date of Birth
                </p>
                <p className={cn('text-lg font-semibold mt-1',
                  profile.dateOfBirth ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {profile.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    : 'Not assigned'}
                </p>
              </div>

              <div>
                <p className={cn('text-sm font-medium text-muted-foreground')}>
                  Date of Joining
                </p>
                <p className={cn('text-lg font-semibold mt-1',
                  profile.dateOfJoining ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {profile.dateOfJoining
                    ? new Date(profile.dateOfJoining).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                    : 'Not assigned'}
                </p>
              </div>
            </div>



            <div className={cn('mt-8 flex gap-3')}>
              <Button onClick={() => setIsModalOpen(true)}>
                Update Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <UpdateProfileModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          profile={profile}
          onSuccess={handleProfileUpdate}
        />
      </div>
    </div>
  )
}
