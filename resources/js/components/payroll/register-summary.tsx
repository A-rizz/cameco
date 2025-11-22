import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, TrendingDown } from 'lucide-react';
import type { PayrollRegisterSummary, DepartmentBreakdown } from '@/types/payroll-pages';

interface RegisterSummaryProps {
    summary: PayrollRegisterSummary;
    departmentBreakdown: DepartmentBreakdown[];
}

interface MetricCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    subtext?: string;
    color: 'blue' | 'green' | 'orange' | 'purple';
}

const MetricCard = ({ icon, title, value, subtext, color }: MetricCardProps) => {
    const bgColor = {
        blue: 'bg-blue-50',
        green: 'bg-green-50',
        orange: 'bg-orange-50',
        purple: 'bg-purple-50',
    }[color];

    const iconColor = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        orange: 'text-orange-600',
        purple: 'text-purple-600',
    }[color];

    return (
        <div className={`${bgColor} rounded-lg p-4`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-600 font-medium">{title}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
                    {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
                </div>
                <div className={`${iconColor} h-10 w-10`}>{icon}</div>
            </div>
        </div>
    );
};

export default function RegisterSummary({ summary, departmentBreakdown }: RegisterSummaryProps) {
    return (
        <div className="space-y-6">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <MetricCard
                    icon={<Users className="h-6 w-6" />}
                    title="Total Employees"
                    value={summary.total_employees.toString()}
                    color="blue"
                />
                <MetricCard
                    icon={<DollarSign className="h-6 w-6" />}
                    title="Total Gross Pay"
                    value={summary.formatted_total_gross_pay}
                    color="green"
                />
                <MetricCard
                    icon={<TrendingDown className="h-6 w-6" />}
                    title="Total Deductions"
                    value={summary.formatted_total_deductions}
                    color="orange"
                />
                <MetricCard
                    icon={<DollarSign className="h-6 w-6" />}
                    title="Total Net Pay"
                    value={summary.formatted_total_net_pay}
                    color="green"
                />
            </div>

            {/* Department Breakdown */}
            {departmentBreakdown.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Department Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b bg-gray-50">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Department</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Employees</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Gross Pay</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Deductions</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Net Pay</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Average Net</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {departmentBreakdown.map((dept) => (
                                        <tr key={dept.department_id} className="border-b hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-900">
                                                {dept.department_name}
                                            </td>
                                            <td className="text-right py-3 px-4 text-gray-600">
                                                {dept.employee_count}
                                            </td>
                                            <td className="text-right py-3 px-4 text-gray-900 font-medium">
                                                {dept.formatted_gross_pay}
                                            </td>
                                            <td className="text-right py-3 px-4 text-gray-600">
                                                {dept.formatted_deductions}
                                            </td>
                                            <td className="text-right py-3 px-4 text-green-600 font-semibold">
                                                {dept.formatted_net_pay}
                                            </td>
                                            <td className="text-right py-3 px-4 text-blue-600 font-medium">
                                                {dept.formatted_average_net_pay}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
