import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { createReferral } from '@/lib/api/jobReferral';

interface ReferJobModalProps {
    open: boolean;
    jobId: number;
    onOpenChange: (open: boolean) => void;
}

function ReferJobModal({ open, jobId, onOpenChange }: ReferJobModalProps) {

    const onOpenChangeHandler = (open: boolean) => {
        onOpenChange(open);
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            console.log(formData);
            const email = formData.get('recipient-email') as string;
            const name = formData.get('recipient-name') as string;
            const cvFile = formData.get('cv-file') as File | null;
            const note = formData.get('note') as string | null;
            console.log(email, name, cvFile, note);

            const referralData = {
                friendEmail: email,
                friendName: name,
                cvFile: cvFile || undefined,
                note: note || undefined
            }

            await createReferral({ jobId, ...referralData });
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

                <DialogTitle className="text-lg font-bold mb-4">Refer a Friend</DialogTitle>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="recipient-email" className="block text-sm font-medium text-gray-700">
                            Friend's Email
                        </Label>
                        <Input
                            type="email"
                            id="recipient-email"
                            name='recipient-email'
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter recipient's email"
                        />
                        <Label htmlFor="recipient-name" className="block text-sm font-medium text-gray-700 mt-4">
                            Friends's Name
                        </Label>

                        <Input
                            type="text"
                            id="recipient-name"
                            name='recipient-name'
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Enter recipient's name"
                        />
                        <Label htmlFor="cv-file" className="block text-sm font-medium text-gray-700 mt-4">
                            Upload CV (Optional)
                        </Label>
                        <Input
                            type="file"
                            id="cv-file"
                            name='cv-file'
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                        <Label htmlFor="note" className="block text-sm font-medium text-gray-700 mt-4">
                            Note (Optional)
                        </Label>
                        <textarea
                            id="note"
                            name='note'
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="Add a note to your referral (optional)"
                        />

                    </div>
                    <button
                        type="submit"
                        className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                        Send Job Referral
                    </button>
                </form>

            </DialogContent>
        </Dialog >
    )
}

export default ReferJobModal;