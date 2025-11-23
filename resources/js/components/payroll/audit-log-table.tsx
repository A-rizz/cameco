import React from 'react';
import type { PayrollAuditLog } from '@/types/payroll-pages';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Clock, User, ArrowRight } from 'lucide-react';

interface AuditLogTableProps {
    logs: PayrollAuditLog[];
    onRowClick?: (log: PayrollAuditLog) => void;
}

export function AuditLogTable({ logs, onRowClick }: AuditLogTableProps) {
    const getActionIcon = (action: string) => {
        switch (action) {
            case 'created':
                return '➕';
            case 'updated':
                return '✏️';
            case 'deleted':
                return '🗑️';
            case 'calculated':
                return '🧮';
            case 'approved':
                return '✅';
            case 'rejected':
                return '❌';
            case 'finalized':
                return '📋';
            default:
                return '📝';
        }
    };

    const getActionBadgeVariant = (color: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (color) {
            case 'green':
                return 'default';
            case 'blue':
                return 'secondary';
            case 'red':
                return 'destructive';
            case 'yellow':
                return 'outline';
            default:
                return 'default';
        }
    };

    const getEntityBadge = (entityType: string) => {
        const badges: Record<string, { label: string; bg: string }> = {
            'PayrollPeriod': { label: 'Period', bg: 'bg-blue-100 text-blue-800' },
            'PayrollCalculation': { label: 'Calculation', bg: 'bg-purple-100 text-purple-800' },
            'PayrollAdjustment': { label: 'Adjustment', bg: 'bg-orange-100 text-orange-800' },
            'SalaryComponent': { label: 'Component', bg: 'bg-green-100 text-green-800' },
            'EmployeePayrollInfo': { label: 'Employee Info', bg: 'bg-indigo-100 text-indigo-800' },
        };

        const badge = badges[entityType] || { label: entityType, bg: 'bg-gray-100 text-gray-800' };
        return badge;
    };

    if (logs.length === 0) {
        return (
            <Card className="border-0 bg-gray-50 p-12 text-center">
                <Clock className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">No audit logs found</p>
                <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or date range</p>
            </Card>
        );
    }

    return (
        <Card className="border-0 overflow-hidden bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Action</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Entity</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">User</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Date & Time</th>
                            <th className="px-6 py-3 text-left font-semibold text-gray-900">Changes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {logs.map((log) => {
                            const entityBadge = getEntityBadge(log.entity_type);

                            return (
                                <tr
                                    key={log.id}
                                    onClick={() => onRowClick?.(log)}
                                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    {/* Action Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{getActionIcon(log.action)}</span>
                                            <Badge
                                                variant={getActionBadgeVariant(log.action_color)}
                                                className="capitalize"
                                            >
                                                {log.action_label}
                                            </Badge>
                                        </div>
                                    </td>

                                    {/* Entity Column */}
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className={`inline-block px-2.5 py-0.5 rounded text-xs font-medium ${entityBadge.bg}`}>
                                                {entityBadge.label}
                                            </div>
                                            <p className="text-gray-900 font-medium">{log.entity_name}</p>
                                            <p className="text-xs text-gray-500">ID: {log.entity_id}</p>
                                        </div>
                                    </td>

                                    {/* User Column */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2">
                                            <User className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-gray-900 font-medium">{log.user_name}</p>
                                                <p className="text-xs text-gray-500">{log.user_email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Date & Time Column */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-start gap-2">
                                            <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-gray-900 font-medium">{log.formatted_date}</p>
                                                <p className="text-xs text-gray-500">{log.formatted_time}</p>
                                                <p className="text-xs text-gray-400 mt-1">{log.relative_time}</p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Changes Column */}
                                    <td className="px-6 py-4">
                                        {log.has_changes ? (
                                            <div className="flex items-center gap-1">
                                                <span className="text-gray-600 text-xs line-clamp-2">
                                                    {log.changes_summary}
                                                </span>
                                                <ArrowRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 text-xs">No changes</span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Table Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex items-center justify-between text-xs text-gray-600">
                <div>
                    Showing <span className="font-semibold">{logs.length}</span> audit{logs.length === 1 ? ' log' : ' logs'}
                </div>
                <div>
                    Total records may be paginated in production
                </div>
            </div>
        </Card>
    );
}
