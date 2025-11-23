import { CashAdvance } from '@/types/payroll-pages';
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
import {
    MoreHorizontal,
    Eye,
    Edit,
    Check,
    X,
    CheckCircle2,
    AlertCircle,
    Clock,
    XCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AdvancesListTableProps {
    advances: CashAdvance[];
    onView: (advance: CashAdvance) => void;
    onApprove: (advance: CashAdvance) => void;
    onReject: (advance: CashAdvance) => void;
    onEdit: (advance: CashAdvance) => void;
    onComplete: (advance: CashAdvance) => void;
    isLoading?: boolean;
}

const approvalStatusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
    pending: {
        label: 'Pending',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Clock,
    },
    approved: {
        label: 'Approved',
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Rejected',
        color: 'bg-red-100 text-red-800',
        icon: XCircle,
    },
};

const deductionStatusConfig: Record<string, { label: string; color: string }> = {
    active: { label: 'Active', color: 'bg-green-100 text-green-800' },
    completed: { label: 'Completed', color: 'bg-blue-100 text-blue-800' },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800' },
};

export function AdvancesListTable({
    advances,
    onView,
    onApprove,
    onReject,
    onEdit,
    onComplete,
    isLoading = false,
}: AdvancesListTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-4 rounded-lg border border-border bg-card p-6">
                <div className="h-10 animate-pulse rounded bg-muted" />
                <div className="h-10 animate-pulse rounded bg-muted" />
                <div className="h-10 animate-pulse rounded bg-muted" />
            </div>
        );
    }

    if (advances.length === 0) {
        return (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 p-8">
                <AlertCircle className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-center text-sm text-muted-foreground">No advances found</p>
                <p className="text-center text-xs text-muted-foreground">Create a new advance request to get started</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <Table>
                <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                        <TableHead>Employee</TableHead>
                        <TableHead>Advance Type</TableHead>
                        <TableHead className="text-right">Amount Requested</TableHead>
                        <TableHead className="text-right">Amount Approved</TableHead>
                        <TableHead>Approval Status</TableHead>
                        <TableHead>Deduction Status</TableHead>
                        <TableHead className="text-right">Balance</TableHead>
                        <TableHead>Approval Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {advances.map((advance) => {
                        const approvalStatus =
                            approvalStatusConfig[advance.approval_status as keyof typeof approvalStatusConfig];
                        const deductionStatus =
                            deductionStatusConfig[advance.deduction_status as keyof typeof deductionStatusConfig];
                        const ApprovalIcon = approvalStatus?.icon || AlertCircle;

                        return (
                            <TableRow key={advance.id} className="border-border hover:bg-muted/50">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{advance.employee_name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {advance.employee_number}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm font-medium">{advance.advance_type}</span>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                    {formatCurrency(advance.amount_requested)}
                                </TableCell>
                                <TableCell className="text-right">
                                    {advance.amount_approved ? (
                                        <span className="font-medium">
                                            {formatCurrency(advance.amount_approved)}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <ApprovalIcon className="h-4 w-4" />
                                        <Badge
                                            variant="outline"
                                            className={approvalStatus?.color || ''}
                                        >
                                            {approvalStatus?.label || advance.approval_status}
                                        </Badge>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={deductionStatus?.color || ''}>
                                        {deductionStatus?.label || advance.deduction_status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <span className="font-medium">{formatCurrency(advance.remaining_balance)}</span>
                                </TableCell>
                                <TableCell className="text-sm">
                                    {advance.approved_at
                                        ? new Date(advance.approved_at).toLocaleDateString('en-US', {
                                              month: 'short',
                                              day: 'numeric',
                                              year: 'numeric',
                                          })
                                        : '—'}
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
                                            <DropdownMenuItem
                                                onClick={() => onView(advance)}
                                                className="cursor-pointer"
                                            >
                                                <Eye className="mr-2 h-4 w-4" />
                                                View Details
                                            </DropdownMenuItem>

                                            {advance.approval_status === 'pending' && (
                                                <>
                                                    <DropdownMenuItem
                                                        onClick={() => onApprove(advance)}
                                                        className="cursor-pointer text-green-600 focus:text-green-600"
                                                    >
                                                        <Check className="mr-2 h-4 w-4" />
                                                        Approve
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => onReject(advance)}
                                                        className="cursor-pointer text-destructive focus:text-destructive"
                                                    >
                                                        <X className="mr-2 h-4 w-4" />
                                                        Reject
                                                    </DropdownMenuItem>
                                                </>
                                            )}

                                            {advance.approval_status === 'approved' &&
                                                advance.deduction_status === 'active' && (
                                                    <DropdownMenuItem
                                                        onClick={() => onComplete(advance)}
                                                        className="cursor-pointer text-blue-600 focus:text-blue-600"
                                                    >
                                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                                        Mark Completed
                                                    </DropdownMenuItem>
                                                )}

                                            {advance.approval_status === 'pending' && (
                                                <DropdownMenuItem
                                                    onClick={() => onEdit(advance)}
                                                    className="cursor-pointer"
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
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
