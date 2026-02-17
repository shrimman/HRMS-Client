import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { shareJob } from '@/lib/api/jobShare';
import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from './ui/button';
import { X } from 'lucide-react';

interface ShareJobModalProps {
    open: boolean;
    jobId: number;
    onOpenChange: (open: boolean) => void;
}

function ShareJobModal({ open, jobId, onOpenChange }: ShareJobModalProps) {
    const [emails, setEmails] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAddEmail = () => {
        const trimmedEmail = inputValue.trim();
        
        if (!trimmedEmail) {
            toast.error('Please enter an email address');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(trimmedEmail)) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (emails.includes(trimmedEmail)) {
            toast.error('This email is already added');
            return;
        }

        setEmails([...emails, trimmedEmail]);
        setInputValue('');
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        setEmails(emails.filter(email => email !== emailToRemove));
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddEmail();
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        try {
            event.preventDefault();

            if (emails.length === 0) {
                toast.error('Please add at least one email address');
                return;
            }

            setIsLoading(true);
            await shareJob(jobId, { recipientEmails: emails });
            toast.success('Job shared successfully!');
            
            setEmails([]);
            setInputValue('');
            onOpenChange(false);
        } catch (error) {
            console.log("Job Sharing Failed : ", error);
            toast.error('Failed to share the job. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen || emails.length === 0) {
            setEmails([]);
            setInputValue('');
        }
        onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogTitle className="text-lg font-bold">Share Job</DialogTitle>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Recipient's Email(s)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                id="recipient-email"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="flex-1 border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 outline-none focus:ring-2"
                                placeholder="Enter email (press Enter to add)"
                            />
                            <Button
                                type="button"
                                onClick={handleAddEmail}
                                variant="outline"
                                className="px-4"
                            >
                                Add
                            </Button>
                        </div>
                    </div>

                    {emails.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Added Emails ({emails.length}):</p>
                            <div className="bg-gray-50 rounded-md p-3 space-y-2 max-h-40 overflow-y-auto">
                                {emails.map((email, index) => (
                                    <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-gray-200">
                                        <span className="text-sm text-gray-700">{email}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEmail(email)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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
                            disabled={isLoading || emails.length === 0}
                        >
                            {isLoading ? 'Sending...' : 'Send Job Link'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default ShareJobModal;