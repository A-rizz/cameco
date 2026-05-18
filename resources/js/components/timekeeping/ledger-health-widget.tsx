import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity, CheckCircle2, AlertTriangle, XCircle, TrendingUp, Clock, Shield, Wifi, WifiOff, Layers, ExternalLink, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { LedgerHealthDetailModal } from './ledger-health-detail-modal';

/**
 * Ledger Health Status Types
 */
export type LedgerHealthStatus = 'healthy' | 'warning' | 'critical';

/**
 * Ledger Health State Interface
 */
interface LedgerHealthState {
    status: LedgerHealthStatus;
    lastSequence: number;
    lastProcessedAgo: string;
    processingRate: number;
    integrityStatus: 'verified' | 'pending' | 'hash_mismatch_detected';
    devicesOnline: number;
    devicesOffline: number;
    backlog: number;
    // Historical data for mini-chart
    processingRateHistory?: number[];
}

/**
 * Component Props
 */
interface LedgerHealthWidgetProps {
    healthState?: LedgerHealthState;
    className?: string;
}

/**
 * Mock Health States for demonstration
 */
const mockHealthStates: Record<LedgerHealthStatus, LedgerHealthState> = {
    healthy: {
        status: "healthy",
        lastSequence: 12450,
        lastProcessedAgo: "2 seconds ago",
        processingRate: 425,
        integrityStatus: "verified",
        devicesOnline: 3,
        devicesOffline: 0,
        backlog: 0,
        processingRateHistory: [410, 415, 420, 418, 422, 425, 428, 425, 423, 425, 427, 425]
    },
    warning: {
        status: "warning",
        lastSequence: 12420,
        lastProcessedAgo: "8 minutes ago",
        processingRate: 180,
        integrityStatus: "verified",
        devicesOnline: 2,
        devicesOffline: 1,
        backlog: 245,
        processingRateHistory: [350, 320, 290, 260, 230, 210, 195, 185, 180, 175, 178, 180]
    },
    critical: {
        status: "critical",
        lastSequence: 12380,
        lastProcessedAgo: "45 minutes ago",
        processingRate: 0,
        integrityStatus: "hash_mismatch_detected",
        devicesOnline: 1,
        devicesOffline: 2,
        backlog: 1250,
        processingRateHistory: [120, 95, 70, 50, 30, 15, 8, 3, 1, 0, 0, 0]
    }
};

/**
 * Get status configuration (colors, icons, labels)
 */
const getStatusConfig = (status: LedgerHealthStatus) => {
    const configs = {
        healthy: {
            badge: '🟢 HEALTHY',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-300',
            textColor: 'text-green-900',
            icon: CheckCircle2,
            iconColor: 'text-green-600',
            badgeVariant: 'default' as const,
            badgeBg: 'bg-green-100',
            badgeText: 'text-green-700',
        },
        warning: {
            badge: '🟡 WARNING',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-300',
            textColor: 'text-yellow-900',
            icon: AlertTriangle,
            iconColor: 'text-yellow-600',
            badgeVariant: 'secondary' as const,
            badgeBg: 'bg-yellow-100',
            badgeText: 'text-yellow-700',
        },
        critical: {
            badge: '🔴 CRITICAL',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-300',
            textColor: 'text-red-900',
            icon: XCircle,
            iconColor: 'text-red-600',
            badgeVariant: 'destructive' as const,
            badgeBg: 'bg-red-100',
            badgeText: 'text-red-700',
        },
    };

    return configs[status];
};

/**
 * Get integrity status display
 */
const getIntegrityDisplay = (integrityStatus: LedgerHealthState['integrityStatus']) => {
    switch (integrityStatus) {
        case 'verified':
            return {
                icon: '✅',
                text: 'All chains verified',
                color: 'text-green-700',
            };
        case 'pending':
            return {
                icon: '⏳',
                text: 'Verification pending',
                color: 'text-yellow-700',
            };
        case 'hash_mismatch_detected':
            return {
                icon: '❌',
                text: 'Hash mismatch detected',
                color: 'text-red-700',
            };
    }
};

