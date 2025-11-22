import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Clock, AlertTriangle, PhoneOff } from 'lucide-react';
import type { CashDistribution, UnclaimedCash, CashEmployee } from '@/types/payroll-pages';

interface CashDistributionTrackerProps {
    distributions: CashDistribution[];
    unclaimedCash: UnclaimedCash[];
    employees: CashEmployee[];
}

export default function CashDistributionTracker({
    distributions,
    unclaimedCash,
    employees,
}: CashDistributionTrackerProps) {
    const [selectedDistribution, setSelectedDistribution] = useState<CashDistribution | null>(null);
    const [isRecordingContact, setIsRecordingContact] = useState(false);

    const getDistributionIcon = (status: string) => {
        switch (status) {
            case 'distributed':
                return <Clock className="h-4 w-4 text-yellow-600" />;
            case 'claimed':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'unclaimed':
                return <AlertCircle className="h-4 w-4 text-red-600" />;
            case 'returned':
                return <PhoneOff className="h-4 w-4 text-gray-600" />;
            default:
                return <Clock className="h-4 w-4 text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'distributed':
                return 'bg-yellow-100 text-yellow-800';
            case 'claimed':
                return 'bg-green-100 text-green-800';
            case 'unclaimed':
                return 'bg-red-100 text-red-800';
            case 'returned':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getDaysColor = (days: number) => {
        if (days <= 2) return 'text-green-600';
        if (days <= 5) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <Tabs defaultValue="distributions" className="w-full space-y-4">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="distributions">Distributions ({distributions.length})</TabsTrigger>
                <TabsTrigger value="unclaimed">Unclaimed Cash ({unclaimedCash.length})</TabsTrigger>
            </TabsList>

            {/* Tab 1: Distributions */}
            <TabsContent value="distributions" className="space-y-4">
                {distributions.length === 0 ? (
                    <Card>
                        <CardContent className="pt-8 text-center">
                            <p className="text-muted-foreground">No distributions recorded yet</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {distributions.map((distribution) => (
                            <Card key={distribution.id} className="cursor-pointer hover:bg-gray-50">
                                <CardContent className="pt-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="pt-1">
                                                {getDistributionIcon(distribution.status)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-gray-900">
                                                        {employees.find((e) => e.id === distribution.cash_employee_id)
                                                            ?.employee_name || 'Unknown'}
                                                    </h4>
                                                    <Badge
                                                        variant="outline"
                                                        className={getStatusColor(distribution.status)}
                                                    >
                                                        {distribution.status_label}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mt-2 text-sm text-gray-600">
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500">
                                                            AMOUNT
                                                        </p>
                                                        <p className="font-semibold text-gray-900">
                                                            {distribution.formatted_amount}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500">
                                                            DATE & TIME
                                                        </p>
                                                        <p className="text-sm">
                                                            {distribution.distribution_date}{' '}
                                                            {distribution.distribution_time}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-500">
                                                            DISTRIBUTED BY
                                                        </p>
                                                        <p className="text-sm">{distribution.distributed_by}</p>
                                                    </div>
                                                    {distribution.received_by && (
                                                        <div>
                                                            <p className="text-xs font-semibold text-gray-500">
                                                                RECEIVED BY
                                                            </p>
                                                            <p className="text-sm">{distribution.received_by}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {distribution.notes && (
                                                    <div className="mt-2 text-sm bg-gray-50 p-2 rounded">
                                                        <p className="text-xs font-semibold text-gray-600">
                                                            NOTES
                                                        </p>
                                                        <p className="text-gray-700">{distribution.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    setSelectedDistribution(
                                                        selectedDistribution?.id === distribution.id
                                                            ? null
                                                            : distribution
                                                    )
                                                }
                                            >
                                                {selectedDistribution?.id === distribution.id ? 'Hide' : 'Details'}
                                            </Button>
                                        </div>
                                    </div>

                                    {selectedDistribution?.id === distribution.id && (
                                        <div className="mt-4 pt-4 border-t space-y-3">
                                            {distribution.signature_file_path && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-600 mb-2">
                                                        SIGNATURE
                                                    </p>
                                                    <img
                                                        src={distribution.signature_file_path}
                                                        alt="Signature"
                                                        className="h-16 object-contain"
                                                    />
                                                </div>
                                            )}
                                            <div className="text-xs text-gray-500">
                                                <p>
                                                    Recorded: {distribution.created_at}
                                                </p>
                                                <p>
                                                    Last Updated: {distribution.updated_at}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>

            {/* Tab 2: Unclaimed Cash */}
            <TabsContent value="unclaimed" className="space-y-4">
                {unclaimedCash.length === 0 ? (
                    <Card>
                        <CardContent className="pt-8 text-center">
                            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
                            <p className="text-muted-foreground">All cash has been claimed!</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {unclaimedCash.map((unclaimed) => (
                            <Card
                                key={unclaimed.id}
                                className={
                                    unclaimed.days_until_returned <= 2
                                        ? 'border-red-300 bg-red-50'
                                        : unclaimed.days_until_returned <= 5
                                          ? 'border-yellow-300 bg-yellow-50'
                                          : ''
                                }
                            >
                                <CardContent className="pt-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className="pt-1">
                                                {unclaimed.days_until_returned <= 2 ? (
                                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                                ) : unclaimed.days_until_returned <= 5 ? (
                                                    <AlertCircle className="h-5 w-5 text-yellow-600" />
                                                ) : (
                                                    <Clock className="h-5 w-5 text-blue-600" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-semibold text-gray-900">
                                                        {unclaimed.employee_name}
                                                    </h4>
                                                    <span className="text-xs text-gray-500">
                                                        ({unclaimed.employee_number})
                                                    </span>
                                                    <Badge
                                                        variant="outline"
                                                        className={`bg-${unclaimed.status_color}-100 text-${unclaimed.status_color}-800`}
                                                    >
                                                        {unclaimed.status_label}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-600">
                                                            AMOUNT
                                                        </p>
                                                        <p className="font-semibold text-gray-900">
                                                            {unclaimed.formatted_amount}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-600">
                                                            PERIOD
                                                        </p>
                                                        <p className="text-gray-900">{unclaimed.period_name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold text-gray-600">
                                                            DAYS UNCLAIMED
                                                        </p>
                                                        <p
                                                            className={`font-semibold ${getDaysColor(unclaimed.days_unclaimed)}`}
                                                        >
                                                            {unclaimed.days_unclaimed} days
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                                                    <div>
                                                        <p className="font-semibold">
                                                            Contact Attempts: {unclaimed.contact_attempts}
                                                        </p>
                                                        {unclaimed.last_contact_attempt && (
                                                            <p>Last: {unclaimed.last_contact_attempt}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">
                                                            Must Return In: {unclaimed.days_until_returned} days
                                                        </p>
                                                        <p className="text-gray-500">
                                                            by {unclaimed.distribution_scheduled_for}
                                                        </p>
                                                    </div>
                                                </div>

                                                {unclaimed.notes && (
                                                    <div className="text-xs bg-gray-50 p-2 rounded mt-2">
                                                        <p className="font-semibold text-gray-700 mb-1">
                                                            Notes
                                                        </p>
                                                        <p className="text-gray-600">{unclaimed.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Button size="sm" variant="outline">
                                                Mark Claimed
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setIsRecordingContact(!isRecordingContact)}
                                            >
                                                <PhoneOff className="h-3 w-3 mr-1" />
                                                Contact
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </TabsContent>
        </Tabs>
    );
}
