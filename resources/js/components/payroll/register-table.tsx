import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { PayrollRegisterEmployee } from '@/types/payroll-pages';

interface RegisterTableProps {
    employees: PayrollRegisterEmployee[];
    isLoading?: boolean;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800';
        case 'on_leave':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
    }).format(amount);
};

export default function RegisterTable({ employees, isLoading = false }: RegisterTableProps) {
    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="text-center">
                        <p className="text-gray-500 text-sm">Loading payroll register...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (employees.length === 0) {
        return (
            <Card>
                <CardContent className="py-12">
                    <div className="text-center">
                        <p className="text-gray-500 text-sm mb-2">No employees found</p>
                        <p className="text-gray-400 text-xs">Adjust your filters to view payroll records</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Payroll Register - {employees.length} Employee(s)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="text-xs font-semibold">Employee</TableHead>
                                <TableHead className="text-xs font-semibold">Employee #</TableHead>
                                <TableHead className="text-xs font-semibold">Department</TableHead>
                                <TableHead className="text-xs font-semibold">Status</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Basic Salary</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Overtime</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Allowances</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Gross Pay</TableHead>
                                <TableHead className="text-xs font-semibold text-right">SSS</TableHead>
                                <TableHead className="text-xs font-semibold text-right">PhilHealth</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Pag-IBIG</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Tax</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Total Ded.</TableHead>
                                <TableHead className="text-xs font-semibold text-right">Net Pay</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.map((emp) => (
                                <TableRow key={emp.id} className="hover:bg-gray-50">
                                    <TableCell className="text-sm font-medium">{emp.full_name}</TableCell>
                                    <TableCell className="text-sm text-gray-600">{emp.employee_number}</TableCell>
                                    <TableCell className="text-sm text-gray-600">{emp.department_name}</TableCell>
                                    <TableCell>
                                        <Badge className={`text-xs font-semibold ${getStatusColor(emp.status)}`}>
                                            {emp.status === 'on_leave' ? 'On Leave' : emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-right font-medium text-gray-900">
                                        {formatCurrency(emp.basic_salary)}
                                    </TableCell>
                                    <TableCell className="text-sm text-right text-gray-600">
                                        {formatCurrency(emp.overtime)}
                                    </TableCell>
                                    <TableCell className="text-sm text-right text-gray-600">
                                        {formatCurrency(emp.rice_allowance + emp.cola)}
                                    </TableCell>
                                    <TableCell className="text-sm text-right font-medium text-blue-600">
                                        {formatCurrency(emp.gross_pay)}
                                    </TableCell>
                                    <TableCell className="text-sm text-right text-gray-600">
                                        {formatCurrency(emp.sss)}
                                    </TableCell>
                                    <TableCell className="text-sm text-right text-gray-600">
                                        {formatCurrency(emp.philhealth)}
                                    </TableCell>
                                    <TableCell className="text-sm text-right text-gray-600">
                                        {formatCurrency(emp.pagibig)}
                                    </TableCell>
                                    <TableCell className="text-sm text-right text-gray-600">
                                        {formatCurrency(emp.withholding_tax)}
                                    </TableCell>
                                    <TableCell className="text-sm text-right text-orange-600">
                                        {formatCurrency(emp.total_deductions)}
                                    </TableCell>
                                    <TableCell className="text-sm text-right font-semibold text-green-600">
                                        {formatCurrency(emp.net_pay)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
