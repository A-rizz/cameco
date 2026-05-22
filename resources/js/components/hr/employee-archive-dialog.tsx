import { useState } from 'react';
import { router } from '@inertiajs/react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Archive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmployeeArchiveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: number;
    employeeName: string;
    employeeNumber: string;
}

export function EmployeeArchiveDialog({
    open,
    onOpenChange,
    employeeId,
    employeeName,
    employeeNumber,
}: EmployeeArchiveDialogProps) {
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleArchive = () => {
        setIsSubmitting(true);

        router.delete(`/hr/employees/${employeeId}`, {
            data: { reason },
            onSuccess: () => {
                toast({
                    title: "Success",
                    description: "Employee archived successfully.",
                    variant: "success",
                });
                onOpenChange(false);
                setReason('');
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to archive employee. Please try again.",
                    variant: "destructive",
                });
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                            <Archive className="h-5 w-5 text-destructive" />
                        </div>
                        <div>
                            <DialogTitle>Archive Employee</DialogTitle>
                            <DialogDescription className="text-sm">
                                {employeeName} ({employeeNumber})
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                This action will archive the employee
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-200">
                                The employee will be marked as archived and will no longer appear in the active employee list. 
                                You can restore them later if needed.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="archive-reason">
                            Reason for archiving (optional)
                        </Label>
                        <Textarea
                            id="archive-reason"
                            placeholder="Enter the reason for archiving this employee..."
                            value={reason}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                            rows={4}
                            disabled={isSubmitting}
                        />
                        <p className="text-xs text-muted-foreground">
                            This will be recorded in the audit log for future reference.
                        </p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        onClick={handleArchive}
                        disabled={isSubmitting}
                    >
                        <Archive className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Archiving...' : 'Archive Employee'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
