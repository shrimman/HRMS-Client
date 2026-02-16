// import { getDepartments, getDesignations, type EmployeeSummaryDto } from '@/lib/api/employee'
// import { useState } from 'react'
// import { toast } from 'sonner'

// function UpdateEmployeeProfileHR() {
//     // This Page will be user by HR to update employee profiles, including changing their manager, department, and designation. Only those fields will be editable. Departments and designations will be loaded from the backend. Manager selection will be done through a searchable dropdown that lists all employees. 
//     const [selectedDepartment, setSelectedDepartment] = useState<string>('')
//     const [selectedDesignation, setSelectedDesignation] = useState<string>('')
//     const [isLoading, setIsLoading] = useState(false)
//     const [managers, setManagers] = useState<EmployeeSummaryDto[]>([])
//     const [departments, setDepartments] = useState<string[]>([])
//     const [designations, setDesignations] = useState<string[]>([])

//     const loadInitialData = async () => {
//         setIsLoading(true)
//         try {
//             const [deptList, desigList] = await Promise.all([
//                 getDepartments(),
//                 getDesignations()
//             ])

//             setDepartments(deptList)
//             setDesignations(desigList)
//         } catch (error) {
//             toast.error('Failed to load employees')
//             console.error('Error loading employees:', error)
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     return (
//         <div>UpdateEmployeeProfileHR</div>
//     )
// }

// export default UpdateEmployeeProfileHR
