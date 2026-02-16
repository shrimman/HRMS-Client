import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { updateProfile, uploadProfilePhoto, type EmployeeSummaryDto, type UpdateProfileRequest } from '@/lib/api/employee'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

const updateProfileSchema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().optional(),
    photoFile: z.instanceof(FileList).optional(),
})

type UpdateProfileFormData = z.infer<typeof updateProfileSchema>

interface UpdateProfileModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    profile: EmployeeSummaryDto
    onSuccess: (updatedProfile: EmployeeSummaryDto) => void
}

export default function UpdateProfileModal({
    open,
    onOpenChange,
    profile,
    onSuccess,
}: UpdateProfileModalProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<UpdateProfileFormData>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            firstName: profile.firstName,
            lastName: profile.lastName,
            dateOfBirth: profile.dateOfBirth || '',
        },
    })

    const handlePhotoChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0]
            const reader = new FileReader()
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const onSubmit = async (data: UpdateProfileFormData) => {
        setLoading(true)
        setError(null)

        try {
            let updatedProfile = profile

            if (data.photoFile && data.photoFile.length > 0) {
                updatedProfile = await uploadProfilePhoto(data.photoFile[0])
            }

            if (
                data.firstName !== profile.firstName ||
                data.lastName !== profile.lastName ||
                data.dateOfBirth !== profile.dateOfBirth
            ) {
                const updateData: UpdateProfileRequest = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                }

                if (data.dateOfBirth && data.dateOfBirth.trim() !== '') {
                    updateData.dateOfBirth = data.dateOfBirth
                }

                updatedProfile = await updateProfile(updateData)
            }

            onSuccess(updatedProfile)
            onOpenChange(false)
            reset()
            setPhotoPreview(null)
        } catch (err) {
            const errorMessage =
                err instanceof AxiosError
                    ? err.response?.data?.message || 'Failed to update profile'
                    : 'Failed to update profile'
            setError(errorMessage)
        } finally {
            setLoading(false)
            toast.success('Profile updated successfully')
        }
    }

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            reset()
            setPhotoPreview(null)
            setError(null)
        }
        onOpenChange(newOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className={cn('sm:max-w-md')}>
                <DialogHeader>
                    <DialogTitle>Update Profile</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-4')}>
                    {error && (
                        <div className={cn('rounded-lg bg-red-100 p-3 text-sm text-red-700')}>
                            {error}
                        </div>
                    )}

                    <div className={cn('space-y-2')}>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                            id="firstName"
                            placeholder="First Name"
                            {...register('firstName')}
                            disabled={loading}
                        />
                        {errors.firstName && (
                            <p className={cn('text-sm text-red-600')}>{errors.firstName.message}</p>
                        )}
                    </div>

                    <div className={cn('space-y-2')}>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                            id="lastName"
                            placeholder="Last Name"
                            {...register('lastName')}
                            disabled={loading}
                        />
                        {errors.lastName && (
                            <p className={cn('text-sm text-red-600')}>{errors.lastName.message}</p>
                        )}
                    </div>

                    <div className={cn('space-y-2')}>
                        <Label htmlFor="dateOfBirth">Date of Birth</Label>
                        <Input
                            id="dateOfBirth"
                            type="date"
                            {...register('dateOfBirth')}
                            disabled={loading}
                        />
                    </div>

                    <div className={cn('space-y-2')}>
                        <Label htmlFor="photoFile">Profile Photo</Label>
                        {photoPreview && (
                            <div className={cn('mb-3')}>
                                <img
                                    src={photoPreview}
                                    alt="Photo preview"
                                    className={cn('h-32 w-32 rounded-full object-cover border-2 border-primary-200')}
                                />
                            </div>
                        )}
                        <Input
                            id="photoFile"
                            type="file"
                            accept="image/*"
                            {...register('photoFile')}
                            onChange={(e) => handlePhotoChange(e.target.files)}
                            disabled={loading}
                        />
                    </div>

                    <DialogFooter className={cn('mt-6')}>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? (
                                <>
                                    <Spinner className={cn('mr-2 size-4')} />
                                    Updating...
                                </>
                            ) : (
                                'Update'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
