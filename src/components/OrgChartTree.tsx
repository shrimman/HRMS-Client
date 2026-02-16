import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, User, Mail, Building2, Briefcase, Users } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { EmployeeSummaryDto } from '@/lib/api/employee'
import { getAllEmployees } from '@/lib/api/hr'
import { getFileUrl } from '@/lib/api/file'

interface TreeNodeData extends EmployeeSummaryDto {
  children?: TreeNodeData[]
  isExpanded?: boolean
  isLoading?: boolean
}

interface OrgChartTreeProps {
  rootEmployee: EmployeeSummaryDto
  onEmployeeClick?: (employee: EmployeeSummaryDto) => void
}

interface TreeNodeProps {
  employee: TreeNodeData
  level: number
  onEmployeeClick?: (employee: EmployeeSummaryDto) => void
  onToggle: (employeeId: number) => void
}

function TreeNode({ employee, level, onEmployeeClick, onToggle }: TreeNodeProps) {
  const hasChildren = employee.children && employee.children.length > 0
  const photoUrl = employee.photoPath
    ? (() => {
      const parts = employee.photoPath.split('/')
      if (parts.length >= 2) {
        const category = parts[0]
        const filename = parts.slice(1).join('/')
        return getFileUrl(category, filename)
      }
      return undefined
    })()
    : undefined

  return (
    <div className="relative">
      {level > 0 && (
        <>
          <div
            className="absolute left-0 top-0 w-6 h-6 border-l-2 border-b-2 border-gray-300 rounded-bl-lg"
            style={{ marginLeft: `${(level - 1) * 2.5}rem` }}
          />
        </>
      )}

      <Collapsible
        open={employee.isExpanded}
        onOpenChange={() => onToggle(employee.employeeId)}
      >
        <div
          className={cn(
            "flex items-start gap-3 group",
            level > 0 && "ml-10"
          )}
        >
          {hasChildren && (
            <CollapsibleTrigger asChild>
              <button
                className="shrink-0 w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center mt-3 transition-colors"
                aria-label={employee.isExpanded ? "Collapse" : "Expand"}
              >
                {employee.isLoading ? (
                  <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                ) : employee.isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                )}
              </button>
            </CollapsibleTrigger>
          )}

          <Card
            className={cn(
              "flex-1 transition-all duration-200 cursor-pointer hover:shadow-md hover:border-primary-300",
              !hasChildren && "ml-6"
            )}
            onClick={() => onEmployeeClick?.(employee)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={`${employee.firstName} ${employee.lastName}`}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                  ) : null}
                  <div className={cn(
                    "w-16 h-16 rounded-full bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center",
                    photoUrl && "hidden"
                  )}>
                    <User className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {employee.firstName} {employee.lastName}
                  </h4>

                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span className="truncate">{employee.email}</span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {employee.designation && (
                      <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        <Briefcase className="w-3 h-3" />
                        <span>{employee.designation.designationName}</span>
                      </div>
                    )}
                    {employee.department && (
                      <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        <Building2 className="w-3 h-3" />
                        <span>{employee.department.departmentName}</span>
                      </div>
                    )}
                    {employee.role && (
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                        {employee.role.roleName}
                      </span>
                    )}
                  </div>

                  {hasChildren && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{employee.children!.length} direct report{employee.children!.length !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {hasChildren && (
          <CollapsibleContent className="mt-4 space-y-4">
            {employee.children!.map((child) => (
              <TreeNode
                key={child.employeeId}
                employee={child}
                level={level + 1}
                onEmployeeClick={onEmployeeClick}
                onToggle={onToggle}
              />
            ))}
          </CollapsibleContent>
        )}
      </Collapsible>
    </div>
  )
}

export default function OrgChartTree({ rootEmployee, onEmployeeClick }: OrgChartTreeProps) {
  const [treeData, setTreeData] = useState<TreeNodeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initializeTree = async () => {
      setIsLoading(true)
      try {
        const allEmployees = await getAllEmployees()

        const employeeMap = new Map<number, TreeNodeData>()
        allEmployees.forEach(emp => {
          employeeMap.set(emp.employeeId, {
            ...emp,
            children: [],
            isExpanded: false
          })
        })

        const roots: TreeNodeData[] = []

        allEmployees.forEach(emp => {
          const node = employeeMap.get(emp.employeeId)!
          if (emp.managerId && employeeMap.has(emp.managerId)) {
            const parent = employeeMap.get(emp.managerId)!
            parent.children = parent.children || []
            parent.children.push(node)
          } else {
            roots.push(node)
          }
        })

        const expandPathToEmployee = (node: TreeNodeData, targetId: number): boolean => {
          if (node.employeeId === targetId) {
            node.isExpanded = true
            return true
          }

          if (node.children) {
            for (const child of node.children) {
              if (expandPathToEmployee(child, targetId)) {
                node.isExpanded = true
                return true
              }
            }
          }

          return false
        }

        if (roots.length > 0) {
          const root = roots[0]
          root.isExpanded = true
          expandPathToEmployee(root, rootEmployee.employeeId)
          setTreeData(root)
        } else {
          setTreeData({
            ...rootEmployee,
            children: [],
            isExpanded: true
          })
        }
      } catch (error) {
        console.error('Failed to initialize tree:', error)
        setTreeData({
          ...rootEmployee,
          children: [],
          isExpanded: true
        })
      } finally {
        setIsLoading(false)
      }
    }

    initializeTree()
  }, [rootEmployee])

  const handleToggle = (employeeId: number) => {
    if (!treeData) return

    const toggleNode = (node: TreeNodeData): TreeNodeData => {
      if (node.employeeId === employeeId) {
        return { ...node, isExpanded: !node.isExpanded }
      }

      if (node.children) {
        return {
          ...node,
          children: node.children.map(toggleNode)
        }
      }

      return node
    }

    setTreeData(toggleNode(treeData))
  }

  if (isLoading || !treeData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Complete Organization Hierarchy</h3>
        <p className="text-sm text-gray-500">Full org chart from top to bottom</p>
      </div>

      <div className="relative">
        <TreeNode
          employee={treeData}
          level={0}
          onEmployeeClick={onEmployeeClick}
          onToggle={handleToggle}
        />
      </div>
    </div>
  )
}
