import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { MessageSquarePlus } from 'lucide-react';

interface EmployeeAddRemarkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: number;
}

export function EmployeeAddRemarkDialog({ open, onOpenChange, employeeId }: EmployeeAddRemarkDialogProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        remark: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hr.employees.remarks.store', { id: employeeId }), {
            onSuccess: () => {
                toast.success('Note added successfully');
                reset();
                onOpenChange(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquarePlus className="h-5 w-5 text-primary" />
                        Add New Note
                    </DialogTitle>
                    <DialogDescription>
                        Add a performance note or general remark about this employee.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="remark">Note Content</Label>
                        <Textarea
                            id="remark"
                            value={data.remark}
                            onChange={(e) => setData('remark', e.target.value)}
                            placeholder="Type your note here..."
                            className="min-h-[150px] resize-none"
                            required
                        />
                        {errors.remark && <p className="text-xs text-destructive">{errors.remark}</p>}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing || !data.remark.trim()}>
                            {processing ? 'Saving...' : 'Add Note'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
