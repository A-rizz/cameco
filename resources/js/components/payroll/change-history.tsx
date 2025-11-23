import React, { useState } from 'react';
import type { ChangeHistory } from '@/types/payroll-pages';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';

interface ChangeHistoryProps {
    changes: ChangeHistory[];
    entityType?: string;
    onFilterChange?: (filters: ChangeHistoryFilters) => void;
}

interface ChangeHistoryFilters {
    search?: string;
    fieldName?: string;
}

export function ChangeHistoryComponent({ changes, entityType, onFilterChange }: ChangeHistoryProps) {
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedField, setSelectedField] = useState<string>('');

    const toggleExpanded = (id: number) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    // Filter changes based on search term
    const filteredChanges = changes.filter((change) => {
        const matchesSearch =
            !searchTerm ||
            change.field_label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            change.old_value?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
            change.new_value?.toString().toLowerCase().includes(searchTerm.toLowerCase());

        const matchesField = !selectedField || change.field_name === selectedField;

        return matchesSearch && matchesField;
    });

    // Get unique field names for filter
    const uniqueFields = Array.from(new Set(changes.map((c) => c.field_name)));

    const getValueTypeColor = (
        valueType: string,
    ): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (valueType) {
            case 'currency':
                return 'default';
            case 'date':
                return 'secondary';
            case 'boolean':
                return 'outline';
            default:
                return 'secondary';
        }
    };

    if (changes.length === 0) {
        return (
            <Card className="border-0 bg-gray-50 p-12 text-center">
                <Filter className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-600 font-medium">No change history found</p>
                <p className="text-sm text-gray-500 mt-1">No modifications recorded for this period</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                        <Input
                            placeholder="Search fields, old values, new values..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                onFilterChange?.({ search: e.target.value, fieldName: selectedField });
                            }}
                            className="pl-10"
                        />
                    </div>
                </div>

                <select
                    value={selectedField}
                    onChange={(e) => {
                        setSelectedField(e.target.value);
                        onFilterChange?.({ search: searchTerm, fieldName: e.target.value });
                    }}
                    className="rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
                >
                    <option value="">All Fields</option>
                    {uniqueFields.map((field) => (
                        <option key={field} value={field}>
                            {changes.find((c) => c.field_name === field)?.field_label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Changes List */}
            <div className="space-y-3">
                {filteredChanges.map((change) => (
                    <Card key={change.id} className="border-0 overflow-hidden bg-white hover:shadow-sm transition-shadow">
                        {/* Summary Row */}
                        <button
                            onClick={() => toggleExpanded(change.id)}
                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-center gap-4 flex-1 text-left">
                                {/* Field Name */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900">{change.field_label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{change.field_name}</p>
                                </div>

                                {/* Values */}
                                <div className="flex items-center gap-2 min-w-0">
                                    {/* Old Value */}
                                    <div className="text-right">
                                        <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">
                                            {change.formatted_old_value || '—'}
                                        </Badge>
                                    </div>

                                    {/* Arrow */}
                                    <span className="text-gray-400 text-sm">→</span>

                                    {/* New Value */}
                                    <div className="text-right">
                                        <Badge variant="default" className="bg-green-100 text-green-800 border-0">
                                            {change.formatted_new_value || '—'}
                                        </Badge>
                                    </div>
                                </div>

                                {/* User & Time */}
                                <div className="text-right min-w-max ml-4">
                                    <p className="text-xs text-gray-500">{change.formatted_timestamp}</p>
                                    <p className="text-xs font-medium text-gray-700 mt-0.5">{change.user_name}</p>
                                </div>
                            </div>

                            {/* Toggle Icon */}
                            <div className="ml-4">
                                {expandedIds.has(change.id) ? (
                                    <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                            </div>
                        </button>

                        {/* Detailed Comparison (Expanded) */}
                        {expandedIds.has(change.id) && (
                            <div className="border-t border-gray-100 bg-gray-50 px-6 py-4 space-y-4">
                                {/* Old Value Detail */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                        Previous Value
                                    </p>
                                    <div className="bg-white rounded-md border border-red-100 p-4">
                                        <div className="flex items-start gap-3">
                                            <span className="text-red-600 text-xl font-bold">−</span>
                                            <div className="flex-1">
                                                <p className="font-mono text-sm text-gray-900 break-words">
                                                    {change.formatted_old_value || <em className="text-gray-400">No value</em>}
                                                </p>
                                                <Badge
                                                    variant={getValueTypeColor(change.value_type)}
                                                    className="mt-2 text-xs"
                                                >
                                                    {change.value_type}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* New Value Detail */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                                        New Value
                                    </p>
                                    <div className="bg-white rounded-md border border-green-100 p-4">
                                        <div className="flex items-start gap-3">
                                            <span className="text-green-600 text-xl font-bold">+</span>
                                            <div className="flex-1">
                                                <p className="font-mono text-sm text-gray-900 break-words">
                                                    {change.formatted_new_value || <em className="text-gray-400">No value</em>}
                                                </p>
                                                <Badge
                                                    variant={getValueTypeColor(change.value_type)}
                                                    className="mt-2 text-xs"
                                                >
                                                    {change.value_type}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Metadata */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="text-xs text-gray-600">
                                        Changed by <span className="font-semibold">{change.user_name}</span> on{' '}
                                        <span className="font-semibold">{change.formatted_timestamp}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" disabled>
                                            📋 Copy
                                        </Button>
                                        <Button variant="outline" size="sm" disabled>
                                            ↩️ Rollback
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                ))}
            </div>

            {/* Results Summary */}
            <div className="text-xs text-gray-600 flex items-center justify-between py-2">
                <div>
                    Showing <span className="font-semibold">{filteredChanges.length}</span> of{' '}
                    <span className="font-semibold">{changes.length}</span> changes
                    {entityType && <span className="ml-2 text-gray-500">in {entityType}</span>}
                </div>
            </div>
        </div>
    );
}
