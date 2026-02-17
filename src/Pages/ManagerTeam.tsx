import DirectReportsGrid from "@/components/DirectReportsGrid";
import type { EmployeeSummaryDto } from "@/lib/api/employee";
import { getMyTeam } from "@/lib/api/manager";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

function ManagerTeam() {

    const [myTeam, setMyTeam] = useState<EmployeeSummaryDto[]>([]);
    const navigate = useNavigate();
    const loadMyTeam = async () => {
        try {
            const response = await getMyTeam();
            setMyTeam(response);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load team members';
            toast.error(errorMessage);
        }
    }

    const handleEmployeeClick = (employee: EmployeeSummaryDto) => {
        toast(`Clicked on ${employee.firstName} ${employee.lastName}`);
        navigate(`/employee-directory/${employee.employeeId}`);
    }

    useEffect(() => {
        loadMyTeam();
    }, []);

    return (
        <>
        <h1 className="text-2xl font-bold mb-4">My Team</h1>
            <DirectReportsGrid directReports={myTeam}
                onEmployeeClick={handleEmployeeClick}
            />
        </>
    )
}
export default ManagerTeam;