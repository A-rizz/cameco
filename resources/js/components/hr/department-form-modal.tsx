import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { usePage } from '@inertiajs/react';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Department {
    id: number;
    name: string;
    code: string;
    description: string | null;
    parent_id: number | null;
    is_active: boolean;
    employee_count?: number;
}

interface DepartmentFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Omit<Department, 'id' | 'employee_count'>) => Promise<void>;
    department?: Department | null;
    departments?: Department[];
    mode?: 'create' | 'edit';
}

// ============================================================================
// Component
// ============================================================================

export function DepartmentFormModal({
    isOpen,
    onClose,
    onSubmit,
    department,
    departments = [],
    mode = 'create'
}: DepartmentFormModalProps) {
    const page = usePage();
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        parent_id: '',
        is_active: true,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    // Initialize form with department data when editing
    useEffect(() => {
        if (mode === 'edit' && department) {
            setFormData({
                name: department.name,
                code: department.code,
                description: department.description || '',
                parent_id: department.parent_id ? String(department.parent_id) : '',
                is_active: department.is_active,
            });
        } else {
            // Reset form for create mode
            setFormData({
                name: '',
                code: '',
                description: '',
                // Pre-fill parent_id if passed (e.g. from "Add Child" action)
                parent_id: department?.parent_id ? String(department.parent_id) : '',
                is_active: true,
            });
        }
        
        // Check for validation errors from Inertia
        const errors = page.props.errors as { [key: string]: string } | undefined;
        if (errors && Object.keys(errors).length > 0) {
            setFieldErrors(errors);
        } else {
            setFieldErrors({});
        }
        setError(null);
    }, [mode, department, isOpen, page.props.errors]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (value: string) => {
        setFormData(prev => ({
            ...prev,
            parent_id: value
        }));
    };

    const handleCheckboxChange = (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            is_active: checked
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setFieldErrors({});

        // Validation
        if (!formData.name.trim()) {
            setError('Department name is required');
            return;
        }

        if (!formData.code.trim()) {
            setError('Department code is required');
            return;
        }

        // Prevent department from being its own parent
        if (mode === 'edit' && department && formData.parent_id === String(department.id)) {
            setError('A department cannot be its own parent');
            return;
        }

        try {
            setIsLoading(true);
            await onSubmit({
                name: formData.name.trim(),
                code: formData.code.trim(),
                description: formData.description.trim() || null,
                parent_id: formData.parent_id ? Number(formData.parent_id) : null,
                is_active: formData.is_active,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    // Filter out current department from parent options when editing
    const availableDepartments = departments.filter(
        d => mode !== 'edit' || d.id !== department?.id
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[95vh] flex flex-col p-0 overflow-hidden shadow-2xl border-none">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-2xl font-bold tracking-tight">
                        {mode === 'create' ? 'Create Department' : 'Edit Department'}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {mode === 'create'
                            ? 'Add a new department to your company'
                            : 'Update department settings'}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <ScrollArea className="flex-1 px-6">
                        <div className="space-y-4 py-4">
                            {/* Error Message */}
                            {error && (
                                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-200 border border-red-200/50">
                                    {error}
                                </div>
                            )}

                            {/* Department Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Department Name *</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="e.g., Human Resources"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    className={`h-10 ${fieldErrors.name ? 'border-red-500 bg-red-50/50' : ''}`}
                                />
                                {fieldErrors.name && (
                                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight">{fieldErrors.name}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Department Code */}
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Dept Code *</Label>
                                    <Input
                                        id="code"
                                        name="code"
                                        placeholder="e.g., HR-UNIT"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        disabled={isLoading}
                                        className={`h-10 ${fieldErrors.code ? 'border-red-500 bg-red-50/50' : ''}`}
                                    />
                                    {fieldErrors.code && (
                                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight">{fieldErrors.code}</p>
                                    )}
                                </div>

                                {/* Parent Department */}
                                <div className="space-y-2">
                                    <Label htmlFor="parent_id" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reports To (Parent Dept)</Label>
                                    <Select value={formData.parent_id} onValueChange={handleSelectChange}>
                                        <SelectTrigger id="parent_id" disabled={isLoading} className={`h-10 ${fieldErrors.parent_id ? 'border-red-500 bg-red-50/50' : ''}`}>
                                            <SelectValue placeholder="Select parent..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Root Department</SelectItem>
                                            {availableDepartments.map(dept => (
                                                <SelectItem key={dept.id} value={String(dept.id)}>
                                                    {dept.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldErrors.parent_id && (
                                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight">{fieldErrors.parent_id}</p>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Description</Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="What does this department do?"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    disabled={isLoading}
                                    rows={3}
                                    className={`resize-none ${fieldErrors.description ? 'border-red-500 bg-red-50/50' : ''}`}
                                />
                                {fieldErrors.description && (
                                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-tight">{fieldErrors.description}</p>
                                )}
                            </div>

                            {/* Active Status */}
                            <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border border-border/50">
                                <div className="space-y-0.5">
                                    <Label htmlFor="is_active" className="text-sm font-bold cursor-pointer">Department is Active</Label>
                                    <p className="text-[10px] text-muted-foreground">Check this if the department is currently open.</p>
                                </div>
                                <Checkbox
                                    id="is_active"
                                    checked={formData.is_active}
                                    onCheckedChange={handleCheckboxChange}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </ScrollArea>

                    {/* Buttons Footer - Fixed at bottom */}
                    <div className="flex justify-end gap-3 p-6 border-t bg-muted/10">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isLoading}
                            className="font-bold text-xs uppercase tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 px-8 font-bold text-xs uppercase tracking-widest"
                        >
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {mode === 'create' ? 'Create Department' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
