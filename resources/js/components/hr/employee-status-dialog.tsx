import { useState } from 'react';
import { useForm } from '@inertiajs/react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface EmployeeStatusDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: number;
    currentStatus: string;
    employeeName: string;
}

export function EmployeeStatusDialog({
    open,
    onOpenChange,
    employeeId,
    currentStatus,
    employeeName,
}: EmployeeStatusDialogProps) {
    const { data, setData, post, processing, reset } = useForm({
        status: currentStatus,
        reason: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hr.employees.status', { id: employeeId }), {
            onSuccess: () => {
                toast.success('Employee status updated successfully', {
                    style: { backgroundColor: '#10b981', color: '#fff' },
                });
                onOpenChange(false);
                reset();
            },
            onError: () => {
                toast.error('Failed to update employee status', {
                    style: { backgroundColor: '#ef4444', color: '#fff' },
                });
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Update Status</DialogTitle>
                        <DialogDescription>
                            Manually change the status for {employeeName}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">New Status</Label>
                            <Select
                                value={data.status}
                                onValueChange={(value) => setData('status', value)}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="on_leave">On Leave</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="terminated">Terminated</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="reason">Reason (Optional)</Label>
                            <Textarea
                                id="reason"
                                placeholder="Enter reason for status change..."
                                value={data.reason}
                                onChange={(e) => setData('reason', e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Updating...' : 'Update Status'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
