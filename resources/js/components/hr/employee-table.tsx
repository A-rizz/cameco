import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { EmployeeStatusBadge } from './employee-status-badge';
import { EmployeeArchiveDialog } from './employee-archive-dialog';
import { EmployeeRestoreDialog } from './employee-restore-dialog';
import { Link, router } from '@inertiajs/react';
import {
    MoreHorizontal,
    Eye,
    Edit,
    Archive,
    RotateCcw,
    ChevronUp,
    ChevronDown,
    ChevronsUpDown
} from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Employee {
    id: number;
    employee_number: string;
    profile: {
        first_name: string;
        last_name: string;
        middle_name?: string;
        profile_picture_path?: string | null;
    };
    department?: {
        id: number;
        name: string;
    };
    position?: {
        id: number;
        title: string;
    };
    status: 'active' | 'on_leave' | 'terminated' | 'archived' | 'suspended';
    employment_type: string;
    date_hired: string;
    deleted_at?: string;
}

interface EmployeeTableProps {
    employees: Employee[];
    onSort?: (column: string, direction: 'asc' | 'desc') => void;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
}

// ============================================================================
// Helper Functions
// ============================================================================

function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

function getFullName(employee: Employee): string {
    const { first_name, middle_name, last_name } = employee.profile;
    return middle_name
        ? `${first_name} ${middle_name} ${last_name}`
        : `${first_name} ${last_name}`;
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatEmploymentType(type: string): string {
    return type
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// ============================================================================
// Sort Icon Component
// ============================================================================

function SortIcon({
    column,
    sortColumn,
    sortDirection
}: {
    column: string;
    sortColumn?: string;
    sortDirection?: 'asc' | 'desc';
}) {
    if (sortColumn !== column) {
        return <ChevronsUpDown className="h-4 w-4 ml-1 text-muted-foreground" />;
    }
    return sortDirection === 'asc'
        ? <ChevronUp className="h-4 w-4 ml-1" />
        : <ChevronDown className="h-4 w-4 ml-1" />;
}

// ============================================================================
// Component
// ============================================================================

export function EmployeeTable({
    employees,
    onSort,
    sortColumn,
    sortDirection
}: EmployeeTableProps) {
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const handleSort = (column: string) => {
        if (!onSort) return;

        const newDirection =
            sortColumn === column && sortDirection === 'asc'
                ? 'desc'
                : 'asc';

        onSort(column, newDirection);
    };

    const openArchiveDialog = (employee: Employee) => {
        setSelectedEmployee(employee);
        setArchiveDialogOpen(true);
    };

    const openRestoreDialog = (employee: Employee) => {
        setSelectedEmployee(employee);
        setRestoreDialogOpen(true);
    };

    if (employees.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center border-none bg-muted/20 rounded-xl mx-6 my-6">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-6 ring-8 ring-muted/10">
                    <Archive className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">No personnel records found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm">
                    We couldn't find any employees matching your current search criteria. Try broadening your filters.
                </p>
                <Link href="/hr/employees/create">
                    <Button className="shadow-lg shadow-primary/20">Add First Employee</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full">
            <Table>
                <TableHeader className="bg-muted/50">
                    <TableRow className="hover:bg-transparent border-b">
                        <TableHead className="w-4 px-4">
                            {/* Selection placeholder */}
                        </TableHead>
                        <TableHead
                            className="cursor-pointer transition-colors hover:text-primary py-4"
                            onClick={() => handleSort('employee_number')}
                        >
                            <div className="flex items-center text-xs font-bold uppercase tracking-wider">
                                ID CODE
                                <SortIcon
                                    column="employee_number"
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                />
                            </div>
                        </TableHead>
                        <TableHead
                            className="cursor-pointer transition-colors hover:text-primary"
                            onClick={() => handleSort('name')}
                        >
                            <div className="flex items-center text-xs font-bold uppercase tracking-wider">
                                PROFESSIONAL
                                <SortIcon
                                    column="name"
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                />
                            </div>
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">BUSINESS UNIT</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">DESIGNATION</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">CONTRACT</TableHead>
                        <TableHead
                            className="cursor-pointer transition-colors hover:text-primary"
                            onClick={() => handleSort('date_hired')}
                        >
                            <div className="flex items-center text-xs font-bold uppercase tracking-wider">
                                JOIN DATE
                                <SortIcon
                                    column="date_hired"
                                    sortColumn={sortColumn}
                                    sortDirection={sortDirection}
                                />
                            </div>
                        </TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider text-center">STATUS</TableHead>
                        <TableHead className="text-right px-6"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.map((employee) => (
                        <TableRow
                            key={employee.id}
                            className="group hover:bg-primary/[0.02] active:bg-primary/[0.05] transition-all cursor-pointer border-b last:border-0"
                            onClick={() => router.visit(`/hr/employees/${employee.id}`)}
                        >
                            <TableCell className="px-4" onClick={(e) => e.stopPropagation()}>
                                {/* Selection checkbox */}
                            </TableCell>
                            <TableCell className="font-mono text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                                {employee.employee_number}
                            </TableCell>
                            <TableCell className="py-4">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-10 w-10 border-2 border-background shadow-sm ring-1 ring-border group-hover:ring-primary/30 transition-all">
                                        {employee.profile.profile_picture_path && (
                                            <AvatarImage
                                                src={`/storage/${employee.profile.profile_picture_path}`}
                                                alt={getFullName(employee)}
                                                className="object-cover"
                                            />
                                        )}
                                        <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                                            {getInitials(
                                                employee.profile.first_name,
                                                employee.profile.last_name
                                            )}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                                            {getFullName(employee)}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-tight">
                                            {employee.position?.title || 'GENERAL STAFF'}
                                        </span>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">
                                        {employee.department?.name || 'Unassigned'}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
                                        Department
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className="text-sm font-medium text-muted-foreground">
                                    {employee.position?.title || 'N/A'}
                                </span>
                            </TableCell>
                            <TableCell>
                                <Badge variant="secondary" className="bg-muted/50 text-[10px] uppercase font-bold tracking-wider px-2 py-0">
                                    {formatEmploymentType(employee.employment_type)}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                                {formatDate(employee.date_hired)}
                            </TableCell>
                            <TableCell className="text-center">
                                <EmployeeStatusBadge status={employee.status} className="mx-auto" />
                            </TableCell>
                            <TableCell className="text-right px-6" onClick={(e) => e.stopPropagation()}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <span className="sr-only">Open menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-48 shadow-xl border-none">
                                        <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-3 py-2">Operational Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild className="cursor-pointer px-3 py-2">
                                            <Link href={`/hr/employees/${employee.id}`} className="flex items-center w-full">
                                                <Eye className="mr-3 h-4 w-4 text-blue-500" />
                                                <span className="font-medium">View Profile</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        {!employee.deleted_at && (
                                            <>
                                                <DropdownMenuItem asChild className="cursor-pointer px-3 py-2">
                                                    <Link href={`/hr/employees/${employee.id}/edit`} className="flex items-center w-full">
                                                        <Edit className="mr-3 h-4 w-4 text-orange-500" />
                                                        <span className="font-medium">Edit Profile</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive cursor-pointer px-3 py-2 focus:bg-destructive/10"
                                                    onClick={() => openArchiveDialog(employee)}
                                                >
                                                    <Archive className="mr-3 h-4 w-4" />
                                                    <span className="font-medium">Archive Record</span>
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                        {employee.deleted_at && (
                                            <DropdownMenuItem
                                                onClick={() => openRestoreDialog(employee)}
                                                className="cursor-pointer px-3 py-2 text-green-600 focus:bg-green-50"
                                            >
                                                <RotateCcw className="mr-3 h-4 w-4" />
                                                <span className="font-medium">Restore Intel</span>
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Archive Confirmation Dialog */}
            {selectedEmployee && (
                <EmployeeArchiveDialog
                    open={archiveDialogOpen}
                    onOpenChange={setArchiveDialogOpen}
                    employeeId={selectedEmployee.id}
                    employeeName={getFullName(selectedEmployee)}
                    employeeNumber={selectedEmployee.employee_number}
                />
            )}

            {/* Restore Confirmation Dialog */}
            {selectedEmployee && (
                <EmployeeRestoreDialog
                    open={restoreDialogOpen}
                    onOpenChange={setRestoreDialogOpen}
                    employeeId={selectedEmployee.id}
                    employeeName={getFullName(selectedEmployee)}
                    employeeNumber={selectedEmployee.employee_number}
                />
            )}
        </div>
    );
}

