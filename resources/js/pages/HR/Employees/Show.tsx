import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EmployeeStatusBadge } from '@/components/hr/employee-status-badge';
import { EmployeeDocumentsTab } from '@/components/hr/employee-documents-tab';
import { EmployeeHistoryTab } from '@/components/hr/employee-history-tab';
import { EmployeeArchiveDialog } from '@/components/hr/employee-archive-dialog';
import { RemarksSection } from '@/components/hr/forms/remarks-section';
import { DependentsSection } from '@/components/hr/forms/dependents-section';
import { ArrowLeft, Edit, Archive, FileText, History, User, Briefcase, MessageSquare, Users, Printer, Plus, MessageSquarePlus } from 'lucide-react';
import { useState } from 'react';
import { PermissionGate } from '@/components/permission-gate';
import { EmployeeStatusDialog } from '@/components/hr/employee-status-dialog';
import { EmployeeAddDependentDialog } from '@/components/hr/employee-add-dependent-dialog';
import { EmployeeAddRemarkDialog } from '@/components/hr/employee-add-remark-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { ShieldCheck, UploadCloud, AlertCircle, CheckCircle2 } from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

interface Profile {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    date_of_birth: string;
    place_of_birth: string | null;
    is_pwd: boolean | null;
    gender: string;
    civil_status: string;
    spouse_name: string | null;
    spouse_date_of_birth: string | null;
    spouse_contact_number: string | null;
    father_name: string | null;
    father_date_of_birth: string | null;
    mother_name: string | null;
    mother_date_of_birth: string | null;
    phone: string | null;
    mobile: string | null;
    current_address: string | null;
    permanent_address: string | null;
    emergency_contact_name: string | null;
    emergency_contact_relationship: string | null;
    emergency_contact_phone: string | null;
    emergency_contact_address: string | null;
    sss_number: string | null;
    tin_number: string | null;
    philhealth_number: string | null;
    pagibig_number: string | null;
    profile_picture_path: string | null;
}

interface Department {
    id: number;
    name: string;
    description: string | null;
}

interface Position {
    id: number;
    title: string;
    description: string | null;
}

interface Supervisor {
    id: number;
    employee_number: string;
    profile: {
        first_name: string;
        last_name: string;
    };
}

interface EmployeeDependent {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    date_of_birth: string;
    relationship: string;
    remarks?: string | null;
}

interface EmployeeRemark {
    id: number;
    remark: string;
    created_at: string;
    createdBy?: {
        id: number;
        name: string;
    };
}

interface LeaveBalance {
    id: number;
    leave_policy_id: number;
    year: number;
    earned: number;
    used: number;
    carried_forward: number;
    remaining: number;
    leave_policy: {
        id: number;
        name: string;
        code: string;
    };
}

interface Employee {
    id: number;
    employee_number: string;
    email: string;
    department_id: number;
    position_id: number;
    employment_type: string;
    date_hired: string;
    regularization_date: string | null;
    supervisor_id: number | null;
    status: 'active' | 'on_leave' | 'suspended' | 'terminated' | 'archived';
    profile: Profile;
    department: Department;
    position: Position;
    supervisor: Supervisor | null;
    dependents: EmployeeDependent[];
    remarks: EmployeeRemark[];
    leave_balances?: LeaveBalance[];
    created_at: string;
    updated_at: string;
}

interface ShowEmployeeProps {
    employee: Employee;
    auditLogs: any[];
}

// ============================================================================
// Helper Functions
// ============================================================================

