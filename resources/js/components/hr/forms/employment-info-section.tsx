import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase } from 'lucide-react';
import { useMemo } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

export interface EmploymentInfoData {
    employee_number?: string;
    department_id: string;
    position_id: string;
    employment_type: string;
    date_hired: string;
    regularization_date?: string;
    supervisor_id?: string;
    status: string;
}

interface Department {
    id: number;
    name: string;
    parent_id: number | null;
}

interface Position {
    id: number;
    name: string;
    department_id: number;
}

interface Supervisor {
    id: number;
    name: string;
    employee_number: string;
}

interface EmploymentInfoSectionProps {
    data: EmploymentInfoData;
    onChange: (field: keyof EmploymentInfoData, value: string) => void;
    errors?: Partial<Record<keyof EmploymentInfoData, string>>;
    departments: Department[];
    positions: Position[];
    supervisors: Supervisor[];
    isEditMode?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export function EmploymentInfoSection({ 
    data, 
    onChange, 
    errors = {}, 
    departments = [],
    positions = [],
    supervisors = [],
    isEditMode = false
}: EmploymentInfoSectionProps) {
    // Calculate Main and Sub Departments
    const mainDepartments = useMemo(() => departments.filter(d => !d.parent_id), [departments]);
    
    const currentDept = useMemo(() => 
        departments.find(d => d.id === parseInt(data.department_id)), 
    [data.department_id, departments]);

    const initialMainDeptId = useMemo(() => {
        if (!currentDept) return '';
        return currentDept.parent_id ? String(currentDept.parent_id) : String(currentDept.id);
    }, [currentDept]);

    const subDepartments = useMemo(() => {
        if (!initialMainDeptId) return [];
        return departments.filter(d => String(d.parent_id) === initialMainDeptId);
    }, [initialMainDeptId, departments]);

    // Filter positions based on selected department (the specific one)
    const filteredPositions = useMemo(() => {
        if (data.department_id && data.department_id !== 'all' && data.department_id !== '') {
            const deptId = parseInt(data.department_id, 10);
            return positions.filter(
                p => parseInt(String(p.department_id), 10) === deptId
            );
        }
        return positions;
    }, [data.department_id, positions]);

    const handleMainDepartmentChange = (value: string) => {
        // When main department changes, we set the actual department_id to the main one
        // and let the user refine it with the sub-department if they want.
        onChange('department_id', value);
        onChange('position_id', '');
    };

    const handleSubDepartmentChange = (value: string) => {
        // If "None" is selected for sub-department, we revert to the main department
        if (value === 'none') {
            onChange('department_id', initialMainDeptId);
        } else {
            onChange('department_id', value);
        }
        onChange('position_id', '');
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    <div>
                        <CardTitle>Employment Information</CardTitle>
                        <CardDescription>Work-related details and status</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Employee Number (Read-only for create, auto-generated) */}
                {isEditMode && (
                    <div className="space-y-2">
                        <Label htmlFor="employee_number">Employee Number</Label>
                        <Input
                            id="employee_number"
                            value={data.employee_number || 'Auto-generated'}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            Employee number is automatically generated
                        </p>
                    </div>
                )}

                {/* Department and Sub-Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="main_department_id">
                            Main Department <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                            value={initialMainDeptId} 
                            onValueChange={handleMainDepartmentChange}
                        >
                            <SelectTrigger id="main_department_id">
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                                {mainDepartments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.department_id && (
                            <p className="text-xs text-destructive">{errors.department_id}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="sub_department_id">Sub-Department (Optional)</Label>
                        <Select 
                            value={currentDept?.parent_id ? data.department_id : 'none'} 
                            onValueChange={handleSubDepartmentChange}
                            disabled={!initialMainDeptId || subDepartments.length === 0}
                        >
                            <SelectTrigger id="sub_department_id">
                                <SelectValue placeholder={subDepartments.length > 0 ? "Select sub-unit" : "No sub-units"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">None (Use Main Department)</SelectItem>
                                {subDepartments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Position */}
                <div className="space-y-2">
                        <Label htmlFor="position_id">
                            Position <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                            value={data.position_id} 
                            onValueChange={(value) => onChange('position_id', value)}
                            disabled={!data.department_id || data.department_id === 'all' || data.department_id === ''}
                        >
                            <SelectTrigger id="position_id">
                                <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredPositions && filteredPositions.length > 0 ? (
                                    filteredPositions.map((pos) => (
                                        <SelectItem key={pos.id} value={pos.id.toString()}>
                                            {pos.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <div className="p-2 text-sm text-muted-foreground">
                                        {!data.department_id ? 'Select a department first' : 'No positions available'}
                                    </div>
                                )}
                            </SelectContent>
                        </Select>
                        {errors.position_id && (
                            <p className="text-xs text-destructive">{errors.position_id}</p>
                        )}
                        {!data.department_id && (
                            <p className="text-xs text-muted-foreground">
                                Select a department first
                            </p>
                        )}
                    </div>

                {/* Employment Type and Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="employment_type">
                            Employment Type <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                            value={data.employment_type} 
                            onValueChange={(value) => onChange('employment_type', value)}
                        >
                            <SelectTrigger id="employment_type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="regular">Regular</SelectItem>
                                <SelectItem value="probationary">Probationary</SelectItem>
                                <SelectItem value="contractual">Contractual</SelectItem>
                                <SelectItem value="project-based">Project-Based</SelectItem>
                                <SelectItem value="part-time">Part-Time</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.employment_type && (
                            <p className="text-xs text-destructive">{errors.employment_type}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status">
                            Status <span className="text-destructive">*</span>
                        </Label>
                        <Select 
                            value={data.status} 
                            onValueChange={(value) => onChange('status', value)}
                        >
                            <SelectTrigger id="status">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="on_leave">On Leave</SelectItem>
                                <SelectItem value="suspended">Suspended</SelectItem>
                                <SelectItem value="terminated">Terminated</SelectItem>
                                <SelectItem value="archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.status && (
                            <p className="text-xs text-destructive">{errors.status}</p>
                        )}
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="date_hired">
                            Date Hired <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="date_hired"
                            type="date"
                            value={data.date_hired}
                            onChange={(e) => onChange('date_hired', e.target.value)}
                        />
                        {errors.date_hired && (
                            <p className="text-xs text-destructive">{errors.date_hired}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="regularization_date">Regularization Date</Label>
                        <Input
                            id="regularization_date"
                            type="date"
                            value={data.regularization_date || ''}
                            onChange={(e) => onChange('regularization_date', e.target.value)}
                        />
                        {errors.regularization_date && (
                            <p className="text-xs text-destructive">{errors.regularization_date}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Optional - for probationary employees
                        </p>
                    </div>
                </div>

                {/* Immediate Supervisor */}
                <div className="space-y-2">
                    <Label htmlFor="supervisor_id">Immediate Supervisor</Label>
                    <Select 
                        value={data.supervisor_id || 'none'} 
                        onValueChange={(value) => onChange('supervisor_id', value === 'none' ? '' : value)}
                    >
                        <SelectTrigger id="supervisor_id">
                            <SelectValue placeholder="Select supervisor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">No Supervisor</SelectItem>
                            {supervisors.map((sup) => (
                                <SelectItem key={sup.id} value={sup.id.toString()}>
                                    {sup.name} ({sup.employee_number})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.supervisor_id && (
                        <p className="text-xs text-destructive">{errors.supervisor_id}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                        Optional - select the employee's direct supervisor
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
