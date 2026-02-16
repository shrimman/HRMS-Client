import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@/components/ui/dialog'
import { shareJob } from '@/lib/api/jobShare';
import { toast } from 'sonner';

interface ShareJobModalProps {
    open: boolean;
    jobId: number;
    onOpenChange: (open: boolean) => void;
}

function ShareJobModal({ open, jobId, onOpenChange }: ShareJobModalProps) {

    const onOpenChangeHandler = (open: boolean) => {
        onOpenChange(open);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            console.log(formData);

            const email = formData.get('recipient-email') as string;
            console.log(email);

            await shareJob(jobId, { recipientEmails: [email] });
            onOpenChangeHandler(false);
        } catch (error) {
            console.log("Job Sharing Failed : ", error);
            toast.error('Failed to share the job. Please try again.')
        }


    }
    return (
        <Dialog open={open} >
            <DialogOverlay className="fixed inset-0 bg-black opacity-50" />
            <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg">

                <DialogTitle className="text-lg font-bold mb-4">Share Job</DialogTitle>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Recipient's Email
                        </label>
                        <input
                            type="email"
                            id="recipient-email"
                            name='recipient-email'
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter recipient's email"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                        Send Job Link
                    </button>
                </form>
            </DialogContent>
        </Dialog >
    )
}

export default ShareJobModal;