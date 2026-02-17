import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import type { EmployeeSummaryDto } from '@/lib/api/employee';
import { getFileUrl } from '@/lib/api/file';
import { useUserRole } from '@/lib/redux';
import { cn } from '@/lib/utils'
import { useLoaderData } from 'react-router-dom';

function EmployeeProfile() {

    const role = useUserRole();
    const profile = useLoaderData() as EmployeeSummaryDto;

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

    return (
        <>

            <Card className={cn('mb-8 border-primary-200')}>
                <CardHeader>
                    <CardTitle className={cn('text-primary-600')}>Employee Profile</CardTitle>
                    <CardDescription>
                        account information and role
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className={cn('flex items-center gap-6 p-4')}>
                        <img
                            src={getProfilePhotoUrl(profile.photoPath) || 'https://png.pngtree.com/png-vector/20220901/ourmid/pngtree-company-employee-avatar-icon-wearing-a-suit-png-image_6133899.png'}
                            alt={`${profile.firstName} ${profile.lastName}`}
                            className={cn('w-32 h-32 rounded-full object-cover border-4 border-primary-200')}
                            onError={(e) => {
                                e.currentTarget.src = 'https://png.pngtree.com/png-vector/20220901/ourmid/pngtree-company-employee-avatar-icon-wearing-a-suit-png-image_6133899.png'
                            }}
                        />
                    </div>
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

                        {
                            (role === 'HR') ?
                                <>
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
                                    
                                    <div>
                                        <p className={cn('text-sm font-medium text-muted-foreground')}>
                                            Status
                                        </p>
                                        <span className={cn(
                                            'inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold',
                                            profile.active
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-700'
                                        )}>
                                            {profile.active ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                </>
                                :
                                null

                        }
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

                    </div>

                </CardContent>
            </Card>
        </>
    )
}

export default EmployeeProfile  