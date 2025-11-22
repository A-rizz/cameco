import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';

interface RegisterFilterProps {
    periods: Array<{ id: number; name: string }>;
    departments: Array<{ id: number; name: string }>;
    employeeStatuses: Array<{ id: string; label: string }>;
    salaryComponents: Array<{ id: number; code: string; name: string }>;
    currentFilters: {
        period_id: string;
        department_id: string;
        employee_status: string;
        component_filter: string;
        search: string;
    };
    onFilterChange: (filters: any) => void;
    isLoading?: boolean;
}

export default function RegisterFilter({
    periods,
    departments,
    employeeStatuses,
    salaryComponents,
    currentFilters,
    onFilterChange,
    isLoading = false,
}: RegisterFilterProps) {
    const [localFilters, setLocalFilters] = useState(currentFilters);

    const handleInputChange = (field: string, value: string) => {
        setLocalFilters(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleApplyFilters = () => {
        onFilterChange(localFilters);
    };

    const handleResetFilters = () => {
        const defaultFilters = {
            period_id: 'all',
            department_id: 'all',
            employee_status: 'all',
            component_filter: 'all',
            search: '',
        };
        setLocalFilters(defaultFilters);
        onFilterChange(defaultFilters);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Filters</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Search */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Search by Name or Employee #</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search..."
                                value={localFilters.search}
                                onChange={(e) => handleInputChange('search', e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Period Selection */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Payroll Period</label>
                        <Select
                            value={localFilters.period_id}
                            onValueChange={(value) => handleInputChange('period_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select period..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Periods</SelectItem>
                                {periods.map((period) => (
                                    <SelectItem key={period.id} value={period.id.toString()}>
                                        {period.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Department Filter */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Department</label>
                        <Select
                            value={localFilters.department_id}
                            onValueChange={(value) => handleInputChange('department_id', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select department..." />
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

                    {/* Employee Status Filter */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Employee Status</label>
                        <Select
                            value={localFilters.employee_status}
                            onValueChange={(value) => handleInputChange('employee_status', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {employeeStatuses.map((status) => (
                                    <SelectItem key={status.id} value={status.id}>
                                        {status.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Component Filter */}
                    <div>
                        <label className="text-sm font-medium mb-2 block">Salary Component</label>
                        <Select
                            value={localFilters.component_filter}
                            onValueChange={(value) => handleInputChange('component_filter', value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select component..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Components</SelectItem>
                                {salaryComponents.map((comp) => (
                                    <SelectItem key={comp.id} value={comp.id.toString()}>
                                        {comp.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            onClick={handleApplyFilters}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            {isLoading ? 'Applying...' : 'Apply Filters'}
                        </Button>
                        <Button
                            onClick={handleResetFilters}
                            variant="outline"
                            className="flex-1"
                        >
                            Reset
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
