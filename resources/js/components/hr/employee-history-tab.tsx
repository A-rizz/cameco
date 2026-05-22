import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    History,
    UserPlus,
    UserCheck,
    Edit,
    Archive,
    RefreshCw,
    Filter,
    Clock,
    User,
   // AlertCircle
} from 'lucide-react';

interface AuditLog {
    id: number;
    action: 'created' | 'updated' | 'archived' | 'restored' | 'status_changed';
    description: string;
    changes?: {
        field: string;
        old_value: string | null;
        new_value: string;
    }[];
    performed_by: {
        name: string;
        role: string;
    };
    performed_at: string;
    ip_address?: string;
}

interface EmployeeHistoryTabProps {
    employeeId: number;
    auditLogs?: AuditLog[];
}

export function EmployeeHistoryTab({ employeeId, auditLogs = [] }: EmployeeHistoryTabProps) {
    const [selectedFilter, setSelectedFilter] = useState<string>('all');

    const actionFilters = [
        { value: 'all', label: 'All Changes', icon: History },
        { value: 'created', label: 'Created', icon: UserPlus },
        { value: 'updated', label: 'Updated', icon: Edit },
        { value: 'status_changed', label: 'Status Changes', icon: UserCheck },
        { value: 'archived', label: 'Archived', icon: Archive },
        { value: 'restored', label: 'Restored', icon: RefreshCw },
    ];

    const filteredLogs = selectedFilter === 'all' 
        ? auditLogs 
        : auditLogs.filter(log => log.action === selectedFilter);

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'created': return UserPlus;
            case 'updated': return Edit;
            case 'status_changed': return UserCheck;
            case 'archived': return Archive;
            case 'restored': return RefreshCw;
            default: return History;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'created': return 'bg-green-100 text-green-800 border-green-200';
            case 'updated': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'status_changed': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'archived': return 'bg-red-100 text-red-800 border-red-200';
            case 'restored': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getActionLabel = (action: string) => {
        return action
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold">Audit History</h3>
                    <p className="text-sm text-muted-foreground">
                        Complete timeline of changes to this employee record
                    </p>
                </div>
            </div>

            {/* Action Filters */}
            <Card className="p-4">
                <div className="flex flex-wrap gap-2">
                    {actionFilters.map((filter) => {
                        const Icon = filter.icon;
                        return (
                            <Button
                                key={filter.value}
                                variant={selectedFilter === filter.value ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedFilter(filter.value)}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {filter.label}
                            </Button>
                        );
                    })}
                </div>
            </Card>

            {/* Timeline or Empty State */}
            {filteredLogs.length === 0 ? (
                <Card className="p-12">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="rounded-full bg-muted p-4 mb-4">
                            <History className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">No History Available</h3>
                        <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                            {selectedFilter === 'all'
                                ? "No audit logs found for this employee. Changes will appear here once activity is recorded."
                                : `No ${getActionLabel(selectedFilter).toLowerCase()} actions found. Try selecting a different filter.`
                            }
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="relative">
                    {/* Timeline Line */}
                    <div className="absolute left-[27px] top-0 bottom-0 w-0.5 bg-border" />

                    {/* Timeline Items */}
                    <div className="space-y-6">
                        {filteredLogs.map((log) => {
                            const ActionIcon = getActionIcon(log.action);

                            return (
                                <div key={log.id} className="relative pl-14">
                                    {/* Timeline Icon */}
                                    <div className={`absolute left-0 w-[54px] h-[54px] rounded-full border-4 border-background flex items-center justify-center ${getActionColor(log.action)}`}>
                                        <ActionIcon className="h-5 w-5" />
                                    </div>

                                    {/* Timeline Content */}
                                    <Card className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getActionColor(log.action)}>
                                                    {getActionLabel(log.action)}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDateTime(log.performed_at)}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-sm mb-3">{log.description}</p>

                                        {/* Changes Detail */}
                                        {log.changes && log.changes.length > 0 && (
                                            <div className="bg-muted rounded-lg p-3 space-y-2 mb-3">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase">
                                                    Changes Made
                                                </p>
                                                {log.changes.map((change, idx) => {
                                                    if (change.field === 'Updated Fields') {
                                                        const fieldsList = change.new_value.split(', ').filter(Boolean);
                                                        if (fieldsList.length === 0) return null;
                                                        
                                                        return (
                                                            <div key={idx} className="text-sm">
                                                                <span className="font-medium block mb-2">{change.field}:</span>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {fieldsList.map((f, i) => {
                                                                        const formatted = f
                                                                            .replace(/^profile\./, '')
                                                                            .split('_')
                                                                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                                                            .join(' ');
                                                                        return (
                                                                            <Badge key={i} variant="secondary" className="font-normal text-xs bg-background hover:bg-background">
                                                                                {formatted}
                                                                            </Badge>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        );
                                                    }

                                                    return (
                                                        <div key={idx} className="text-sm flex items-center flex-wrap gap-1">
                                                            <span className="font-medium">{change.field}:</span>
                                                            {change.old_value && (
                                                                <>
                                                                    <span className="text-muted-foreground line-through ml-1">
                                                                        {change.old_value}
                                                                    </span>
                                                                    <span className="mx-1 text-muted-foreground">→</span>
                                                                </>
                                                            )}
                                                            <span className="text-green-600 font-medium">
                                                                {change.new_value}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Performed By */}
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3" />
                                                <span>
                                                    {log.performed_by.name} ({log.performed_by.role})
                                                </span>
                                            </div>
                                            {log.ip_address && (
                                                <span>IP: {log.ip_address}</span>
                                            )}
                                        </div>
                                    </Card>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
