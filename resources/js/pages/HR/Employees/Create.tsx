import AppLayout from '@/layouts/app-layout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePermission } from '@/components/permission-gate';
import axios from 'axios';
import { 
    PersonalInfoSection, 
    type PersonalInfoData 
} from '@/components/hr/forms/personal-info-section';
import { 
    EmploymentInfoSection, 
    type EmploymentInfoData 
} from '@/components/hr/forms/employment-info-section';
import { 
    EmergencyContactSection, 
    type EmergencyContactData 
} from '@/components/hr/forms/emergency-contact-section';
import { 
    GovernmentIDsSection, 
    type GovernmentIDsData 
} from '@/components/hr/forms/government-ids-section';
import { 
    DependentsSection, 
    type EmployeeDependentData 
} from '@/components/hr/forms/dependents-section';

// ============================================================================
// Type Definitions
// ============================================================================

interface Department {
    id: number;
    name: string;
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

interface CreateEmployeeProps {
    departments: Department[];
    positions: Position[];
    supervisors: Supervisor[];
}

type EmployeeFormData = PersonalInfoData & EmploymentInfoData & EmergencyContactData & GovernmentIDsData;

// ============================================================================
// Component
// ============================================================================

export default function CreateEmployee({ departments = [], positions = [], supervisors = [] }: CreateEmployeeProps) {
    const { hasPermission } = usePermission();
    
    // Redirect if user doesn't have create permission
    useEffect(() => {
        if (!hasPermission('hr.employees.create')) {
            router.visit('/hr/employees', {
                onError: () => {
                    console.error('Access denied: Missing hr.employees.create permission');
                }
            });
        }
    }, [hasPermission]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Partial<Record<keyof EmployeeFormData, string>>>({});

    // Initialize form data
    const [personalInfo, setPersonalInfo] = useState<PersonalInfoData>({
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        date_of_birth: '',
        place_of_birth: '',
        is_pwd: false,
        gender: 'male', // Default to 'male' to match Select component default
        civil_status: 'single', // Default to 'single' to match Select component default
        spouse_name: '',
        spouse_date_of_birth: '',
        spouse_contact_number: '',
        father_name: '',
        father_date_of_birth: '',
        mother_name: '',
        mother_date_of_birth: '',
        email: '',
        phone: '',
        mobile: '',
        current_address: '',
        permanent_address: '',
        same_as_current: false,
        profile_picture: null,
    });

    const [employmentInfo, setEmploymentInfo] = useState<EmploymentInfoData>({
        department_id: '',
        position_id: '',
        employment_type: '',
        date_hired: '',
        regularization_date: '',
        supervisor_id: '',
        status: 'active',
    });

    const [emergencyContact, setEmergencyContact] = useState<EmergencyContactData>({
        emergency_contact_name: '',
        emergency_contact_relationship: '',
        emergency_contact_phone: '',
        emergency_contact_address: '',
    });

    const [governmentIDs, setGovernmentIDs] = useState<GovernmentIDsData>({
        sss_number: '',
        tin_number: '',
        philhealth_number: '',
        pagibig_number: '',
    });

    const [dependents, setDependents] = useState<EmployeeDependentData[]>([]);

    // Handle field changes
    const handlePersonalInfoChange = (field: keyof PersonalInfoData, value: string | boolean) => {
        setPersonalInfo(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleProfilePictureChange = (file: File | null) => {
        setPersonalInfo(prev => ({ ...prev, profile_picture: file }));
        if (errors.profile_picture) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.profile_picture;
                return newErrors;
            });
        }
    };

    const handleEmploymentInfoChange = (field: keyof EmploymentInfoData, value: string) => {
        setEmploymentInfo(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleEmergencyContactChange = (field: keyof EmergencyContactData, value: string) => {
        setEmergencyContact(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleGovernmentIDsChange = (field: keyof GovernmentIDsData, value: string) => {
        setGovernmentIDs(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // Form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Create FormData to support file uploads
        const formData = new FormData();
        
        // Add personal info fields
        Object.entries(personalInfo).forEach(([key, value]) => {
            if (value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === 'boolean') {
                formData.append(key, value ? '1' : '0');
            } else if (value !== null && value !== undefined) {
                // Always send the value (even empty strings) so validation works properly
                formData.append(key, String(value));
            }
        });

        // Add employment info fields
        Object.entries(employmentInfo).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        // Add emergency contact fields
        Object.entries(emergencyContact).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        // Add government IDs fields
        Object.entries(governmentIDs).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, String(value));
            }
        });

        // Add dependents as FormData array format (not JSON string)
        dependents.forEach((dependent, index) => {
            if (dependent.id) {
                formData.append(`dependents[${index}][id]`, String(dependent.id));
            }
            formData.append(`dependents[${index}][first_name]`, dependent.first_name);
            if (dependent.middle_name) {
                formData.append(`dependents[${index}][middle_name]`, dependent.middle_name);
            }
            formData.append(`dependents[${index}][last_name]`, dependent.last_name);
            formData.append(`dependents[${index}][date_of_birth]`, dependent.date_of_birth);
            formData.append(`dependents[${index}][relationship]`, dependent.relationship);
            if (dependent.remarks) {
                formData.append(`dependents[${index}][remarks]`, dependent.remarks);
            }
        });

        // Use axios for FormData upload instead of Inertia router
        axios.post('/hr/employees', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
            .then((response) => {
                // Redirect to show page on success
                if (response.data?.employee_id) {
                    router.visit(`/hr/employees/${response.data.employee_id}`, { method: 'get' });
                } else {
                    router.visit('/hr/employees', { method: 'get' });
                }
            })
            .catch((error) => {
                // Log detailed error information
                console.error('Form submission error:', {
                    status: error.response?.status,
                    data: error.response?.data,
                    errors: error.response?.data?.errors,
                });
                
                if (error.response?.data?.errors) {
                    setErrors(error.response.data.errors as Partial<Record<keyof EmployeeFormData, string>>);
                } else if (error.response?.statusText) {
                    console.error(`Error: ${error.response.statusText}`);
                }
                setIsSubmitting(false);
            });
    };

    return (
        <AppLayout>
            <Head title="Create Employee" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/hr/employees">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Create New Employee</h1>
                            <p className="text-muted-foreground">
                                Add a new employee to the system
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Information */}
                    <PersonalInfoSection
                        data={personalInfo}
                        onChange={handlePersonalInfoChange}
                        onFileChange={handleProfilePictureChange}
                        errors={errors}
                    />

                    {/* Employment Information */}
                    <EmploymentInfoSection
                        data={employmentInfo}
                        onChange={handleEmploymentInfoChange}
                        errors={errors}
                        departments={departments}
                        positions={positions}
                        supervisors={supervisors}
                        isEditMode={false}
                    />

                    {/* Emergency Contact */}
                    <EmergencyContactSection
                        data={emergencyContact}
                        onChange={handleEmergencyContactChange}
                        errors={errors}
                    />

                    {/* Government IDs */}
                    <GovernmentIDsSection
                        data={governmentIDs}
                        onChange={handleGovernmentIDsChange}
                        errors={errors}
                    />

                    {/* Dependents */}
                    <DependentsSection
                        dependents={dependents}
                        onChange={setDependents}
                        isEditMode={true}
                    />

                    {/* Form Actions */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t">
                        <Link href="/hr/employees">
                            <Button type="button" variant="outline" disabled={isSubmitting}>
                                Cancel
                            </Button>
                        </Link>
                        <Button type="submit" disabled={isSubmitting}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSubmitting ? 'Creating...' : 'Create Employee'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
