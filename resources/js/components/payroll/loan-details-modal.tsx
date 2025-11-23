import { EmployeeLoan, LoanPayment } from '@/types/payroll-pages';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { LoanPaymentHistory } from './loan-payment-history';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface LoanDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    loan: EmployeeLoan | undefined;
    payments: LoanPayment[];
    onEdit?: (loan: EmployeeLoan) => void;
    onCancel?: (loan: EmployeeLoan) => void;
}

const loanTypeConfig: Record<string, { label: string; color: string }> = {
    sss: { label: 'SSS Loan', color: 'bg-indigo-100 text-indigo-800' },
    pagibig: { label: 'Pag-IBIG Loan', color: 'bg-purple-100 text-purple-800' },
    company: { label: 'Company Loan', color: 'bg-orange-100 text-orange-800' },
    cash_advance: { label: 'Cash Advance', color: 'bg-pink-100 text-pink-800' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-blue-100 text-blue-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    restructured: { label: 'Restructured', color: 'bg-yellow-100 text-yellow-800' },
};

export function LoanDetailsModal({
    isOpen,
    onClose,
    loan,
    payments,
    onEdit,
    onCancel,
}: LoanDetailsModalProps) {
    if (!loan || !isOpen) return null;

    const loanTypeInfo = loanTypeConfig[loan.loan_type] || { label: loan.loan_type, color: '' };
    const statusInfo = statusConfig[loan.status] || { label: loan.status, color: '' };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle>Loan Details</DialogTitle>
                            <p className="text-xs text-muted-foreground mt-1">
                                {loan.employee_name} ({loan.employee_number})
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Badge className={loanTypeInfo.color}>{loanTypeInfo.label}</Badge>
                            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Loan Summary */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4">
                            <p className="text-xs font-semibold text-muted-foreground">Loan Number</p>
                            <p className="font-mono text-sm font-bold mt-1">{loan.loan_number}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-xs font-semibold text-muted-foreground">Department</p>
                            <p className="text-sm font-medium mt-1">{loan.department_name}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-xs font-semibold text-muted-foreground">Principal Amount</p>
                            <p className="text-lg font-bold mt-1">{formatCurrency(loan.principal_amount)}</p>
                        </Card>
                        <Card className="p-4">
                            <p className="text-xs font-semibold text-muted-foreground">Total Amount</p>
                            <p className="text-lg font-bold mt-1">{formatCurrency(loan.total_amount)}</p>
                        </Card>
                    </div>

                    {/* Loan Details */}
                    <Card className="p-4 space-y-3 bg-muted/30">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">Interest Rate</p>
                                <p className="text-sm font-medium mt-1">
                                    {loan.interest_rate ? `${loan.interest_rate}%` : 'No Interest'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">Monthly Amortization</p>
                                <p className="text-sm font-medium mt-1">
                                    {formatCurrency(loan.monthly_amortization)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">Installments</p>
                                <p className="text-sm font-medium mt-1">
                                    {loan.installments_paid} / {loan.number_of_installments}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">Remaining Balance</p>
                                <p className="text-sm font-bold mt-1 text-blue-600">
                                    {formatCurrency(loan.remaining_balance)}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Dates */}
                    <Card className="p-4 space-y-3 bg-muted/30">
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">Loan Date</p>
                                <p className="text-sm font-medium mt-1">
                                    {new Date(loan.loan_date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">Start Date</p>
                                <p className="text-sm font-medium mt-1">
                                    {new Date(loan.start_date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">Maturity Date</p>
                                <p className="text-sm font-medium mt-1">
                                    {new Date(loan.maturity_date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-muted-foreground">Status</p>
                                <p className="text-sm font-medium mt-1">{loan.status_label}</p>
                            </div>
                        </div>
                    </Card>

                    {/* Approval Info */}
                    {loan.approved_by && (
                        <Card className="p-4 space-y-2 border-green-200 bg-green-50">
                            <p className="text-xs font-semibold text-green-900">Approval Information</p>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-green-700">Approved By</p>
                                    <p className="font-medium text-green-900">{loan.approved_by}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-green-700">Approved At</p>
                                    <p className="font-medium text-green-900">
                                        {loan.approved_at
                                            ? new Date(loan.approved_at).toLocaleDateString('en-US', {
                                                  month: 'short',
                                                  day: 'numeric',
                                                  year: 'numeric',
                                              })
                                            : '—'}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Payment History */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">Payment Schedule</p>
                        <LoanPaymentHistory
                            payments={payments}
                            totalInstallments={loan.number_of_installments}
                        />
                    </div>

                    {/* Audit Trail */}
                    <Card className="p-4 space-y-2 bg-muted/30">
                        <p className="text-xs font-semibold text-muted-foreground">System Information</p>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <p className="text-muted-foreground">Created By</p>
                                <p className="font-medium">{loan.created_by}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Created At</p>
                                <p className="font-medium">
                                    {new Date(loan.created_at).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </p>
                            </div>
                            {loan.updated_by && (
                                <div>
                                    <p className="text-muted-foreground">Updated By</p>
                                    <p className="font-medium">{loan.updated_by}</p>
                                </div>
                            )}
                            {loan.updated_at && (
                                <div>
                                    <p className="text-muted-foreground">Updated At</p>
                                    <p className="font-medium">
                                        {new Date(loan.updated_at).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    {loan.status === 'active' && onEdit && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                onEdit(loan);
                                onClose();
                            }}
                            className="gap-2"
                        >
                            <Edit className="h-4 w-4" />
                            Edit
                        </Button>
                    )}
                    {loan.status === 'active' && onCancel && (
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => {
                                onCancel(loan);
                                onClose();
                            }}
                            className="gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Cancel Loan
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
