import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { getMyTravels, type TravelPlanDto } from "@/lib/api/travel"
import { cn } from "@/lib/utils"
import { User } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

function TravelHistory() {

    const navigate = useNavigate();
    const [myTravels, setMyTravels] = useState<TravelPlanDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [errorMessage, setErrorMessage] = useState('')

    const fetchMyTravels = async () => {
        try {
            setIsLoading(true)
            setErrorMessage('')
            const response = await getMyTravels();
            setMyTravels(response);
            toast.success('Travel history loaded successfully')
        } catch (error) {
            console.error('Error fetching travel history:', error);
            toast.error('Failed to load travel history')
            setErrorMessage('Failed to load travel history. Please try again later.')
        }
        finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchMyTravels();
    }, []);


    const handleRowClick = (travelId: number) => {
        // Navigate to travel details page
        navigate(`/travel/${travelId}`);
    }


    return (
        <div className={cn('flex-1 overflow-auto p-8 bg-background')}>
            <div className={cn('max-w-6xl mx-auto space-y-6')}>
                <Card className={cn('border')}>
                    <CardHeader>
                        <CardTitle className={cn('text-2xl font-semibold text-foreground')}>My Travel Plans</CardTitle>
                        <CardDescription>
                            View your travel assignments and open travel details.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className={cn('flex items-center justify-center py-10 text-muted-foreground gap-2')}>
                                <Spinner className="size-5" />
                                <span>Loading travel plans...</span>
                            </div>
                        ) : errorMessage ? (
                            <div className={cn('rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive')}>
                                {errorMessage}
                            </div>
                        ) : (
                            <div className='rounded-md border'>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className='w-16'></TableHead>
                                            <TableHead>Title</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Start Date</TableHead>
                                            <TableHead>End Date</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {myTravels.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={7} className='text-center py-8 text-muted-foreground'>
                                                    No travel plans assigned yet.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            myTravels.map((travel) =>
                                                <TableRow
                                                    key={travel.travelId}
                                                    className='hover:bg-muted/40 cursor-pointer'
                                                    onClick={() => handleRowClick(travel.travelId)}
                                                >
                                                    <TableCell>
                                                        <User className='h-5 w-5 text-muted-foreground' />
                                                    </TableCell>
                                                    <TableCell className='font-medium'>{travel.title}</TableCell>
                                                    <TableCell>{travel.description || 'No description'}</TableCell>
                                                    <TableCell>{new Date(travel.startDate).toLocaleDateString()}</TableCell>
                                                    <TableCell>{new Date(travel.endDate).toLocaleDateString()}</TableCell>
                                                </TableRow>
                                            )
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default TravelHistory    