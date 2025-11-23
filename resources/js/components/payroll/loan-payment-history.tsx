import { LoanPayment } from '@/types/payroll-pages';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface LoanPaymentHistoryProps {
    payments: LoanPayment[];
    totalInstallments: number;
}

const statusConfig = {
    paid: {
        label: 'Paid',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle2,
    },
    pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
    },
    overdue: {
        label: 'Overdue',
        color: 'bg-red-100 text-red-800',
        icon: AlertCircle,
    },
};

export function LoanPaymentHistory({
    payments,
    totalInstallments,
}: LoanPaymentHistoryProps) {
    if (payments.length === 0) {
        return (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 p-8">
                <AlertCircle className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-center text-sm text-muted-foreground">No payment history</p>
            </div>
        );
    }

    const paidCount = payments.filter(p => p.is_paid).length;
    const completionPercentage = (paidCount / totalInstallments) * 100;

    return (
        <div className="space-y-4">
            {/* Progress Summary */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Installments Paid</span>
                    <span className="text-muted-foreground">{paidCount} of {totalInstallments}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all"
                        style={{ width: `${Math.min(completionPercentage, 100)}%` }}
                    />
                </div>
                <p className="text-xs text-muted-foreground">
                    {completionPercentage.toFixed(0)}% complete
                </p>
            </div>

            {/* Payment Table */}
            <div className="overflow-x-auto rounded-lg border border-border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="w-20">Period</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Principal</TableHead>
                            <TableHead className="text-right">Interest</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {payments.map((payment, index) => {
                            const status = payment.is_paid ? 'paid' : 'pending';
                            const statusConfig_ = statusConfig[status as keyof typeof statusConfig];
                            const StatusIcon = statusConfig_?.icon;

                            return (
                                <TableRow key={payment.id} className="border-border hover:bg-muted/50">
                                    <TableCell className="text-sm font-medium">
                                        {payment.payroll_period_name}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(payment.payment_amount)}
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                        {formatCurrency(payment.principal_payment)}
                                    </TableCell>
                                    <TableCell className="text-right text-sm">
                                        {formatCurrency(payment.interest_payment)}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {formatCurrency(payment.balance_after_payment)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {StatusIcon && <StatusIcon className="h-4 w-4" />}
                                            <Badge
                                                variant="outline"
                                                className={statusConfig_?.color || ''}
                                            >
                                                {statusConfig_?.label}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
