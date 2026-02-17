import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { getFileUrl } from '@/lib/api/file'
import { getJobById, type JobOpeningDto } from '@/lib/api/job'
import { getReferralsByJob, getReferralStatuses, updateReferralStatus, type JobReferralDto, type ReferralStatusDto } from '@/lib/api/jobReferral'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'

export default function HrJobReferralsPage() {
  const { jobId } = useParams()
  const [job, setJob] = useState<JobOpeningDto | null>(null)
  const [referrals, setReferrals] = useState<JobReferralDto[]>([])
  const [statuses, setStatuses] = useState<ReferralStatusDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  const loadData = async () => {
    if (!jobId) return
    setIsLoading(true)
    setErrorMessage('')
    try {
      const [jobData, referralData, statusData] = await Promise.all([
        getJobById(Number(jobId)),
        getReferralsByJob(Number(jobId)),
        getReferralStatuses(),
      ])
      setJob(jobData)
      setReferrals(referralData)
      setStatuses(statusData)
    } catch (error) {
      toast.error('Failed to load referrals')
      console.error('Error loading referrals:', error)
      setErrorMessage('Failed to load referrals. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [jobId])

  const handleStatusChange = async (referralId: number, statusId: number) => {
    try {
      const updated = await updateReferralStatus(referralId, statusId)
      setReferrals((prev) =>
        prev.map((referral) => referral.referralId === updated.referralId ? updated : referral)
      )
      toast.success('Referral status updated')
    } catch (error) {
      toast.error('Failed to update referral status')
      console.error('Error updating referral status:', error)
    }
  }

  const getCvUrl = (path?: string) => {
    if (!path) return null
    const parts = path.split('/')
    if (parts.length >= 2) {
      const category = parts[0]
      const filename = parts.slice(1).join('/')
      return getFileUrl(category, filename)
    }
    return getFileUrl('referrals', path)
  }

  return (
    <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
      <div className={cn('max-w-6xl mx-auto space-y-6')}>
        <div className={cn('space-y-1')}>
          <h1 className={cn('text-3xl font-semibold text-foreground')}>
            Referrals for {job?.title ?? 'Job Opening'}
          </h1>
          <p className={cn('text-muted-foreground')}>
            Review referrals and update their status.
          </p>
        </div>

        {isLoading ? (
          <div className={cn('flex items-center justify-center py-12 text-muted-foreground gap-2')}>
            <Spinner className="size-5" />
            <span>Loading referrals...</span>
          </div>
        ) : errorMessage ? (
          <Card className={cn('border-destructive/30 bg-destructive/5')}>
            <CardContent className={cn('py-6 text-center text-destructive')}>
              {errorMessage}
            </CardContent>
          </Card>
        ) : referrals.length === 0 ? (
          <Card className={cn('border-dashed')}>
            <CardContent className={cn('py-10 text-center text-muted-foreground')}>
              No referrals found for this job opening.
            </CardContent>
          </Card>
        ) : (
          <div className={cn('space-y-4')}>
            {referrals.map((referral) => (
              <Card key={referral.referralId} className={cn('border')}>
                <CardHeader className={cn('pb-2')}>
                  <div className={cn('flex flex-wrap items-start justify-between gap-3')}>
                    <div className={cn('space-y-1')}>
                      <CardTitle className={cn('text-xl font-semibold text-foreground')}>
                        {referral.friendName}
                      </CardTitle>
                      <p className={cn('text-sm text-muted-foreground')}>
                        Referral ID: {referral.referralId}
                      </p>
                    </div>
                    <div className={cn('min-w-45')}>
                      <Select
                        value={String(referral.referralStatus.statusId)}
                        onValueChange={(value) => handleStatusChange(referral.referralId, Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Update status' />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((status) => (
                            <SelectItem key={status.statusId} value={String(status.statusId)}>
                              {status.statusName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className={cn('grid gap-4 text-sm')}>
                  <div className={cn('flex flex-wrap items-center gap-3 text-muted-foreground')}>
                    <span>Created {new Date(referral.createdAt).toLocaleDateString()}</span>
                    <span>Updated {new Date(referral.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <div className={cn('grid gap-3 md:grid-cols-2')}>
                    <div>
                      <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                        Candidate Email
                      </p>
                      <p className={cn('mt-1 text-sm font-semibold text-foreground')}>
                        {referral.friendEmail}
                      </p>
                    </div>
                    <div>
                      <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                        Referrer
                      </p>
                      <p className={cn('mt-1 text-sm font-semibold text-foreground')}>
                        {referral.referrer.firstName} {referral.referrer.lastName}
                      </p>
                      <p className={cn('text-sm text-muted-foreground')}>
                        Employee ID: {referral.referrer.employeeId}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                      Note
                    </p>
                    <p className={cn('mt-1 text-sm text-foreground')}>
                      {referral.note || 'No note provided.'}
                    </p>
                  </div>
                  <div className={cn('grid gap-3 md:grid-cols-2')}>
                    <div>
                      <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                        CV File
                      </p>
                      {getCvUrl(referral.cvFilePath) ? (
                        <a
                          href={getCvUrl(referral.cvFilePath)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn('mt-1 inline-flex text-sm font-semibold text-primary-700 underline decoration-primary-300 underline-offset-4 hover:text-primary-800')}
                        >
                          View CV
                        </a>
                      ) : (
                        <p className={cn('mt-1 text-sm text-muted-foreground')}>
                          No CV uploaded.
                        </p>
                      )}
                    </div>
                    <div>
                      <p className={cn('text-xs font-semibold uppercase tracking-wide text-muted-foreground')}>
                        Last Updated By
                      </p>
                      <p className={cn('mt-1 text-sm font-semibold text-foreground')}>
                        {referral.updatedByEmployee.firstName} {referral.updatedByEmployee.lastName}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
