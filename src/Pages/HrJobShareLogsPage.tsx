import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'
import { getAllJobs, type JobOpeningDto } from '@/lib/api/job'
import { getJobShareLogs, type JobShareLogDto } from '@/lib/api/jobShare'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function HrJobShareLogsPage() {
  const [jobs, setJobs] = useState<JobOpeningDto[]>([])
  const [logs, setLogs] = useState<JobShareLogDto[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [isLogsLoading, setIsLogsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const loadJobs = async () => {
    setIsLoading(true)
    setErrorMessage('')
    try {
      const data = await getAllJobs()
      setJobs(data)
      if (data.length > 0) {
        setSelectedJobId(String(data[0].jobId))
      }
    } catch (error) {
      toast.error('Failed to load jobs')
      console.error('Error loading jobs:', error)
      setErrorMessage('Failed to load jobs. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadLogs = async (jobId: number) => {
    setIsLogsLoading(true)
    try {
      const data = await getJobShareLogs(jobId)
      setLogs(data)
    } catch (error) {
      toast.error('Failed to load share logs')
      console.error('Error loading share logs:', error)
    } finally {
      setIsLogsLoading(false)
    }
  }

  useEffect(() => {
    loadJobs()
  }, [])

  useEffect(() => {
    if (selectedJobId) {
      loadLogs(Number(selectedJobId))
    }
  }, [selectedJobId])

  return (
    <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
      <div className={cn('max-w-6xl mx-auto space-y-6')}>
        <div className={cn('space-y-1')}>
          <h1 className={cn('text-3xl font-semibold text-foreground')}>
            Job Share Logs
          </h1>
          <p className={cn('text-muted-foreground')}>
            Review job shares across openings and recipients.
          </p>
        </div>

        {isLoading ? (
          <div className={cn('flex items-center justify-center py-12 text-muted-foreground gap-2')}>
            <Spinner className="size-5" />
            <span>Loading jobs...</span>
          </div>
        ) : errorMessage ? (
          <Card className={cn('border-destructive/30 bg-destructive/5')}>
            <CardContent className={cn('py-6 text-center text-destructive')}>
              {errorMessage}
            </CardContent>
          </Card>
        ) : (
          <Card className={cn('border')}>
            <CardHeader>
              <CardTitle className={cn('text-xl font-semibold text-foreground')}>
                Select Job Opening
              </CardTitle>
            </CardHeader>
            <CardContent className={cn('space-y-4')}>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder='Select job' />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.jobId} value={String(job.jobId)}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {isLogsLoading ? (
                <div className={cn('flex items-center justify-center py-8 text-muted-foreground gap-2')}>
                  <Spinner className="size-4" />
                  <span>Loading share logs...</span>
                </div>
              ) : logs.length === 0 ? (
                <div className={cn('rounded-lg border border-dashed p-6 text-center text-muted-foreground')}>
                  No share logs found for this job opening.
                </div>
              ) : (
                <div className={cn('space-y-3')}> 
                  {logs.map((log) => (
                    <div key={log.shareId} className={cn('rounded-lg border p-4 text-sm')}>
                      <div className={cn('flex flex-wrap items-center justify-between gap-2')}>
                        <span className={cn('font-semibold text-foreground')}>
                          {log.recipientEmail}
                        </span>
                        <span className={cn('text-muted-foreground')}>
                          {new Date(log.sharedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={cn('mt-2 text-muted-foreground')}>
                        Shared by {log.sharedBy.firstName} {log.sharedBy.lastName} (ID {log.sharedBy.employeeId})
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
