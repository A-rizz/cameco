import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { X, Filter } from 'lucide-react';

export interface LoansFilterState {
    search: string;
    loan_type: string[];
    status: string[];
    department_id?: string;
    loan_date_from?: string;
    loan_date_to?: string;
}

interface LoansFilterProps {
    filters: LoansFilterState;
    onFiltersChange: (filters: LoansFilterState) => void;
    departments: Array<{ id: number; name: string }>;
}

const LOAN_TYPES = [
    { value: 'sss', label: 'SSS Loan' },
    { value: 'pagibig', label: 'Pag-IBIG Loan' },
    { value: 'company', label: 'Company Loan' },
    { value: 'cash_advance', label: 'Cash Advance' },
];

const STATUSES = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'restructured', label: 'Restructured' },
];

export function LoansFilter({
    filters,
    onFiltersChange,
    departments,
}: LoansFilterProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const activeFilterCount = [
        filters.search ? 1 : 0,
        filters.loan_type.length,
        filters.status.length,
        filters.department_id ? 1 : 0,
        filters.loan_date_from || filters.loan_date_to ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    const handleSearch = (value: string) => {
        onFiltersChange({ ...filters, search: value });
    };

    const toggleLoanType = (type: string) => {
        const newTypes = filters.loan_type.includes(type)
            ? filters.loan_type.filter(t => t !== type)
            : [...filters.loan_type, type];
        onFiltersChange({ ...filters, loan_type: newTypes });
    };

    const toggleStatus = (status: string) => {
        const newStatuses = filters.status.includes(status)
            ? filters.status.filter(s => s !== status)
            : [...filters.status, status];
        onFiltersChange({ ...filters, status: newStatuses });
    };

    const resetFilters = () => {
        onFiltersChange({
            search: '',
            loan_type: [],
            status: [],
            department_id: undefined,
            loan_date_from: undefined,
            loan_date_to: undefined,
        });
        setIsExpanded(false);
    };

    return (
        <Card className="space-y-4 p-4">
            {/* Main Filter Bar */}
            <div className="flex items-center gap-2">
                <Input
                    placeholder="Search by employee name or loan #..."
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1"
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-2"
                >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">More Filters</span>
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>
                {activeFilterCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="text-destructive"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Expanded Filter Panel */}
            {isExpanded && (
                <div className="space-y-4 border-t border-border pt-4">
                    {/* Loan Type Filter */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">Loan Type</p>
                        <div className="flex flex-wrap gap-2">
                            {LOAN_TYPES.map((type) => (
                                <Badge
                                    key={type.value}
                                    variant={filters.loan_type.includes(type.value) ? 'default' : 'outline'}
                                    className="cursor-pointer transition-colors hover:opacity-80"
                                    onClick={() => toggleLoanType(type.value)}
                                >
                                    {type.label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">Status</p>
                        <div className="flex flex-wrap gap-2">
                            {STATUSES.map((status) => (
                                <Badge
                                    key={status.value}
                                    variant={filters.status.includes(status.value) ? 'default' : 'outline'}
                                    className="cursor-pointer transition-colors hover:opacity-80"
                                    onClick={() => toggleStatus(status.value)}
                                >
                                    {status.label}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Department Filter */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground">Department</p>
                        <Select
                            value={filters.department_id || 'all'}
                            onValueChange={(value) =>
                                onFiltersChange({
                                    ...filters,
                                    department_id: value === 'all' ? undefined : value,
                                })
                            }
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="All departments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id.toString()}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range Filter */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground">Loan Date From</p>
                            <Input
                                type="date"
                                value={filters.loan_date_from || ''}
                                onChange={(e) =>
                                    onFiltersChange({
                                        ...filters,
                                        loan_date_from: e.target.value || undefined,
                                    })
                                }
                            />
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground">Loan Date To</p>
                            <Input
                                type="date"
                                value={filters.loan_date_to || ''}
                                onChange={(e) =>
                                    onFiltersChange({
                                        ...filters,
                                        loan_date_to: e.target.value || undefined,
                                    })
                                }
                            />
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
