import { EmployeeLoan } from '@/types/payroll-pages';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Eye, Edit, Trash2, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface LoansListTableProps {
    loans: EmployeeLoan[];
    onView: (loan: EmployeeLoan) => void;
    onEdit: (loan: EmployeeLoan) => void;
    onDelete: (loan: EmployeeLoan) => void;
    isLoading?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
    active: {
        label: 'Active',
        color: 'bg-blue-100 text-blue-800',
        icon: Clock,
    },
    completed: {
        label: 'Completed',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle2,
    },
    cancelled: {
        label: 'Cancelled',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
    },
    restructured: {
        label: 'Restructured',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertCircle,
    },
};

const loanTypeConfig: Record<string, { label: string; color: string }> = {
    sss: { label: 'SSS Loan', color: 'bg-indigo-100 text-indigo-800' },
    pagibig: { label: 'Pag-IBIG Loan', color: 'bg-purple-100 text-purple-800' },
    company: { label: 'Company Loan', color: 'bg-orange-100 text-orange-800' },
    cash_advance: { label: 'Cash Advance', color: 'bg-pink-100 text-pink-800' },
};

export function LoansListTable({
    loans,
    onView,
    onEdit,
    onDelete,
    isLoading = false,
}: LoansListTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-4 rounded-lg border border-border bg-card p-6">
                <div className="h-10 animate-pulse rounded bg-muted" />
                <div className="h-10 animate-pulse rounded bg-muted" />
                <div className="h-10 animate-pulse rounded bg-muted" />
            </div>
        );
    }

    if (loans.length === 0) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 p-8">
                <AlertCircle className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-center text-sm text-muted-foreground">No loans found</p>
                <p className="text-center text-xs text-muted-foreground">Create a new loan to get started</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Employee</TableHead>
                        <TableHead>Loan Type</TableHead>
                        <TableHead>Loan #</TableHead>
                        <TableHead className="text-right">Principal</TableHead>
                        <TableHead className="text-right">Interest</TableHead>
                        <TableHead className="text-center">Installments</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Maturity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {loans.map((loan) => {
                        const statusConfig_ = statusConfig[loan.status as keyof typeof statusConfig];
                        const loanTypeConfig_ = loanTypeConfig[loan.loan_type as keyof typeof loanTypeConfig];
                        const StatusIcon = statusConfig_?.icon || AlertCircle;

                        return (
                            <TableRow key={loan.id} className="border-border hover:bg-muted/50">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{loan.employee_name}</span>
                                        <span className="text-xs text-muted-foreground">{loan.employee_number}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={loanTypeConfig_?.color || 'bg-gray-100 text-gray-800'}>
                                        {loanTypeConfig_?.label || loan.loan_type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="font-mono text-sm">{loan.loan_number}</span>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(loan.principal_amount)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {loan.interest_rate ? `${loan.interest_rate}%` : '—'}
                                </TableCell>
                                <TableCell className="text-center text-sm">
                                    <span className="font-medium">
                                        {loan.installments_paid}/{loan.number_of_installments}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="font-medium text-foreground">
                                        {formatCurrency(loan.remaining_balance)}
                                    </span>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {new Date(loan.maturity_date).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <StatusIcon className="h-4 w-4" />
                                        <Badge variant="outline" className={statusConfig_?.color || ''}>
                                            {statusConfig_?.label || loan.status}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem onClick={() => onView(loan)} className="cursor-pointer">
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>
                                            {loan.status === 'active' && (
                                                <DropdownMenuItem onClick={() => onEdit(loan)} className="cursor-pointer">
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </DropdownMenuItem>
                                            )}
                                            {loan.status === 'active' && (
                                                <DropdownMenuItem
                                                    onClick={() => onDelete(loan)}
                                                    className="cursor-pointer text-destructive focus:text-destructive"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Cancel
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
