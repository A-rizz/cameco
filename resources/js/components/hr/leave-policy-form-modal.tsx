import React, { useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface LeavePolicyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    policy?: {
        id?: number;
        type: string;
        annual_entitlement: number;
        max_carry_forward?: number;
        max_consecutive_days?: number;
        requires_approval: boolean;
        description?: string;
    };
    mode: 'create' | 'edit';
    onSuccess?: () => void;
}

const leaveTypes = [
    'Vacation Leave',
    'Sick Leave',
    'Emergency Leave',
    'Maternity Leave',
    'Paternity Leave',
    'Privilege Leave',
    'Bereavement Leave',
];

export function LeavePolicyFormModal({ isOpen, onClose, policy, mode, onSuccess }: LeavePolicyFormModalProps) {
    const [formData, setFormData] = useState({
        type: policy?.type || '',
        annual_entitlement: policy?.annual_entitlement || 15,
        max_carry_forward: policy?.max_carry_forward || 0,
        max_consecutive_days: policy?.max_consecutive_days || 0,
        requires_approval: policy?.requires_approval !== undefined ? policy.requires_approval : true,
        description: policy?.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (mode === 'edit' && policy?.id) {
            router.put(`/hr/leave/policies/${policy.id}`, formData, {
                onSuccess: () => {
                    onClose();
                    onSuccess?.();
                },
            });
        } else {
            router.post('/hr/leave/policies', formData, {
                onSuccess: () => {
                    onClose();
                    onSuccess?.();
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {mode === 'edit' ? 'Edit Leave Policy' : 'Create Leave Policy'}
                        </DialogTitle>
                        <DialogDescription>
                            {mode === 'edit'
                                ? 'Update the leave policy details'
                                : 'Create a new leave policy for employees'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Leave Type */}
                        <div className="space-y-2">
                            <Label htmlFor="type">Leave Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                                disabled={mode === 'edit'}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select leave type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {leaveTypes.map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Annual Entitlement */}
                        <div className="space-y-2">
                            <Label htmlFor="annual_entitlement">Annual Entitlement (days) *</Label>
                            <Input
                                id="annual_entitlement"
                                type="number"
                                min="0"
                                value={formData.annual_entitlement}
                                onChange={(e) =>
                                    setFormData({ ...formData, annual_entitlement: Number(e.target.value) })
                                }
                                required
                            />
                        </div>

                        {/* Max Carry Forward */}
                        <div className="space-y-2">
                            <Label htmlFor="max_carry_forward">Max Carryover Days</Label>
                            <Input
                                id="max_carry_forward"
                                type="number"
                                min="0"
                                value={formData.max_carry_forward}
                                onChange={(e) =>
                                    setFormData({ ...formData, max_carry_forward: Number(e.target.value) })
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Maximum days that can be carried forward to next year
                            </p>
                        </div>

                        {/* Max Consecutive Days */}
                        <div className="space-y-2">
                            <Label htmlFor="max_consecutive_days">Max Consecutive Days</Label>
                            <Input
                                id="max_consecutive_days"
                                type="number"
                                min="0"
                                value={formData.max_consecutive_days}
                                onChange={(e) =>
                                    setFormData({ ...formData, max_consecutive_days: Number(e.target.value) })
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                Maximum consecutive days that can be taken at once
                            </p>
                        </div>

                        {/* Requires Approval */}
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label htmlFor="requires_approval">Requires Approval</Label>
                                <p className="text-xs text-muted-foreground">
                                    Requires supervisor/manager approval
                                </p>
                            </div>
                            <Switch
                                id="requires_approval"
                                checked={formData.requires_approval}
                                onCheckedChange={(checked: boolean) =>
                                    setFormData({ ...formData, requires_approval: checked })
                                }
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Optional description for this leave policy"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit">
                            {mode === 'edit' ? 'Update Policy' : 'Create Policy'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
