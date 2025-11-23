import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import type { PayrollAuditPageProps } from '@/types/payroll-pages';
import { AuditLogTable } from '@/components/payroll/audit-log-table';
import { ChangeHistoryComponent } from '@/components/payroll/change-history';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, RotateCcw, Search, Filter } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Reports',
        href: '/payroll/reports',
    },
    {
        title: 'Audit Trail',
        href: '/payroll/reports/audit',
    },
];

export default function AuditTrailIndex({
    auditLogs,
    changeHistory,
}: PayrollAuditPageProps) {
    const [activeTab, setActiveTab] = useState<'logs' | 'changes'>('logs');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAction, setSelectedAction] = useState<string>('');
    const [selectedEntity, setSelectedEntity] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<string>('');

    // Get unique values for filters
    const uniqueActions = Array.from(
        new Set(auditLogs.map((log) => log.action)),
    ).sort();
    const uniqueEntities = Array.from(
        new Set(auditLogs.map((log) => log.entity_type)),
    ).sort();
    const uniqueUsers = Array.from(
        new Set(auditLogs.map((log) => log.user_id).filter((id) => id)),
    );

    // Filter audit logs
    const filteredLogs = auditLogs.filter((log) => {
        const matchesSearch =
            !searchTerm ||
            log.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.changes_summary?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesAction = !selectedAction || log.action === selectedAction;
        const matchesEntity = !selectedEntity || log.entity_type === selectedEntity;
        const matchesUser = !selectedUser || log.user_id.toString() === selectedUser;

        return matchesSearch && matchesAction && matchesEntity && matchesUser;
    });

    const handleReset = () => {
        setSearchTerm('');
        setSelectedAction('');
        setSelectedEntity('');
        setSelectedUser('');
    };

    const hasActiveFilters =
        searchTerm || selectedAction || selectedEntity || selectedUser;

    // Calculate audit statistics
    const totalLogs = auditLogs.length;
    const logsToday = auditLogs.filter((log) => {
        const logDate = new Date(log.timestamp);
        const today = new Date();
        return logDate.toDateString() === today.toDateString();
    }).length;

    const uniqueUsersCount = new Set(auditLogs.map((log) => log.user_id)).size;
    const uniqueEntitiesModified = new Set(auditLogs.map((log) => log.entity_id)).size;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Audit Trail & History" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">Audit Trail & History</h1>
                        <p className="text-muted-foreground">
                            Track all payroll system changes and user actions for compliance and audit purposes
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                        <Button variant="outline" size="sm">
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    <Card className="border-0 bg-white p-4">
                        <p className="text-sm font-medium text-gray-600">Total Audit Logs</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{totalLogs}</p>
                        <p className="mt-1 text-xs text-gray-500">Complete record</p>
                    </Card>

                    <Card className="border-0 bg-white p-4">
                        <p className="text-sm font-medium text-gray-600">Changes Today</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{logsToday}</p>
                        <p className="mt-1 text-xs text-gray-500">Since midnight</p>
                    </Card>

                    <Card className="border-0 bg-white p-4">
                        <p className="text-sm font-medium text-gray-600">Active Users</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{uniqueUsersCount}</p>
                        <p className="mt-1 text-xs text-gray-500">System users</p>
                    </Card>

                    <Card className="border-0 bg-white p-4">
                        <p className="text-sm font-medium text-gray-600">Entities Modified</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{uniqueEntitiesModified}</p>
                        <p className="mt-1 text-xs text-gray-500">Unique records</p>
                    </Card>
                </div>

                {/* Filters */}
                <Card className="border-0 bg-white p-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                            </h3>
                            {hasActiveFilters && (
                                <button
                                    onClick={handleReset}
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                            {/* Search */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Search</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                                    <Input
                                        placeholder="Entity, user, changes..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Action Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Action</label>
                                <select
                                    value={selectedAction}
                                    onChange={(e) => setSelectedAction(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                                >
                                    <option value="">All Actions</option>
                                    {uniqueActions.map((action) => (
                                        <option key={action} value={action}>
                                            {action.charAt(0).toUpperCase() + action.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Entity Type Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">Entity Type</label>
                                <select
                                    value={selectedEntity}
                                    onChange={(e) => setSelectedEntity(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                                >
                                    <option value="">All Entities</option>
                                    {uniqueEntities.map((entity) => (
                                        <option key={entity} value={entity}>
                                            {entity.replace(/([A-Z])/g, ' $1').trim()}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* User Filter */}
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-2">User</label>
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                                >
                                    <option value="">All Users</option>
                                    {uniqueUsers.map((userId) => {
                                        const user = auditLogs.find((log) => log.user_id === userId);
                                        return (
                                            <option key={userId} value={userId.toString()}>
                                                {user?.user_name}
                                            </option>
                                        );
                                    })}
                                </select>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`px-4 py-2 font-medium ${
                            activeTab === 'logs'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Audit Logs ({filteredLogs.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('changes')}
                        className={`px-4 py-2 font-medium ${
                            activeTab === 'changes'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Change History ({changeHistory.length})
                    </button>
                </div>

                {/* Tab Content */}
                <div className="mt-6">
                    {activeTab === 'logs' && (
                        <AuditLogTable
                            logs={filteredLogs}
                            onRowClick={(log) => {
                                console.log('Audit log clicked:', log);
                                // In production, open a detail modal or navigate to details page
                            }}
                        />
                    )}

                    {activeTab === 'changes' && (
                        <ChangeHistoryComponent
                            changes={changeHistory}
                            entityType="PayrollPeriod"
                            onFilterChange={(filters) => {
                                console.log('Filter changed:', filters);
                            }}
                        />
                    )}
                </div>

                {/* Footer Info */}
                <div className="text-xs text-gray-600 border-t border-gray-200 pt-4">
                    <p>
                        <strong>Note:</strong> This audit trail maintains a complete record of all payroll system changes for compliance and security purposes. Rollback functionality is available for authorized administrators only.
                    </p>
                </div>
            </div>
        </AppLayout>
    );
}
