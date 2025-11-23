import { AdvanceDeduction, CashAdvance } from '@/types/payroll-pages';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AdvanceDeductionTrackerProps {
    advance: CashAdvance;
    deductions: AdvanceDeduction[];
    onEarlyRepayment?: () => void;
    isLoading?: boolean;
}

export function AdvanceDeductionTracker({
    advance,
    deductions,
    onEarlyRepayment,
    isLoading = false,
}: AdvanceDeductionTrackerProps) {
    const totalDeducted = deductions.reduce((sum, d) => sum + d.deduction_amount, 0);
    const percentageComplete = (advance.amount_approved ?? 0) > 0 ? (totalDeducted / (advance.amount_approved ?? 1)) * 100 : 0;
    const completedDeductions = deductions.filter((d) => d.is_deducted).length;
    const totalDeductions = deductions.length;

    const getStatusColor = (deduction: AdvanceDeduction) => {
        if (deduction.is_deducted) return 'text-green-600';
        return 'text-orange-600';
    };

    const getStatusIcon = (deduction: AdvanceDeduction) => {
        if (deduction.is_deducted) {
            return <CheckCircle2 className="h-4 w-4 text-green-600" />;
        }
        return <Clock className="h-4 w-4 text-orange-600" />;
    };

    // Generate mock payroll periods if deductions are empty
    const displayDeductions =
        deductions.length > 0
            ? deductions
            : Array.from({ length: advance.number_of_installments || 1 }).map((_, i) => {
                  const approvedAmount = advance.amount_approved ?? 0;
                  const installmentAmount = approvedAmount / (advance.number_of_installments || 1);
                  return {
                      id: i,
                      cash_advance_id: advance.id,
                      payroll_period_id: i,
                      payroll_period_name: `Period ${i + 1}`,
                      deduction_amount: installmentAmount,
                      remaining_balance_after: approvedAmount - installmentAmount * (i + 1),
                      is_deducted: i < 1, // First one is deducted, others pending
                      deducted_at: i === 0 ? new Date().toISOString() : undefined,
                  };
              });

    return (
        <div className="space-y-6">
            {/* Overall Progress */}
            <Card className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Deduction Progress</h3>
                    <Badge
                        variant={advance.deduction_status === 'active' ? 'default' : 'secondary'}
                        className={
                            advance.deduction_status === 'active'
                                ? 'bg-blue-100 text-blue-800 border-blue-200'
                                : advance.deduction_status === 'completed'
                                  ? 'bg-green-100 text-green-800 border-green-200'
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                        }
                    >
                        {advance.deduction_status === 'active'
                            ? 'Active'
                            : advance.deduction_status === 'completed'
                              ? 'Completed'
                              : 'Cancelled'}
                    </Badge>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Approved Amount</p>
                        <p className="text-lg font-bold">{formatCurrency(advance.amount_approved ?? 0)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Deducted</p>
                        <p className="text-lg font-bold text-green-600">{formatCurrency(totalDeducted)}</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Remaining Balance</p>
                        <p className="text-lg font-bold text-orange-600">
                            {formatCurrency(advance.remaining_balance)}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Progress</p>
                        <p className="text-lg font-bold">{Math.round(percentageComplete)}%</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <Progress value={percentageComplete} className="h-3" />
                    <p className="text-xs text-muted-foreground">
                        {completedDeductions} of {totalDeductions} periods completed
                    </p>
                </div>

                {/* Early Repayment Option (if balance remaining) */}
                {advance.remaining_balance > 0 && advance.deduction_status === 'active' && onEarlyRepayment && (
                    <div className="pt-2 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={onEarlyRepayment}
                            disabled={isLoading}
                            className="w-full gap-2"
                        >
                            <AlertCircle className="h-4 w-4" />
                            Apply Early Repayment
                        </Button>
                    </div>
                )}
            </Card>

            {/* Deduction Schedule */}
            <Card className="p-6 space-y-4">
                <h3 className="text-lg font-semibold">Deduction Schedule</h3>

                <div className="space-y-3">
                    {displayDeductions.map((deduction) => (
                        <div
                            key={deduction.id}
                            className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                                deduction.is_deducted
                                    ? 'bg-green-50 border-green-200'
                                    : 'bg-orange-50 border-orange-200'
                            }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                {getStatusIcon(deduction)}
                                <div className="flex-1">
                                    <p className="font-medium">{deduction.payroll_period_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {deduction.is_deducted && deduction.deducted_at
                                            ? new Date(deduction.deducted_at).toLocaleDateString()
                                            : 'Pending deduction'}
                                    </p>
                                </div>
                            </div>

                            <div className="text-right">
                                <p className="font-semibold">{formatCurrency(deduction.deduction_amount)}</p>
                                <p className={`text-xs font-medium ${getStatusColor(deduction)}`}>
                                    {deduction.is_deducted ? 'Deducted' : 'Pending'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Total Deductions Remaining</p>
                        <p className="font-semibold text-lg">{formatCurrency(advance.remaining_balance)}</p>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">Installments Remaining</p>
                        <p className="text-sm font-medium">{totalDeductions - completedDeductions}</p>
                    </div>
                </div>
            </Card>

            {/* Schedule Type Info */}
            <Card className="p-4 bg-blue-50 border-blue-200 space-y-2">
                <p className="text-sm font-semibold text-blue-900">Deduction Schedule Type</p>
                <p className="text-sm text-blue-800">
                    {advance.number_of_installments === 1
                        ? `Full amount (${formatCurrency(advance.amount_approved ?? 0)}) will be deducted in a single payroll period.`
                        : `Amount will be deducted in ${advance.number_of_installments} monthly installments of ${formatCurrency((advance.amount_approved ?? 0) / (advance.number_of_installments || 1))} each.`}
                </p>
            </Card>
        </div>
    );
}