function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getFullName(employee: Employee): string {
    const { first_name, middle_name, last_name, suffix } = employee.profile;
    let name = `${first_name}`;
    if (middle_name) name += ` ${middle_name}`;
    name += ` ${last_name}`;
    if (suffix) name += ` ${suffix}`;
    return name;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function maskID(id: string | null, visibleChars: number = 4): string {
    if (!id) return 'Not provided';
    if (id.length <= visibleChars) return id;
    const masked = '*'.repeat(id.length - visibleChars);
    return masked + id.slice(-visibleChars);
}

// ============================================================================
// Overview Tab Component
// ============================================================================

function OverviewTab({ employee }: { employee: Employee }) {
    const [showSSS, setShowSSS] = useState(false);
    const [showTIN, setShowTIN] = useState(false);
    const [showPhilHealth, setShowPhilHealth] = useState(false);
    const [showPagIBIG, setShowPagIBIG] = useState(false);

    return (
        <div className="space-y-6">
            {/* Personal Information Card */}
            <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                        <p className="text-sm mt-1">{getFullName(employee)}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                        <p className="text-sm mt-1">{formatDate(employee.profile.date_of_birth)}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Place of Birth</label>
                        <p className="text-sm mt-1">{employee.profile.place_of_birth || 'Not provided'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Gender</label>
                        <p className="text-sm mt-1">{employee.profile.gender}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Civil Status</label>
                        <p className="text-sm mt-1">{employee.profile.civil_status}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">PWD Status</label>
                        <p className="text-sm mt-1">{employee.profile.is_pwd ? 'Yes' : 'No'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <p className="text-sm mt-1">{employee.email}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone</label>
                        <p className="text-sm mt-1">{employee.profile.phone || 'Not provided'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                        <p className="text-sm mt-1">{employee.profile.mobile || 'Not provided'}</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Current Address</label>
                        <p className="text-sm mt-1">{employee.profile.current_address || 'Not provided'}</p>
                    </div>
                    <div className="md:col-span-2">
                        <label className="text-sm font-medium text-muted-foreground">Permanent Address</label>
                        <p className="text-sm mt-1">{employee.profile.permanent_address || 'Not provided'}</p>
                    </div>
                </div>
            </div>

            {/* Employment Information Card */}
            <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                        <p className="text-sm mt-1 font-mono">{employee.employee_number}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Status</label>
                        <div className="mt-1">
                            <EmployeeStatusBadge status={employee.status} />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Department</label>
                        <p className="text-sm mt-1">{employee.department.name}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Position</label>
                        <p className="text-sm mt-1">{employee.position?.title || 'Not assigned'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Contract Type</label>
                        <p className="text-sm mt-1">{employee.employment_type}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Date Hired</label>
                        <p className="text-sm mt-1">{formatDate(employee.date_hired)}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Regular Date</label>
                        <p className="text-sm mt-1">
                            {employee.regularization_date ? formatDate(employee.regularization_date) : 'Not regular yet'}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Boss / Supervisor</label>
                        <p className="text-sm mt-1">
                            {employee.supervisor 
                                ? `${employee.supervisor.profile.first_name} ${employee.supervisor.profile.last_name} (${employee.supervisor.employee_number})`
                                : 'No boss assigned'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Emergency Contact Card */}
            <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Person to Contact</label>
                        <p className="text-sm mt-1">{employee.profile.emergency_contact_name || 'Not provided'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Relationship</label>
                        <p className="text-sm mt-1">{employee.profile.emergency_contact_relationship || 'Not provided'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                        <p className="text-sm mt-1">{employee.profile.emergency_contact_phone || 'Not provided'}</p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Address</label>
                        <p className="text-sm mt-1">{employee.profile.emergency_contact_address || 'Not provided'}</p>
                    </div>
                </div>
            </div>

            {/* Spouse Information Card (shown if married) */}
            {employee.profile.civil_status === 'married' && (
                <div className="bg-card rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4">Spouse Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Spouse Name</label>
                            <p className="text-sm mt-1">{employee.profile.spouse_name || 'Not provided'}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Spouse Birthday</label>
                            <p className="text-sm mt-1">
                                {employee.profile.spouse_date_of_birth 
                                    ? formatDate(employee.profile.spouse_date_of_birth)
                                    : 'Not provided'}
                            </p>
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-medium text-muted-foreground">Spouse Contact Number</label>
                            <p className="text-sm mt-1">{employee.profile.spouse_contact_number || 'Not provided'}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Parents Information Card */}
            <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Parents Information</h3>
                <div className="space-y-6">
                    {/* Father */}
                    <div>
                        <h4 className="text-sm font-medium mb-3">Father</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Father's Name</label>
                                <p className="text-sm mt-1">{employee.profile.father_name || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Father's Birthday</label>
                                <p className="text-sm mt-1">
                                    {employee.profile.father_date_of_birth
                                        ? formatDate(employee.profile.father_date_of_birth)
                                        : 'Not provided'}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Mother */}
                    <div>
                        <h4 className="text-sm font-medium mb-3">Mother</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-4">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Mother's Name</label>
                                <p className="text-sm mt-1">{employee.profile.mother_name || 'Not provided'}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-muted-foreground">Mother's Birthday</label>
                                <p className="text-sm mt-1">
                                    {employee.profile.mother_date_of_birth
                                        ? formatDate(employee.profile.mother_date_of_birth)
                                        : 'Not provided'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Government IDs Card */}
            <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Government IDs</h3>
                <PermissionGate 
                    permission="hr.employees.view_government_ids"
                    fallback={
                        <p className="text-sm text-muted-foreground italic">
                            You don't have permission to see these IDs.
                        </p>
                    }
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">SSS Number</label>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-mono">
                                {showSSS ? employee.profile.sss_number || 'Not provided' : maskID(employee.profile.sss_number)}
                            </p>
                            {employee.profile.sss_number && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowSSS(!showSSS)}
                                    className="h-6 text-xs"
                                >
                                    {showSSS ? 'Hide' : 'Show'}
                                </Button>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">TIN</label>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-mono">
                                {showTIN ? employee.profile.tin_number || 'Not provided' : maskID(employee.profile.tin_number)}
                            </p>
                            {employee.profile.tin_number && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowTIN(!showTIN)}
                                    className="h-6 text-xs"
                                >
                                    {showTIN ? 'Hide' : 'Show'}
                                </Button>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">PhilHealth Number</label>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-mono">
                                {showPhilHealth ? employee.profile.philhealth_number || 'Not provided' : maskID(employee.profile.philhealth_number)}
                            </p>
                            {employee.profile.philhealth_number && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPhilHealth(!showPhilHealth)}
                                    className="h-6 text-xs"
                                >
                                    {showPhilHealth ? 'Hide' : 'Show'}
                                </Button>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Pag-IBIG Number</label>
                        <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm font-mono">
                                {showPagIBIG ? employee.profile.pagibig_number || 'Not provided' : maskID(employee.profile.pagibig_number)}
                            </p>
                            {employee.profile.pagibig_number && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowPagIBIG(!showPagIBIG)}
                                    className="h-6 text-xs"
                                >
                                    {showPagIBIG ? 'Hide' : 'Show'}
                                </Button>
                            )}
                        </div>
                    </div>
                    </div>
                </PermissionGate>
            </div>
        </div>
    );
}

// ============================================================================
// Employment Tab Component
// ============================================================================

function EmploymentTab({ employee }: { employee: Employee }) {
    const calculateTenure = () => {
        const hireDate = new Date(employee.date_hired);
        const today = new Date();
        const years = today.getFullYear() - hireDate.getFullYear();
        const months = today.getMonth() - hireDate.getMonth();
        
        const totalMonths = years * 12 + months;
        const tenureYears = Math.floor(totalMonths / 12);
        const tenureMonths = totalMonths % 12;
        
        if (tenureYears > 0 && tenureMonths > 0) {
            return `${tenureYears} year${tenureYears > 1 ? 's' : ''} and ${tenureMonths} month${tenureMonths > 1 ? 's' : ''}`;
        } else if (tenureYears > 0) {
            return `${tenureYears} year${tenureYears > 1 ? 's' : ''}`;
        } else {
            return `${tenureMonths} month${tenureMonths > 1 ? 's' : ''}`;
        }
    };

    return (
        <div className="space-y-6">
            {/* Department & Position Details */}
            <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Department & Position</h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Department</label>
                        <p className="text-base font-medium mt-1">{employee.department.name}</p>
                        {employee.department.description && (
                            <p className="text-sm text-muted-foreground mt-1">{employee.department.description}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-sm font-medium text-muted-foreground">Position</label>
                        <p className="text-base font-medium mt-1">{employee.position.title}</p>
                        {employee.position.description && (
                            <p className="text-sm text-muted-foreground mt-1">{employee.position.description}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Employment Dates */}
            <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Work Timeline</h3>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="bg-primary/10 rounded-full p-2 mt-1">
                            <Briefcase className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">Date Hired</p>
                            <p className="text-sm text-muted-foreground">{formatDate(employee.date_hired)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Time at company: {calculateTenure()}</p>
                        </div>
                    </div>
                    
                    {employee.regularization_date && (
                        <div className="flex items-start gap-4">
                            <div className="bg-green-500/10 rounded-full p-2 mt-1">
                                <Briefcase className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">Regularization Date</p>
                                <p className="text-sm text-muted-foreground">{formatDate(employee.regularization_date)}</p>
                            </div>
                        </div>
                    )}

                    <div className="flex items-start gap-4">
                        <div className="bg-blue-500/10 rounded-full p-2 mt-1">
                            <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">Contract Type</p>
                            <p className="text-sm text-muted-foreground">{employee.employment_type}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-4">
                        <div className="bg-purple-500/10 rounded-full p-2 mt-1">
                            <User className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium">Current Status</p>
                            <div className="mt-1">
                                <EmployeeStatusBadge status={employee.status} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Supervisor Information */}
            <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-4">Reporting Lines</h3>
                {employee.supervisor ? (
                    <div className="space-y-2">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">Reports To</label>
                            <p className="text-base font-medium mt-1">
                                {employee.supervisor.profile.first_name} {employee.supervisor.profile.last_name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Employee ID: {employee.supervisor.employee_number}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted-foreground">No boss assigned yet</p>
                )}
            </div>
        </div>
    );
}

// ============================================================================
// Status Update Tab Component
// ============================================================================

function StatusUpdateTab({ employee }: { employee: Employee }) {
    const { data, setData, post, processing, reset, errors } = useForm({
        status: employee.status,
        reason: '',
        document: null as File | null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (data.status === employee.status) {
            toast.error("Status is already set to " + data.status.replace('_', ' '));
            return;
        }

        if (!data.document && data.status !== 'active') {
            toast.error("Supporting document is required for " + data.status.replace('_', ' '));
            return;
        }

        post(route('hr.employees.status', { id: employee.id }), {
            forceFormData: true,
            onSuccess: () => {
                toast.success('Status updated successfully');
                reset('reason', 'document');
            },
        });
    };

    return (
        <div className="max-w-3xl space-y-8">
            <div className="bg-card rounded-xl border-2 border-primary/5 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <CheckCircle2 className="h-32 w-32" />
                </div>
                
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold">Update Status</h3>
                        <p className="text-sm text-muted-foreground">Change employee status and upload a document if needed.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="target-status" className="text-xs font-black uppercase tracking-widest opacity-70">New Status</Label>
                            <Select 
                                value={data.status} 
                                onValueChange={(v: any) => setData('status', v)}
                            >
                                <SelectTrigger className="h-12 border-2 focus:ring-primary">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="on_leave">On Leave</SelectItem>
                                    <SelectItem value="suspended">Suspended</SelectItem>
                                    <SelectItem value="terminated">Terminated</SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.status && <p className="text-xs text-destructive font-bold">{errors.status}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest opacity-70">Upload Document</Label>
                            <div className="relative">
                                <Input 
                                    type="file" 
                                    id="document-upload"
                                    className="hidden" 
                                    onChange={(e) => setData('document', e.target.files ? e.target.files[0] : null)}
                                    accept=".pdf,.jpg,.jpeg,.png"
                                />
                                <Label 
                                    htmlFor="document-upload"
                                    className={`flex items-center justify-center h-12 border-2 border-dashed rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${data.document ? 'border-green-500 bg-green-50/50' : 'border-primary/20'}`}
                                >
                                    {data.document ? (
                                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm">
                                            <CheckCircle2 className="h-4 w-4" />
                                            {data.document.name.length > 20 ? data.document.name.substring(0, 20) + '...' : data.document.name}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                                            <UploadCloud className="h-4 w-4" />
                                            Upload File (PDF/IMG)
                                        </div>
                                    )}
                                </Label>
                            </div>
                            <p className="text-[10px] text-muted-foreground italic">Needed for leave, suspension, or termination.</p>
                            {errors.document && <p className="text-xs text-destructive font-bold">{errors.document}</p>}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="status-reason" className="text-xs font-black uppercase tracking-widest opacity-70">Reason</Label>
                        <Textarea 
                            id="status-reason"
                            placeholder="Why are you changing this status?"
                            className="min-h-[120px] border-2 focus:ring-primary resize-none"
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                        />
                        {errors.reason && <p className="text-xs text-destructive font-bold">{errors.reason}</p>}
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-700 font-medium leading-relaxed">
                            <strong>Note:</strong> Make sure you have checked the documents. This change will be saved in the system.
                        </p>
                    </div>

                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            disabled={processing || data.status === employee.status}
                            className={`h-12 px-8 font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 ${data.status === 'terminated' ? 'bg-destructive hover:bg-destructive/90 shadow-destructive/20' : 'bg-primary hover:bg-primary/90'}`}
                        >
                            {processing ? 'Saving...' : 'Save Status Change'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-card rounded-xl border p-6 space-y-4">
                <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <History className="h-4 w-4 text-primary" />
                    Status History
                </h4>
                <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-lg italic">
                    All changes are saved in the <span className="font-bold text-foreground">History</span> tab, including the documents and who made the change.
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function ShowEmployee({ employee, auditLogs }: ShowEmployeeProps) {
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [statusDialogOpen, setStatusDialogOpen] = useState(false);
    const [addDependentOpen, setAddDependentOpen] = useState(false);
    const [addRemarkOpen, setAddRemarkOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'HR Dashboard', href: '/hr/dashboard' },
        { title: 'Employees', href: '/hr/employees' },
        { title: getFullName(employee), href: `/hr/employees/${employee.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${getFullName(employee)} - Details`} />

            <div className="space-y-6 p-6 max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <Link href="/hr/employees">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-start gap-6">
                            <Avatar className="h-32 w-32 border-4 border-background shadow-sm">
                                {employee.profile.profile_picture_path ? (
                                    <AvatarImage 
                                        src={`/storage/${employee.profile.profile_picture_path}`} 
                                        alt={getFullName(employee)}
                                        className="object-cover"
                                    />
                                ) : null}
                                <AvatarFallback className="text-4xl bg-muted">
                                    {getInitials(employee.profile.first_name, employee.profile.last_name)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">{getFullName(employee)}</h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <p className="text-muted-foreground font-mono">{employee.employee_number}</p>
                                    <EmployeeStatusBadge status={employee.status} />
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {employee.position?.title || 'No position'} • {employee.department?.name || 'No department'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={`/hr/employees/${employee.id}/print`} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline">
                                <Printer className="h-4 w-4 mr-2" />
                                Print
                            </Button>
                        </a>
                        <PermissionGate permission="hr.employees.update">
                            <Link href={`/hr/employees/${employee.id}/edit`}>
                                <Button variant="outline">
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                            </Link>
                        </PermissionGate>
                        <PermissionGate permission="hr.employees.delete">
                            <Button 
                                variant="outline"
                                onClick={() => setArchiveDialogOpen(true)}
                            >
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                    <TabsList>
                        <TabsTrigger value="overview" className="gap-2">
                            <User className="h-4 w-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="employment" className="gap-2">
                            <Briefcase className="h-4 w-4" />
                            Work
                        </TabsTrigger>
                        <TabsTrigger value="dependents" className="gap-2">
                            <Users className="h-4 w-4" />
                            Family
                        </TabsTrigger>
                        <TabsTrigger value="remarks" className="gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Notes
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Files
                        </TabsTrigger>
                        <TabsTrigger value="history" className="gap-2">
                            <History className="h-4 w-4" />
                            History
                        </TabsTrigger>
                        <PermissionGate permission="hr.employees.update">
                            <TabsTrigger value="status" className="gap-2 text-primary font-bold">
                                <CheckCircle2 className="h-4 w-4" />
                                Status
                            </TabsTrigger>
                        </PermissionGate>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6">
                        <OverviewTab employee={employee} />
                    </TabsContent>

                    <TabsContent value="employment" className="mt-6">
                        <EmploymentTab employee={employee} />
                    </TabsContent>

                    <TabsContent value="dependents" className="mt-6">
                        <PermissionGate permission="hr.employees.update">
                            <div className="flex justify-end mb-4">
                                <Button onClick={() => setAddDependentOpen(true)} className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Add Dependent
                                </Button>
                            </div>
                        </PermissionGate>
                        <DependentsSection dependents={employee.dependents || []} onChange={() => {}} isEditMode={false} />
                    </TabsContent>

                    <TabsContent value="remarks" className="mt-6">
                        <PermissionGate permission="hr.employees.update">
                            <div className="flex justify-end mb-4">
                                <Button onClick={() => setAddRemarkOpen(true)} className="gap-2">
                                    <MessageSquarePlus className="h-4 w-4" />
                                    Add Note
                                </Button>
                            </div>
                        </PermissionGate>
                        <RemarksSection remarks={employee.remarks || []} onChange={() => {}} isEditMode={false} />
                    </TabsContent>

                    <TabsContent value="documents" className="mt-6">
                        <EmployeeDocumentsTab employeeId={employee.id} />
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <EmployeeHistoryTab employeeId={employee.id} auditLogs={auditLogs} />
                    </TabsContent>

                    <TabsContent value="status" className="mt-6">
                        <StatusUpdateTab employee={employee} />
                    </TabsContent>
                </Tabs>

                {/* Archive Confirmation Dialog */}
                <EmployeeArchiveDialog
                    open={archiveDialogOpen}
                    onOpenChange={setArchiveDialogOpen}
                    employeeId={employee.id}
                    employeeName={getFullName(employee)}
                    employeeNumber={employee.employee_number}
                />

                {/* Status Update Dialog */}
                <EmployeeStatusDialog
                    open={statusDialogOpen}
                    onOpenChange={setStatusDialogOpen}
                    employeeId={employee.id}
                    employeeName={getFullName(employee)}
                    currentStatus={employee.status}
                />

                {/* Add Dependent Dialog */}
                <EmployeeAddDependentDialog
                    open={addDependentOpen}
                    onOpenChange={setAddDependentOpen}
                    employeeId={employee.id}
                />

                {/* Add Remark Dialog */}
                <EmployeeAddRemarkDialog
                    open={addRemarkOpen}
                    onOpenChange={setAddRemarkOpen}
                    employeeId={employee.id}
                />
            </div>
        </AppLayout>
    );
}
