import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';

interface EmployeeAddDependentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    employeeId: number;
}

export function EmployeeAddDependentDialog({ open, onOpenChange, employeeId }: EmployeeAddDependentDialogProps) {
    const { data, setData, post, processing, reset, errors } = useForm({
        first_name: '',
        middle_name: '',
        last_name: '',
        date_of_birth: '',
        relationship: '',
        remarks: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('hr.employees.dependents.store', { id: employeeId }), {
            onSuccess: () => {
                toast.success('Dependent added successfully');
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
                        <Plus className="h-5 w-5 text-primary" />
                        Add New Dependent
                    </DialogTitle>
                    <DialogDescription>
                        Enter the details of the employee's family member or dependent.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input
                                id="first_name"
                                value={data.first_name}
                                onChange={(e) => setData('first_name', e.target.value)}
                                placeholder="Required"
                                required
                            />
                            {errors.first_name && <p className="text-xs text-destructive">{errors.first_name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="last_name">Last Name</Label>
                            <Input
                                id="last_name"
                                value={data.last_name}
                                onChange={(e) => setData('last_name', e.target.value)}
                                placeholder="Required"
                                required
                            />
                            {errors.last_name && <p className="text-xs text-destructive">{errors.last_name}</p>}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="middle_name">Middle Name</Label>
                            <Input
                                id="middle_name"
                                value={data.middle_name}
                                onChange={(e) => setData('middle_name', e.target.value)}
                                placeholder="Optional"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="date_of_birth">Date of Birth</Label>
                            <Input
                                id="date_of_birth"
                                type="date"
                                value={data.date_of_birth}
                                onChange={(e) => setData('date_of_birth', e.target.value)}
                                required
                            />
                            {errors.date_of_birth && <p className="text-xs text-destructive">{errors.date_of_birth}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="relationship">Relationship</Label>
                        <Select value={data.relationship} onValueChange={(v) => setData('relationship', v)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select relationship" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="son">Son</SelectItem>
                                <SelectItem value="daughter">Daughter</SelectItem>
                                <SelectItem value="spouse">Spouse</SelectItem>
                                <SelectItem value="father">Father</SelectItem>
                                <SelectItem value="mother">Mother</SelectItem>
                                <SelectItem value="stepson">Stepson</SelectItem>
                                <SelectItem value="stepdaughter">Stepdaughter</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.relationship && <p className="text-xs text-destructive">{errors.relationship}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="remarks">Remarks (Optional)</Label>
                        <Textarea
                            id="remarks"
                            value={data.remarks}
                            onChange={(e) => setData('remarks', e.target.value)}
                            placeholder="Enter any additional notes"
                            rows={2}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Adding...' : 'Add Dependent'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
