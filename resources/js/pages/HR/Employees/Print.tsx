import { Head, Link } from '@inertiajs/react';
import { User, Briefcase, Users, ArrowLeft, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

interface Employee {
    id: number;
    employee_number: string;
    email: string | null;
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
}

interface PrintEmployeeProps {
    employee: Employee;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getFullName(employee: Employee): string {
    const { first_name, middle_name, last_name, suffix } = employee.profile;
    let name = `${first_name}`;
    if (middle_name) name += ` ${middle_name}`;
    name += ` ${last_name}`;
    if (suffix) name += ` ${suffix}`;
    return name;
}

function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function calculateAge(dateString: string): number {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function displayValue(value: string | null | undefined): string {
    if (value === null || value === undefined || value.trim() === '') {
        return 'N/A';
    }
    return value;
}

// ============================================================================
// Main Component
// ============================================================================

export default function PrintEmployee({ employee }: PrintEmployeeProps) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <Head title={`Print Employee - ${getFullName(employee)}`} />

            {/* Print Controls Toolbar (Hidden in Print) */}
            <div className="print:hidden bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/hr/employees/${employee.id}`}>
                            <Button variant="outline" size="sm" className="gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back to Profile
                            </Button>
                        </Link>
                        <h2 className="text-lg font-semibold text-gray-800">Print Preview</h2>
                    </div>
                    <Button onClick={handlePrint} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                        <Printer className="h-4 w-4" />
                        Print Document
                    </Button>
                </div>
            </div>

            {/* Document Container */}
            <div className="p-8 print:p-0">
                <div className="bg-white text-black max-w-4xl mx-auto shadow-lg print:shadow-none print:w-full print:max-w-none">
                    {/* Header Section */}
                    <div className="p-10 border-b-4 border-gray-800 flex justify-between items-center bg-gray-50 print:bg-transparent">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 flex items-center justify-center">
                                <img src="/logo.svg" alt="Cameco Logo" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold uppercase tracking-widest text-gray-900">Cameco</h1>
                                <p className="text-sm font-semibold text-gray-600 tracking-widest uppercase">Human Resources Department</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Form ID: HR-REC-001</p>
                            <h2 className="text-xl font-bold uppercase mt-1">Employee Information Record</h2>
                            <p className="text-sm text-gray-600 mt-1">Date Generated: {formatDate(new Date().toISOString())}</p>
                        </div>
                    </div>

                    <div className="p-10 space-y-10">
                        {/* Profile Overview */}
                        <div className="flex gap-8 items-start">
                            {/* Profile Picture Placeholder */}
                            <div className="w-40 h-40 border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-50 flex-shrink-0">
                                {employee.profile.profile_picture_path ? (
                                    <img 
                                        src={`/storage/${employee.profile.profile_picture_path}`} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm text-gray-400 text-center uppercase font-semibold">2x2<br/>Photo</span>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                                    <div className="col-span-2">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Full Name</p>
                                        <p className="text-2xl font-bold border-b border-gray-300 pb-1">{getFullName(employee)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Employee Number</p>
                                        <p className="text-lg font-mono font-semibold border-b border-gray-300 pb-1">{employee.employee_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Status</p>
                                        <p className="text-lg font-semibold uppercase border-b border-gray-300 pb-1">{employee.status.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="page-break-inside-avoid">
                            <div className="bg-gray-100 p-2 mb-4 border-l-4 border-gray-800">
                                <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                                    <User className="h-5 w-5" /> I. Personal Information
                                </h3>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Date of Birth</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{formatDate(employee.profile.date_of_birth)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Place of Birth</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{displayValue(employee.profile.place_of_birth)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Age</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{calculateAge(employee.profile.date_of_birth)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Gender</p>
                                    <p className="font-medium capitalize border-b border-gray-200 pb-1">{displayValue(employee.profile.gender)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Civil Status</p>
                                    <p className="font-medium capitalize border-b border-gray-200 pb-1">{displayValue(employee.profile.civil_status)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Email Address</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{displayValue(employee.email)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Mobile Number</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{displayValue(employee.profile.mobile)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Telephone Number</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{displayValue(employee.profile.phone)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">PWD</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{employee.profile.is_pwd ? 'Yes' : 'No'}</p>
                                </div>
                                <div className="col-span-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Current Address</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{displayValue(employee.profile.current_address)}</p>
                                </div>
                                <div className="col-span-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Permanent Address</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{displayValue(employee.profile.permanent_address)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Government IDs */}
                        <div className="page-break-inside-avoid mt-8">
                            <div className="bg-gray-100 p-2 mb-4 border-l-4 border-gray-800">
                                <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                                    <FileText className="h-5 w-5" /> II. Statutory Information
                                </h3>
                            </div>
                            <div className="grid grid-cols-4 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">SSS Number</p>
                                    <p className="font-mono font-medium border-b border-gray-200 pb-1">{displayValue(employee.profile.sss_number)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">TIN</p>
                                    <p className="font-mono font-medium border-b border-gray-200 pb-1">{displayValue(employee.profile.tin_number)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">PhilHealth</p>
                                    <p className="font-mono font-medium border-b border-gray-200 pb-1">{displayValue(employee.profile.philhealth_number)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Pag-IBIG</p>
                                    <p className="font-mono font-medium border-b border-gray-200 pb-1">{displayValue(employee.profile.pagibig_number)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Employment Information */}
                        <div className="page-break-inside-avoid mt-8">
                            <div className="bg-gray-100 p-2 mb-4 border-l-4 border-gray-800">
                                <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                                    <Briefcase className="h-5 w-5" /> III. Employment Details
                                </h3>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Department</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{displayValue(employee.department?.name)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Position / Title</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{displayValue(employee.position?.title)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Employment Type</p>
                                    <p className="font-medium capitalize border-b border-gray-200 pb-1">{displayValue(employee.employment_type?.replace('_', ' '))}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Date Hired</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{formatDate(employee.date_hired)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Regularization Date</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{formatDate(employee.regularization_date)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Immediate Supervisor</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">
                                        {employee.supervisor 
                                            ? `${employee.supervisor.profile.first_name} ${employee.supervisor.profile.last_name}`
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="page-break-inside-avoid mt-8">
                            <div className="bg-gray-100 p-2 mb-4 border-l-4 border-gray-800">
                                <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                                    <User className="h-5 w-5" /> IV. Emergency Contact
                                </h3>
                            </div>
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Contact Name</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{displayValue(employee.profile.emergency_contact_name)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Relationship</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{displayValue(employee.profile.emergency_contact_relationship)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Contact Number</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{displayValue(employee.profile.emergency_contact_phone)}</p>
                                </div>
                                <div className="col-span-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Contact Address</p>
                                    <p className="font-medium border-b border-gray-200 pb-1">{displayValue(employee.profile.emergency_contact_address)}</p>
                                </div>
                            </div>
                        </div>

                        {/* Dependents Information */}
                        <div className="page-break-inside-avoid mt-8">
                            <div className="bg-gray-100 p-2 mb-4 border-l-4 border-gray-800">
                                <h3 className="text-lg font-bold uppercase tracking-wide flex items-center gap-2">
                                    <Users className="h-5 w-5" /> V. Dependents
                                </h3>
                            </div>
                            {employee.dependents && employee.dependents.length > 0 ? (
                                <table className="w-full text-left border border-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="p-3 border-b border-gray-300 font-bold text-gray-700 text-xs uppercase">Full Name</th>
                                            <th className="p-3 border-b border-gray-300 font-bold text-gray-700 text-xs uppercase">Relationship</th>
                                            <th className="p-3 border-b border-gray-300 font-bold text-gray-700 text-xs uppercase">Date of Birth</th>
                                            <th className="p-3 border-b border-gray-300 font-bold text-gray-700 text-xs uppercase">Age</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employee.dependents.map((dependent) => {
                                            const depFullName = [dependent.first_name, dependent.middle_name, dependent.last_name]
                                                .filter(Boolean)
                                                .join(' ');
                                            return (
                                                <tr key={dependent.id} className="border-b border-gray-200">
                                                    <td className="p-3 text-sm font-medium">{depFullName}</td>
                                                    <td className="p-3 text-sm capitalize">{dependent.relationship.replace('_', ' ')}</td>
                                                    <td className="p-3 text-sm">{formatDate(dependent.date_of_birth)}</td>
                                                    <td className="p-3 text-sm">{calculateAge(dependent.date_of_birth)} yrs</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="border border-gray-300 p-4 text-center bg-gray-50">
                                    <p className="text-gray-500 italic text-sm">No dependents declared.</p>
                                </div>
                            )}
                        </div>

                        {/* Signatures */}
                        <div className="page-break-inside-avoid mt-16 pt-8 border-t-2 border-gray-800">
                            <div className="mb-8">
                                <p className="text-sm italic text-gray-700 text-justify">
                                    I hereby certify that the information provided above is true and correct to the best of my knowledge and belief. 
                                    I understand that any misrepresentation or omission of facts may be cause for disciplinary action, including termination of employment.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-16 mt-16">
                                <div className="text-center">
                                    <div className="border-b border-black mb-2 px-4 h-8 relative">
                                        {/* Employee signature space */}
                                    </div>
                                    <p className="font-bold uppercase text-sm">{getFullName(employee)}</p>
                                    <p className="text-xs text-gray-500 uppercase mt-1">Employee Signature over Printed Name</p>
                                    <p className="text-xs text-gray-500 mt-2">Date: ____________________</p>
                                </div>
                                <div className="text-center">
                                    <div className="border-b border-black mb-2 px-4 h-8 relative">
                                        {/* HR signature space */}
                                    </div>
                                    <p className="font-bold uppercase text-sm">HR Department</p>
                                    <p className="text-xs text-gray-500 uppercase mt-1">Verified and Approved By</p>
                                    <p className="text-xs text-gray-500 mt-2">Date: ____________________</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @media print {
                    @page { margin: 1cm; size: A4; }
                    body { background-color: white !important; }
                    .page-break-inside-avoid { break-inside: avoid; }
                    /* Force background colors and borders to print */
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                }
            `}} />
        </div>
    );
}
