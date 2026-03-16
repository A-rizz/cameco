import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Plus, CheckCircle, AlertCircle } from 'lucide-react';
import { BadgeIssuanceModal, type BadgeFormData } from '@/components/hr/badge-issuance-modal';

interface Employee {
    id: string;
    name: string;
    employee_id: string;
    department: string;
    position: string;
    photo?: string;
    badge?: {
        card_uid: string;
        issued_at: string;
        expires_at: string | null;
        last_used_at: string | null;
        is_active: boolean;
    };
}

interface BadgeSubmitResult {
    employeeName: string;
    employeeId: string;
    cardUid: string;
    cardType: string;
    expiresAt: string;
    issuedAt: string;
}

interface CreateBadgeProps {
    employees: Employee[];
    existingBadgeUids: string[];
}

export default function CreateBadge({ employees, existingBadgeUids }: CreateBadgeProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<{
        success: boolean;
        message: string;
        badgeData?: BadgeSubmitResult;
    } | null>(null);

    const breadcrumbs = [
        { title: 'HR', href: '/hr' },
        { title: 'Timekeeping', href: '/hr/timekeeping' },
        { title: 'RFID Badges', href: '/hr/timekeeping/badges' },
        { title: 'Issue New Badge', href: '#' },
    ];

    const handleModalOpen = () => {
        setIsModalOpen(true);
        setSubmitResult(null);
    };

    const handleSubmit = async (formData: BadgeFormData) => {
        setIsSubmitting(true);

        // Simulate API call (Phase 1 - mock data)
        setTimeout(() => {
            try {
                // Mock success response
                const selectedEmployee = employees.find((emp) => emp.id === formData.employee_id);

                setSubmitResult({
                    success: true,
                    message: `Badge successfully issued to ${selectedEmployee?.name}`,
                    badgeData: {
                        employeeName: selectedEmployee?.name || '',
                        employeeId: selectedEmployee?.employee_id || '',
                        cardUid: formData.card_uid,
                        cardType: formData.card_type,
                        expiresAt: formData.expires_at || '',
                        issuedAt: new Date().toISOString(),
                    },
                });

                setIsSubmitting(false);
                setIsModalOpen(false);

                // Auto-clear success message after 5 seconds
                setTimeout(() => {
                    setSubmitResult(null);
                }, 5000);
            } catch {
                setSubmitResult({
                    success: false,
                    message: 'Failed to issue badge. Please try again.',
                });
                setIsSubmitting(false);
            }
        }, 1000);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Issue New Badge" />

            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/hr/timekeeping/badges">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Badges
                            </Link>
                        </Button>
                        <div>
                            <h1 className="text-3xl font-bold">Issue New Badge</h1>
                            <p className="text-muted-foreground mt-1">
                                Assign an RFID badge to an employee
                            </p>
                        </div>
                    </div>
                </div>

                {/* Success/Error Alert */}
                {submitResult && (
                    <Alert className={submitResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
                        <div className="flex gap-3">
                            {submitResult.success ? (
                                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                            )}
                            <div>
                                <AlertTitle className={submitResult.success ? 'text-green-900' : 'text-red-900'}>
                                    {submitResult.success ? 'Badge Issued Successfully' : 'Error'}
                                </AlertTitle>
                                <AlertDescription className={submitResult.success ? 'text-green-800' : 'text-red-800'}>
                                    {submitResult.message}
                                </AlertDescription>
                                {submitResult.badgeData && (
                                    <div className="mt-3 bg-white/50 rounded p-3 text-sm space-y-1">
                                        <p>
                                            <strong>Employee:</strong> {submitResult.badgeData.employeeName} ({submitResult.badgeData.employeeId})
                                        </p>
                                        <p>
                                            <strong>Card UID:</strong>{' '}
                                            <code className="font-mono">{submitResult.badgeData.cardUid}</code>
                                        </p>
                                        <p>
                                            <strong>Card Type:</strong> {submitResult.badgeData.cardType}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Alert>
                )}

                {/* Main Content */}
                <Card>
                    <CardHeader>
                        <CardTitle>Issue New Badge</CardTitle>
                        <CardDescription>
                            Open the badge issuance form to assign an RFID badge to an employee.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="pt-4 border-t">
                            <Button onClick={handleModalOpen} size="lg" className="gap-2">
                                <Plus className="h-5 w-5" />
                                Open Badge Issuance Form
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Badge Issuance Modal */}
            <BadgeIssuanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                employees={employees}
                isLoading={isSubmitting}
                existingBadgeUids={existingBadgeUids}
            />
        </AppLayout>
    );
}