/**
 * Mini Line Chart Component
 * Displays processing rate trend over last hour
 */
function MiniLineChart({ data, status }: { data: number[]; status: LedgerHealthStatus }) {
    if (!data || data.length === 0) return null;

    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const width = 200;
    const height = 60;
    const padding = 4;

    // Generate SVG path points
    const points = data.map((value, index) => {
        const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
    }).join(' ');

    const pathColor = status === 'healthy' ? '#16a34a' : 
                      status === 'warning' ? '#ca8a04' : '#dc2626';
    
    const fillColor = status === 'healthy' ? 'rgba(22, 163, 74, 0.1)' : 
                      status === 'warning' ? 'rgba(202, 138, 4, 0.1)' : 'rgba(220, 38, 38, 0.1)';

    return (
        <div className="relative">
            <svg width={width} height={height} className="overflow-visible">
                {/* Fill area */}
                <polygon
                    points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
                    fill={fillColor}
                />
                {/* Line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke={pathColor}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Data points */}
                {data.map((value, index) => {
                    const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
                    const y = height - padding - ((value - min) / range) * (height - padding * 2);
                    return (
                        <circle
                            key={index}
                            cx={x}
                            cy={y}
                            r="2"
                            fill={pathColor}
                        />
                    );
                })}
            </svg>
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                <span>1h ago</span>
                <span>Now</span>
            </div>
        </div>
    );
}

/**
 * Generate mock detailed health state from basic state
 */
function generateDetailedHealthState(basicState: LedgerHealthState) {
    return {
        ...basicState,
        uptime: '15 days, 8 hours',
        totalEventsProcessed: 1245000 + Math.floor(Math.random() * 10000),
        averageLatency: basicState.status === 'healthy' ? 45 : basicState.status === 'warning' ? 180 : 850,
        peakProcessingRate: 520,
        hashValidationRate: basicState.integrityStatus === 'verified' ? 100 : 
                           basicState.integrityStatus === 'pending' ? 95 : 78,
        lastIntegrityCheck: '30 seconds ago',
        databaseSize: '2.4 GB',
        ledgerAge: '180 days',
        deviceDetails: [
            {
                id: 'GATE-01',
                location: 'Main Entrance',
                status: basicState.devicesOffline > 0 ? 'offline' as const : 'online' as const,
                lastSeen: basicState.devicesOffline > 0 ? '45 minutes ago' : '2 seconds ago',
                eventsToday: 1250
            },
            {
                id: 'GATE-02',
                location: 'Side Entrance',
                status: 'online' as const,
                lastSeen: '5 seconds ago',
                eventsToday: 980
            },
            {
                id: 'CAFETERIA-01',
                location: 'Employee Cafeteria',
                status: basicState.devicesOffline > 1 ? 'offline' as const : 'online' as const,
                lastSeen: basicState.devicesOffline > 1 ? '2 hours ago' : '1 second ago',
                eventsToday: 2340
            }
        ],
        recentErrors: basicState.status === 'critical' ? [
            {
                timestamp: '2 hours ago',
                type: 'Hash Chain Integrity Failure',
                message: 'Detected hash mismatch in sequence #12,380. Previous hash does not match calculated value.',
                severity: 'high' as const
            },
            {
                timestamp: '45 minutes ago',
                type: 'Device Offline',
                message: 'GATE-01 has not reported in 45 minutes. Last known sequence: #12,350.',
                severity: 'high' as const
            }
        ] : basicState.status === 'warning' ? [
            {
                timestamp: '10 minutes ago',
                type: 'Processing Delay',
                message: 'Processing backlog has exceeded 200 events. Consider scaling up worker processes.',
                severity: 'medium' as const
            }
        ] : []
    };
}

/**
 * Ledger Health Dashboard Widget Component
 * Displays real-time health metrics of the RFID ledger processing system
 * 
 * @component
 * @example
 * <LedgerHealthWidget healthState={mockHealthStates.healthy} />
 */
