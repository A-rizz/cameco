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
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmployeeRestoreDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: number;
    employeeName: string;
    employeeNumber: string;
}

export function EmployeeRestoreDialog({
    open,
    onOpenChange,
    employeeId,
    employeeName,
    employeeNumber,
}: EmployeeRestoreDialogProps) {
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const handleRestore = () => {
        setIsSubmitting(true);

        router.post(`/hr/employees/${employeeId}/restore`, {
            notes,
        }, {
            onSuccess: () => {
                toast({
                    title: "Success",
                    description: "Employee restored successfully.",
                    variant: "success",
                });
                onOpenChange(false);
                setNotes('');
            },
            onError: () => {
                toast({
                    title: "Error",
                    description: "Failed to restore employee. Please try again.",
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
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <RotateCcw className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <DialogTitle>Restore Employee</DialogTitle>
                            <DialogDescription className="text-sm">
                                {employeeName} ({employeeNumber})
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
                        <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-green-900 dark:text-green-100">
                                Restore this employee
                            </p>
                            <p className="text-sm text-green-700 dark:text-green-200">
                                The employee will be restored and marked as active. They will appear in the active employee list again.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="restore-notes">
                            Notes (optional)
                        </Label>
                        <Textarea
                            id="restore-notes"
                            placeholder="Enter any notes about restoring this employee..."
                            value={notes}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
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
                        onClick={handleRestore}
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Restoring...' : 'Restore Employee'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
