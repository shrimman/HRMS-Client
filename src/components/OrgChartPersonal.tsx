import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { getOrgChart } from '@/lib/api/employee'
import { getFileUrl } from '@/lib/api/file'
import { Spinner } from './ui/spinner'

interface OrgChartPersonalProps {
    employeeId: number
}

export default function OrgChartPersonal({ employeeId }: OrgChartPersonalProps) {
    const [selected, setSelected] = useState<EmployeeSummaryDto | null>(null)
    const [managers, setManagers] = useState<EmployeeSummaryDto[]>([])
    const [reports, setReports] = useState<EmployeeSummaryDto[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            try {
                const res = await getOrgChart(employeeId)
                setSelected(res.selectedEmployee)
                setManagers(res.managerChain ?? [])
                setReports(res.directReports ?? [])
            } catch (err) {
                console.error('Failed to load org chart', err)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [employeeId])

    const renderCard = (emp?: EmployeeSummaryDto, highlight?: boolean) => {
        if (!emp) return null
        const photoUrl = emp.photoPath
            ? (() => {
                const parts = emp.photoPath.split('/')
                if (parts.length >= 2) {
                    const category = parts[0]
                    const filename = parts.slice(1).join('/')
                    return getFileUrl(category, filename)
                }
                return undefined
            })()
            : undefined

        return (
            <Card
                key={emp.employeeId}
                className={cn(
                    'w-full max-w-md mx-auto',
                    'border-gray-200',
                    highlight ? 'ring-2 ring-primary-300' : ''
                )}
            >
                <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                        {photoUrl ? (
                            <img src={photoUrl} alt={`${emp.firstName} ${emp.lastName}`} className="w-12 h-12 rounded-full object-cover border" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-primary-400 flex items-center justify-center text-white font-bold">{emp.firstName?.charAt(0)}</div>
                        )}

                        <div>
                            <div className="font-semibold text-sm truncate">{emp.firstName} {emp.lastName}</div>
                            <div className="text-xs text-muted-foreground truncate">{emp.designation?.designationName ?? emp.role?.roleName}</div>
                            <p className='bg-green-100 text-green-700 border-green-300 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border'>
                                {emp.department?.departmentName}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <Spinner className={cn("bg-primary-400")} />
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center space-y-6">
            <div className="flex flex-col items-center space-y-4">
                {managers.map((m) => (
                    <div key={m.employeeId} className="w-full">
                        {renderCard(m)}
                        <div className="flex justify-center mt-3">
                            <div className="bg-background rounded-full p-1">
                                <ArrowDown className="text-primary-500" size={20} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>
                ))}

                <div className="w-full">
                    {renderCard(selected ?? undefined, true)}
                    <div className="flex justify-center mt-3">
                        <div className="bg-background rounded-full p-1">
                            <ArrowDown className="text-primary-500 animate-bounce" size={20} strokeWidth={2.5} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full space-y-3">
                {reports.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center">No direct reports</div>
                ) : (
                    reports.map((r) => (
                        <div key={r.employeeId} className="w-full">
                            {renderCard(r)}
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