export function LedgerHealthWidget({ 
    healthState = mockHealthStates.healthy,
    className 
}: LedgerHealthWidgetProps) {
    const config = getStatusConfig(healthState.status);
    const integrityDisplay = getIntegrityDisplay(healthState.integrityStatus);
    const StatusIcon = config.icon;
    
    const [showDetailModal, setShowDetailModal] = useState(false);
    const detailedHealthState = generateDetailedHealthState(healthState);

    return (
        <>
            <Card className={cn(
                'w-full border shadow-sm transition-all duration-200',
                config.bgColor,
                config.borderColor,
                className
            )}>
                <CardHeader className="pb-2.5 p-4 border-b bg-black/5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <StatusIcon className={cn('h-4 w-4', config.iconColor)} />
                            <CardTitle className={cn('text-sm font-semibold', config.textColor)}>
                                Ledger Health Monitor
                            </CardTitle>
                        </div>
                        <Badge 
                            variant={config.badgeVariant}
                            className={cn('font-bold text-[10px] py-0 px-2', config.badgeBg, config.badgeText)}
                        >
                            {config.badge}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                    <TooltipProvider>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                            {/* Last Processed */}
                            <div className="p-2.5 rounded-lg border bg-white/80 shadow-sm flex flex-col justify-between min-h-[75px]">
                                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Layers className="h-3.5 w-3.5 text-gray-400" />
                                        <span>Last Processed</span>
                                    </div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <p className="text-xs">
                                                The most recent event processed from the RFID ledger. 
                                                Sequence number ensures chronological order and prevents gaps.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="mt-1">
                                    <div className="text-sm font-bold text-gray-900 leading-tight">
                                        Sequence #{healthState.lastSequence.toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">
                                        {healthState.lastProcessedAgo}
                                    </div>
                                </div>
                            </div>

                            {/* Processing Speed */}
                            <div className="p-2.5 rounded-lg border bg-white/80 shadow-sm flex flex-col justify-between min-h-[75px]">
                                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
                                        <span>Processing Speed</span>
                                    </div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <p className="text-xs">
                                                Current rate of RFID events being processed per minute. 
                                                Optimal rate is 300+ events/min. Lower rates indicate processing delays.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="mt-1">
                                    <div className="text-sm font-bold text-gray-900 leading-tight">
                                        {healthState.processingRate.toLocaleString()} events/min
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">
                                        {healthState.processingRate > 300 ? 'Optimal rate' : 
                                         healthState.processingRate > 100 ? 'Below average' : 
                                         'Critical delay'}
                                    </div>
                                </div>
                            </div>

                            {/* Integrity Status */}
                            <div className="p-2.5 rounded-lg border bg-white/80 shadow-sm flex flex-col justify-between min-h-[75px]">
                                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Shield className="h-3.5 w-3.5 text-gray-400" />
                                        <span>Integrity Status</span>
                                    </div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <p className="text-xs">
                                                Hash chain verification status ensures ledger tamper-resistance. 
                                                Each event's hash must match the previous event's hash for integrity.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="mt-1">
                                    <div className={cn('text-xs font-bold leading-tight truncate', integrityDisplay.color)}>
                                        {integrityDisplay.icon} {integrityDisplay.text}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">
                                        Hash chain validation
                                    </div>
                                </div>
                            </div>

                            {/* Device Status */}
                            <div className="p-2.5 rounded-lg border bg-white/80 shadow-sm flex flex-col justify-between min-h-[75px]">
                                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Activity className="h-3.5 w-3.5 text-gray-400" />
                                        <span>Device Status</span>
                                    </div>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-xs">
                                            <p className="text-xs">
                                                Real-time connectivity status of RFID edge devices (gates, cafeteria). 
                                                Offline devices may have cached events pending synchronization.
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </div>
                                <div className="mt-1">
                                    <div className="flex items-center gap-3 leading-tight">
                                        <div className="flex items-center gap-1">
                                            <Wifi className="h-3.5 w-3.5 text-green-600" />
                                            <span className="text-sm font-bold text-gray-900">
                                                {healthState.devicesOnline}
                                            </span>
                                            <span className="text-[10px] text-gray-500">online</span>
                                        </div>
                                        {healthState.devicesOffline > 0 && (
                                            <div className="flex items-center gap-1">
                                                <WifiOff className="h-3.5 w-3.5 text-red-600" />
                                                <span className="text-sm font-bold text-red-600">
                                                    {healthState.devicesOffline}
                                                </span>
                                                <span className="text-[10px] text-gray-500">offline</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-0.5">
                                        Edge connectivity
                                    </div>
                                </div>
                            </div>

                            {/* Backlog */}
                            <div className="col-span-2 lg:col-span-4 p-2.5 rounded-lg border bg-white/80 shadow-sm flex flex-col justify-between">
                                <div className="flex items-center justify-between text-xs font-semibold text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-gray-400" />
                                        <span>Queue Backlog</span>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <HelpCircle className="h-3 w-3 text-gray-400 cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                                <p className="text-xs">
                                                    Number of unprocessed events in the ledger queue. 
                                                    High backlog may delay payroll calculations and requires attention.
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <div className={cn(
                                        'text-xs font-bold',
                                        healthState.backlog === 0 ? 'text-green-700' :
                                        healthState.backlog < 500 ? 'text-yellow-700' :
                                        'text-red-700'
                                    )}>
                                        {healthState.backlog.toLocaleString()} pending events
                                    </div>
                                </div>
                                {healthState.backlog > 0 && (
                                    <div className="mt-1.5 w-full bg-gray-200 rounded-full h-1.5">
                                        <div 
                                            className={cn(
                                                'h-1.5 rounded-full transition-all duration-500',
                                                healthState.backlog < 500 ? 'bg-yellow-500' : 'bg-red-500'
                                            )}
                                            style={{ 
                                                width: `${Math.min((healthState.backlog / 2000) * 100, 100)}%` 
                                            }}
                                        />
                                    </div>
                                )}
                                <div className="text-[10px] text-gray-500 mt-1 flex justify-between">
                                    <span>
                                        {healthState.backlog === 0 ? 'All events processed' :
                                         healthState.backlog < 100 ? 'Minor delay expected' :
                                         healthState.backlog < 500 ? 'Moderate processing delay' :
                                         'Significant backlog - action required'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </TooltipProvider>

                    {/* Processing Rate Mini-Chart */}
                    {healthState.processingRateHistory && healthState.processingRateHistory.length > 0 && (
                        <div className="p-2.5 border rounded-lg bg-white/90 flex items-center justify-between gap-4">
                            <div>
                                <h4 className="text-xs font-semibold text-gray-900">Processing Rate Trend</h4>
                                <p className="text-[10px] text-gray-500">Last hour performance</p>
                            </div>
                            <div className="flex-shrink-0">
                                <MiniLineChart 
                                    data={healthState.processingRateHistory} 
                                    status={healthState.status}
                                />
                            </div>
                        </div>
                    )}

                    {/* Footer Row: Status Message + View Details Button */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1.5">
                        <div className={cn(
                            'flex-1 p-2 rounded-lg border-l-4 text-xs font-medium',
                            healthState.status === 'healthy' ? 'bg-green-50 border-green-500 text-green-800' :
                            healthState.status === 'warning' ? 'bg-yellow-50/70 border-yellow-500 text-yellow-800' :
                            'bg-red-50/70 border-red-500 text-red-800'
                        )}>
                            {healthState.status === 'healthy' && 
                                '✅ System operating normally. All ledger operations are healthy.'}
                            {healthState.status === 'warning' && 
                                '⚠️ System experiencing minor issues. Monitor for escalation.'}
                            {healthState.status === 'critical' && 
                                '🚨 Critical issues detected. Immediate attention required!'}
                        </div>
                        
                        <Button 
                            variant="outline" 
                            size="sm"
                            className="sm:w-auto h-8 text-xs font-semibold shrink-0"
                            onClick={() => setShowDetailModal(true)}
                        >
                            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                            View Details
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Detail Modal */}
            <LedgerHealthDetailModal 
                open={showDetailModal}
                onOpenChange={setShowDetailModal}
                healthState={detailedHealthState}
            />
        </>
    );
}

// Export mock states for testing and demonstration
export { mockHealthStates };
