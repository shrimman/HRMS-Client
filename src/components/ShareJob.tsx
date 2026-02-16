
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"

function ShareJob() {
    return (
        <>
            <div>ShareJob</div>
            <input type="text"> EMAIL</input>
            <Button variant="default" className={cn('mt-4')}>
                Send Job Details
            </Button>
        </>
    )
}

export default ShareJob