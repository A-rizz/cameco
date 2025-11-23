import { useState } from 'react';
import { CashAdvanceFormData } from '@/types/payroll-pages';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { AlertCircle } from 'lucide-react';

interface AdvanceRequestFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CashAdvanceFormData) => void;
    employees: Array<{ id: number; name: string; employee_number: string; department: string }>;
    currentEmployeeId?: number;
    isLoading?: boolean;
}

const ADVANCE_TYPES = [
    { value: 'cash_advance', label: 'Cash Advance' },
    { value: 'equipment_advance', label: 'Equipment Advance' },
    { value: 'travel_advance', label: 'Travel Advance' },
    { value: 'medical_advance', label: 'Medical Advance' },
];

const PRIORITY_LEVELS = [
    { value: 'normal', label: 'Normal' },
    { value: 'urgent', label: 'Urgent' },
];

export function AdvanceRequestForm({
    isOpen,
    onClose,
    onSubmit,
    employees,
    currentEmployeeId,
    isLoading = false,
}: AdvanceRequestFormProps) {
    const [formData, setFormData] = useState<CashAdvanceFormData>({
        employee_id: currentEmployeeId || 0,
        advance_type: 'cash_advance',
        amount_requested: 0,
        purpose: '',
        requested_date: new Date().toISOString().split('T')[0],
        priority_level: 'normal',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};

        if (!formData.employee_id) {
            newErrors.employee_id = 'Please select an employee';
        }
        if (formData.amount_requested <= 0) {
            newErrors.amount_requested = 'Amount must be greater than 0';
        }
        if (!formData.purpose || formData.purpose.trim().length === 0) {
            newErrors.purpose = 'Purpose is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit(formData);
        onClose();
        setFormData({
            employee_id: currentEmployeeId || 0,
            advance_type: 'cash_advance',
            amount_requested: 0,
            purpose: '',
            requested_date: new Date().toISOString().split('T')[0],
            priority_level: 'normal',
        });
        setErrors({});
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Request Cash Advance</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Employee Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="employee_id">Employee *</Label>
                        <Select
                            value={formData.employee_id.toString()}
                            onValueChange={(value) =>
                                setFormData({ ...formData, employee_id: parseInt(value) })
                            }
                        >
                            <SelectTrigger id="employee_id">
                                <SelectValue placeholder="Select employee..." />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((emp) => (
                                    <SelectItem key={emp.id} value={emp.id.toString()}>
                                        {emp.name} ({emp.employee_number})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.employee_id && (
                            <p className="text-xs text-destructive">{errors.employee_id}</p>
                        )}
                    </div>

                    {/* Advance Type */}
                    <div className="space-y-2">
                        <Label htmlFor="advance_type">Advance Type *</Label>
                        <Select
                            value={formData.advance_type}
                            onValueChange={(value) =>
                                setFormData({ ...formData, advance_type: value })
                            }
                        >
                            <SelectTrigger id="advance_type">
                                <SelectValue placeholder="Select advance type..." />
                            </SelectTrigger>
                            <SelectContent>
                                {ADVANCE_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount Requested */}
                    <div className="space-y-2">
                        <Label htmlFor="amount_requested">Amount Requested *</Label>
                        <Input
                            id="amount_requested"
                            type="number"
                            step="0.01"
                            value={formData.amount_requested}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    amount_requested: parseFloat(e.target.value) || 0,
                                })
                            }
                            placeholder="0.00"
                            className={errors.amount_requested ? 'border-destructive' : ''}
                        />
                        {errors.amount_requested && (
                            <p className="text-xs text-destructive">{errors.amount_requested}</p>
                        )}
                    </div>

                    {/* Purpose */}
                    <div className="space-y-2">
                        <Label htmlFor="purpose">Purpose / Reason *</Label>
                        <Textarea
                            id="purpose"
                            value={formData.purpose}
                            onChange={(e) =>
                                setFormData({ ...formData, purpose: e.target.value })
                            }
                            placeholder="Explain the purpose of this advance..."
                            className={`min-h-[100px] ${errors.purpose ? 'border-destructive' : ''}`}
                        />
                        {errors.purpose && (
                            <p className="text-xs text-destructive">{errors.purpose}</p>
                        )}
                    </div>

                    {/* Requested Date */}
                    <div className="space-y-2">
                        <Label htmlFor="requested_date">Requested Date *</Label>
                        <Input
                            id="requested_date"
                            type="date"
                            value={formData.requested_date}
                            onChange={(e) =>
                                setFormData({ ...formData, requested_date: e.target.value })
                            }
                        />
                    </div>

                    {/* Priority Level */}
                    <div className="space-y-2">
                        <Label htmlFor="priority_level">Priority Level</Label>
                        <Select
                            value={formData.priority_level}
                            onValueChange={(value) =>
                                setFormData({ ...formData, priority_level: value as 'normal' | 'urgent' })
                            }
                        >
                            <SelectTrigger id="priority_level">
                                <SelectValue placeholder="Select priority..." />
                            </SelectTrigger>
                            <SelectContent>
                                {PRIORITY_LEVELS.map((level) => (
                                    <SelectItem key={level.value} value={level.value}>
                                        {level.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Info Message */}
                    <div className="flex gap-2 rounded-lg bg-blue-50 p-3">
                        <AlertCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700">
                            Your advance request will be submitted for approval. Once approved, deductions will be made
                            according to the specified schedule.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
