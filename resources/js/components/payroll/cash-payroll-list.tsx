import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ChevronRight } from 'lucide-react';
import type { CashEmployee } from '@/types/payroll-pages';

interface CashPayrollListProps {
    employees: CashEmployee[];
    selectedEmployees: number[];
    onSelectEmployee: (employeeId: number) => void;
}

export default function CashPayrollList({
    employees,
    selectedEmployees,
    onSelectEmployee,
}: CashPayrollListProps) {
    if (employees.length === 0) {
        return (
            <Card>
                <CardContent className="pt-8 text-center">
                    <p className="text-muted-foreground">No cash payment employees found</p>
                </CardContent>
            </Card>
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'gray':
                return 'bg-gray-100 text-gray-800';
            case 'yellow':
                return 'bg-yellow-100 text-yellow-800';
            case 'blue':
                return 'bg-blue-100 text-blue-800';
            case 'green':
                return 'bg-green-100 text-green-800';
            case 'red':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Cash Employees List</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {employees.map((employee) => (
                        <div
                            key={employee.id}
                            className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => onSelectEmployee(employee.id)}
                        >
                            <Checkbox
                                checked={selectedEmployees.includes(employee.id)}
                                onCheckedChange={() => onSelectEmployee(employee.id)}
                                onClick={(e) => e.stopPropagation()}
                            />

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900">{employee.employee_name}</span>
                                    <span className="text-xs text-gray-500">({employee.employee_number})</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                    <span>{employee.department}</span>
                                    <span className="text-xs">•</span>
                                    <span>{employee.position}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className={getStatusColor(employee.envelope_status_color)}>
                                    {employee.envelope_status_label}
                                </Badge>
                                <Badge
                                    variant="outline"
                                    className={getStatusColor(
                                        employee.distribution_status === 'pending'
                                            ? 'gray'
                                            : employee.distribution_status === 'distributed'
                                              ? 'yellow'
                                              : employee.distribution_status === 'unclaimed'
                                                ? 'red'
                                                : 'green'
                                    )}
                                >
                                    {employee.distribution_status_label}
                                </Badge>
                            </div>

                            <div className="text-right min-w-[100px]">
                                <div className="font-semibold text-gray-900">{employee.formatted_net_pay}</div>
                                <div className="text-xs text-gray-500">Cash</div>
                            </div>

                            <ChevronRight className="h-4 w-4 text-gray-400" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
