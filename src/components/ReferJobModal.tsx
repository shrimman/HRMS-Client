import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { createReferral } from '@/lib/api/jobReferral';
import { Button } from './ui/button';
import { useState } from 'react';

interface ReferJobModalProps {
    open: boolean;
    jobId: number;
    onOpenChange: (open: boolean) => void;
}

function ReferJobModal({ open, jobId, onOpenChange }: ReferJobModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);

            const email = formData.get('recipient-email') as string;
            const name = formData.get('recipient-name') as string;
            const cvFile = formData.get('cv-file') as File | null;
            const note = formData.get('note') as string | null;

            if (!email || !name) {
                toast.error('Please fill in email and name');
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                toast.error('Please enter a valid email address');
                return;
            }

            setIsLoading(true);

            const referralData = {
                friendEmail: email,
                friendName: name,
                cvFile: cvFile || undefined,
                note: note || undefined
            }

            await createReferral({ jobId, ...referralData });
            toast.success('Referral sent successfully!');

            onOpenChange(false);
            (event.target as HTMLFormElement).reset();

        } catch (error) {
            console.log("Job Referral Failed : ", error);
            toast.error('Failed to send the referral. Please try again.')
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogTitle className="text-lg font-bold">Refer a Friend</DialogTitle>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <Label htmlFor="recipient-email" className="text-sm font-medium text-gray-700">
                            Friend's Email *
                        </Label>
                        <Input
                            type="email"
                            id="recipient-email"
                            name='recipient-email'
                            className="mt-1"
                            placeholder="Enter friend's email"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="recipient-name" className="text-sm font-medium text-gray-700">
                            Friend's Name *
                        </Label>
                        <Input
                            type="text"
                            id="recipient-name"
                            name='recipient-name'
                            className="mt-1"
                            placeholder="Enter friend's name"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="cv-file" className="text-sm font-medium text-gray-700">
                            Upload CV (Optional)
                        </Label>
                        <Input
                            type="file"
                            id="cv-file"
                            name='cv-file'
                            className="mt-1"
                            accept=".pdf,.doc,.docx"
                        />
                    </div>

                    <div>
                        <Label htmlFor="note" className="text-sm font-medium text-gray-700">
                            Note (Optional)
                        </Label>
                        <textarea
                            id="note"
                            name='note'
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 outline-none focus:ring-2"
                            placeholder="Add a note to your referral (optional)"
                            rows={3}
                        />
                    </div>

                    <div className="flex gap-2 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Sending...' : 'Send Job Referral'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default ReferJobModal;