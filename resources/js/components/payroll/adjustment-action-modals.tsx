import { useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, AlertCircle, Loader2, TrendingUp, TrendingDown } from 'lucide-react';
import { router } from '@inertiajs/react';
import type { PayrollAdjustment } from '@/types/payroll-pages';

// ============================================================================
// Helper Functions
// ============================================================================

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
}

function getAdjustmentTypeInfo(type: PayrollAdjustment['adjustment_type']) {
    const configs = {
        earning: {
            label: 'Earning',
            icon: <TrendingUp className="h-4 w-4" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        deduction: {
            label: 'Deduction',
            icon: <TrendingDown className="h-4 w-4" />,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
        correction: {
            label: 'Correction',
            icon: <AlertCircle className="h-4 w-4" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        backpay: {
            label: 'Back Pay',
            icon: <TrendingUp className="h-4 w-4" />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
        },
        refund: {
            label: 'Refund',
            icon: <TrendingDown className="h-4 w-4" />,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50',
        },
    };
    return configs[type];
}

// ============================================================================
// Approve Adjustment Modal
// ============================================================================

interface ApproveAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    adjustment: PayrollAdjustment | null;
    onConfirm: () => void;
}

export function ApproveAdjustmentModal({
    isOpen,
    onClose,
    adjustment,
    onConfirm,
}: ApproveAdjustmentModalProps) {
    const [isLoading, setIsLoading] = useState(false);

    if (!adjustment) return null;

    const typeInfo = getAdjustmentTypeInfo(adjustment.adjustment_type);

    const handleApprove = () => {
        setIsLoading(true);
        router.post(
            `/payroll/adjustments/${adjustment.id}/approve`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    onConfirm();
                    onClose();
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        Approve Payroll Adjustment
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left space-y-4 pt-4">
                        {/* Warning Alert */}
                        <Alert className="border-green-200 bg-green-50">
                            <AlertCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                This adjustment will be marked as approved and can be applied to payroll processing.
                            </AlertDescription>
                        </Alert>

                        {/* Adjustment Details */}
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Employee:</span>
                                <span className="font-semibold text-gray-900">
                                    {adjustment.employee_name}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Period:</span>
                                <span className="font-medium">{adjustment.payroll_period.name}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Type:</span>
                                <div className={`flex items-center gap-1 ${typeInfo.color}`}>
                                    {typeInfo.icon}
                                    <span className="font-medium">{typeInfo.label}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Category:</span>
                                <span className="font-medium">{adjustment.adjustment_category}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-bold text-lg text-green-700">
                                    {formatCurrency(adjustment.amount)}
                                </span>
                            </div>

                            <div className="py-2 border-b">
                                <span className="text-gray-600 block mb-1">Reason:</span>
                                <p className="text-gray-900 text-sm bg-gray-50 p-2 rounded">
                                    {adjustment.reason}
                                </p>
                            </div>

                            {adjustment.reference_number && (
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span className="text-gray-600">Reference:</span>
                                    <span className="font-mono text-sm">{adjustment.reference_number}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center py-2">
                                <span className="text-gray-600">Requested by:</span>
                                <span className="font-medium">{adjustment.requested_by}</span>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleApprove}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Approving...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve Adjustment
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

// ============================================================================
// Reject Adjustment Modal
// ============================================================================
interface RejectAdjustmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    adjustment: PayrollAdjustment | null;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function RejectAdjustmentModal({
    isOpen,
    onClose,
    adjustment,
    onConfirm,
}: RejectAdjustmentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [rejectReason, setRejectReason] = useState('');

    if (!adjustment) return null;

    const handleReject = () => {
        setIsLoading(true);
        router.post(
            `/payroll/adjustments/${adjustment.id}/reject`,
            { reason: rejectReason },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onConfirm();
                    onClose();
                },
                onFinish: () => {
                    setIsLoading(false);
                },
            }
        );
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onClose}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-red-700">
                        <XCircle className="h-5 w-5" />
                        Reject Payroll Adjustment
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-left space-y-4 pt-4">
                        <Alert className="border-red-200 bg-red-50">
                            <AlertCircle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                This adjustment will be rejected and returned to the requester.
                            </AlertDescription>
                        </Alert>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Employee:</span>
                                <span className="font-semibold text-gray-900">
                                    {adjustment.employee_name}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-gray-600">Amount:</span>
                                <span className="font-bold text-lg text-red-700">
                                    {formatCurrency(adjustment.amount)}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Rejection Reason</label>
                            <Textarea
                                placeholder="Explain why this adjustment is being rejected..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="min-h-24"
                            />
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleReject}
                        disabled={isLoading || !rejectReason.trim()}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Rejecting...
                            </>
                        ) : (
                            <>
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Adjustment
                            </>
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
