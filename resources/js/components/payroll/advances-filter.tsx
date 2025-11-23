import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronDown, X } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface AdvancesFilterProps {
    onFilter: (filters: FilterValues) => void;
    isExpanded?: boolean;
}

export interface FilterValues {
    search: string;
    status: string;
    department: string;
    dateFrom: string;
    dateTo: string;
    amountFrom: number | null;
    amountTo: number | null;
}

const DEFAULT_FILTERS: FilterValues = {
    search: '',
    status: '',
    department: '',
    dateFrom: '',
    dateTo: '',
    amountFrom: null,
    amountTo: null,
};

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending Approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'active', label: 'Active Deduction' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const DEPARTMENT_OPTIONS = [
    { value: 'engineering', label: 'Engineering' },
    { value: 'finance', label: 'Finance' },
    { value: 'hr', label: 'Human Resources' },
    { value: 'operations', label: 'Operations' },
    { value: 'sales', label: 'Sales' },
    { value: 'marketing', label: 'Marketing' },
];

export function AdvancesFilter({ onFilter, isExpanded = false }: AdvancesFilterProps) {
    const [filters, setFilters] = useState<FilterValues>(DEFAULT_FILTERS);
    const [open, setOpen] = useState(isExpanded);

    const activeFilterCount = [
        filters.search,
        filters.status,
        filters.department,
        filters.dateFrom,
        filters.dateTo,
        filters.amountFrom,
        filters.amountTo,
    ].filter(Boolean).length;

    const handleFilterChange = (key: keyof FilterValues, value: string | number | null) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        onFilter(newFilters);
    };

    const handleReset = () => {
        setFilters(DEFAULT_FILTERS);
        onFilter(DEFAULT_FILTERS);
    };

    return (
        <div className="w-full space-y-3">
            <Button 
                variant="outline" 
                className="gap-2 w-full sm:w-auto"
                onClick={() => setOpen(!open)}
            >
                <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                Filter Advances
                {activeFilterCount > 0 && (
                    <span className="ml-1 inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                        {activeFilterCount}
                    </span>
                )}
            </Button>

            {open && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/30">
                <div className="space-y-2">
                    <Label>Search by Name or Number</Label>
                    <Input
                        placeholder="Employee name or number..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status_filter">Status</Label>
                    <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
                        <SelectTrigger id="status_filter">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="department_filter">Department</Label>
                    <Select value={filters.department || 'all'} onValueChange={(value) => handleFilterChange('department', value === 'all' ? '' : value)}>
                        <SelectTrigger id="department_filter">
                            <SelectValue placeholder="All Departments" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            {DEPARTMENT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Request Date Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Input
                                type="date"
                                value={filters.dateFrom}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                placeholder="From"
                                className="text-xs"
                            />
                        </div>
                        <div>
                            <Input
                                type="date"
                                value={filters.dateTo}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                placeholder="To"
                                className="text-xs"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Amount Range</Label>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Input
                                type="number"
                                step="100"
                                placeholder="Min amount"
                                value={filters.amountFrom || ''}
                                onChange={(e) =>
                                    handleFilterChange('amountFrom', e.target.value ? parseFloat(e.target.value) : null)
                                }
                            />
                        </div>
                        <div>
                            <Input
                                type="number"
                                step="100"
                                placeholder="Max amount"
                                value={filters.amountTo || ''}
                                onChange={(e) =>
                                    handleFilterChange('amountTo', e.target.value ? parseFloat(e.target.value) : null)
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    {activeFilterCount > 0 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                            className="flex-1 gap-1"
                        >
                            <X className="h-3 w-3" />
                            Clear All
                        </Button>
                    )}
                </div>
                </div>
            )}
        </div>
    );
}
