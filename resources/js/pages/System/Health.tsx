import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Activity, Cpu, Database, HardDrive, MemoryStick, RefreshCw, Server } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface HealthMetrics {
    cpu_usage: number;
    memory_usage: number;
    load_average: string | null;
    uptime: number;
    uptime_formatted: string;
    status: string;
}

interface DatabaseMetrics {
    connection_status: string;
    response_time_ms: number;
}

interface CacheMetrics {
    driver: string;
    connection: string;
}

interface SigNozAPM {
    available: boolean;
    service: string;
    dashboard_url: string;
    latency: {
        p50: number | null;
        p90: number | null;
        p99: number | null;
        unit: string;
    };
    error_rate: {
        rate: number | null;
        total_errors: number | null;
        total_requests: number | null;
        period_hours: number;
    };
    slow_endpoints: Array<{
        endpoint: string;
        method: string;
        avg_latency_ms: number;
        calls: number;
    }>;
}

interface QueueMetrics {
    pending_jobs: number;
    failed_jobs: number;
}

interface StorageMetrics {
    total_bytes: number;
    used_bytes: number;
    free_bytes: number;
    usage_percentage: number;
    total_formatted: string;
    used_formatted: string;
    free_formatted: string;
    status: string;
}

interface HistoricalDataPoint {
    timestamp: string;
    cpu_usage: number;
    memory_usage: number;
    disk_usage: number;
    database_response_ms: number;
    status: string;
}

interface Props {
    currentMetrics: HealthMetrics;
    databaseMetrics: DatabaseMetrics;
    cacheMetrics: CacheMetrics;
    queueMetrics: QueueMetrics;
    storageMetrics: StorageMetrics;
    historicalData: {
        timeline: HistoricalDataPoint[];
        averages: {
            cpu: number;
            memory: number;
            disk: number;
            database: number;
        };
        peaks: {
            cpu: number;
            memory: number;
            disk: number;
            database: number;
        };
    };
    selectedDays: number;
    apm: SigNozAPM;
}

export default function Health({
    currentMetrics,
    databaseMetrics,
    cacheMetrics,
    queueMetrics,
    storageMetrics,
    historicalData,
    selectedDays,
    apm,
}: Props) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [days, setDays] = useState(selectedDays.toString());

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => setIsRefreshing(false),
        });
    };

    const handleDaysChange = (value: string) => {
        setDays(value);
        router.get(`/system/health?days=${value}`, {}, { preserveState: true });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-500';
            case 'warning':
                return 'bg-yellow-500';
            case 'critical':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'healthy':
                return <Badge className="bg-green-500 hover:bg-green-600 text-white border-transparent">Healthy</Badge>;
            case 'warning':
                return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-transparent">Warning</Badge>;
            case 'critical':
                return <Badge className="bg-red-500 hover:bg-red-600 text-white border-transparent">Critical</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    return (
        <AppLayout>
            <Head title="System Health Monitoring" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight dark:text-foreground">System Health Monitoring</h1>
                        <p className="text-muted-foreground">Real-time server metrics and performance monitoring</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={days} onValueChange={handleDaysChange}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select timeframe" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Last 24 hours</SelectItem>
                                <SelectItem value="7">Last 7 days</SelectItem>
                                <SelectItem value="30">Last 30 days</SelectItem>
                                <SelectItem value="90">Last 90 days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleRefresh} disabled={isRefreshing} variant="outline">
                            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Current Status */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Server className="h-5 w-5" />
                                    Current Server Status
                                </CardTitle>
                                <CardDescription>Live system metrics</CardDescription>
                            </div>
                            {getStatusBadge(currentMetrics.status)}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {/* CPU Usage */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Cpu className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">CPU Usage</span>
                                    </div>
                                    <span className="text-2xl font-bold">{currentMetrics.cpu_usage.toFixed(1)}%</span>
                                </div>
                                <Progress value={currentMetrics.cpu_usage} className="h-2" />
                            </div>

                            {/* Memory Usage */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <MemoryStick className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Memory</span>
                                    </div>
                                    <span className="text-2xl font-bold">{currentMetrics.memory_usage.toFixed(1)}%</span>
                                </div>
                                <Progress value={currentMetrics.memory_usage} className="h-2" />
                            </div>

                            {/* Disk Usage */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Disk</span>
                                    </div>
                                    <span className="text-2xl font-bold">{storageMetrics.usage_percentage.toFixed(1)}%</span>
                                </div>
                                <Progress value={storageMetrics.usage_percentage} className="h-2" />
                                <p className="text-xs text-muted-foreground">
                                    {storageMetrics.used_formatted} / {storageMetrics.total_formatted}
                                </p>
                            </div>

                            {/* Uptime */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Activity className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Uptime</span>
                                </div>
                                <p className="text-2xl font-bold">{currentMetrics.uptime_formatted}</p>
                                {currentMetrics.load_average && (
                                    <p className="text-xs text-muted-foreground">Load: {currentMetrics.load_average}</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Services Status */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Database className="h-4 w-4" />
                                Database
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <Badge className={databaseMetrics.connection_status === 'connected' ? 'bg-green-500 text-white border-transparent' : 'bg-red-500 text-white border-transparent'}>
                                        {databaseMetrics.connection_status}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Response Time</span>
                                    <span className="text-sm font-medium">{databaseMetrics.response_time_ms} ms</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Server className="h-4 w-4" />
                                Cache
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Driver</span>
                                    <span className="text-sm font-medium">{cacheMetrics.driver}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <Badge className={cacheMetrics.connection === 'connected' ? 'bg-green-500 text-white border-transparent' : 'bg-red-500 text-white border-transparent'}>
                                        {cacheMetrics.connection}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="h-4 w-4" />
                                Queue
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Pending Jobs</span>
                                    <span className="text-sm font-medium">{queueMetrics.pending_jobs}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Failed Jobs</span>
                                    <Badge variant={queueMetrics.failed_jobs > 0 ? 'destructive' : 'secondary'}>
                                        {queueMetrics.failed_jobs}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* SigNoz APM Integration */}
                <div className="grid gap-6">
                    <Card className={apm.available ? 'border-blue-200' : 'opacity-80'}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Activity className={`h-5 w-5 ${apm.available ? 'text-blue-500' : 'text-muted-foreground'}`} />
                                    Application Performance (SigNoz APM)
                                </CardTitle>
                                <CardDescription>Real-time telemetry for service: <span className="font-mono text-blue-600">{apm.service}</span></CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                                {!apm.available && (
                                    <Badge variant="outline" className="text-amber-600 bg-amber-50 border-amber-200">
                                        APM Idle / Connecting...
                                    </Badge>
                                )}
                                {apm.available && (
                                    <Badge className="bg-blue-500">Connected</Badge>
                                )}
                                <Button variant="ghost" size="sm" asChild>
                                    <a href={apm.dashboard_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600">
                                        Open SigNoz Dashboard
                                    </a>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {!apm.available ? (
                                <div className="py-8 text-center bg-muted/20 rounded-lg border-2 border-dashed">
                                    <p className="text-sm font-medium text-muted-foreground">SigNoz Collector not responding or disabled.</p>
                                    <p className="text-xs text-muted-foreground mt-1">APM metrics will appear here once the SigNoz agent is active on the server.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="grid gap-6 md:grid-cols-3">
                                        {/* Latency Cards */}
                                        <div className="p-4 rounded-xl border bg-card shadow-sm">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Response Latency</p>
                                            <div className="flex items-end justify-between gap-2">
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-blue-600">{apm.latency.p50 ?? '—'}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold">P50 (Median)</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-indigo-600">{apm.latency.p90 ?? '—'}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold">P90</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-2xl font-bold text-purple-600">{apm.latency.p99 ?? '—'}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold">P99 (Tail)</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Error Rate */}
                                        <div className="p-4 rounded-xl border bg-card shadow-sm">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Error Stability</p>
                                            <div className="flex items-center gap-4">
                                                <div className="text-3xl font-bold">
                                                    {apm.error_rate.rate !== null ? `${apm.error_rate.rate}%` : '0.00%'}
                                                </div>
                                                <div className="flex-1">
                                                    <Progress 
                                                        value={apm.error_rate.rate ?? 0} 
                                                        className="h-2" 
                                                        style={{ backgroundColor: '#f0f0f0' }}
                                                    />
                                                    <p className="text-[10px] text-muted-foreground mt-1">
                                                        {apm.error_rate.total_errors ?? 0} errors in last {apm.error_rate.period_hours}h
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Throughput */}
                                        <div className="p-4 rounded-xl border bg-card shadow-sm">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Traffic Intensity</p>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-3xl font-bold">{apm.error_rate.total_requests ?? '—'}</p>
                                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Requests (24h)</p>
                                                </div>
                                                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                                    <RefreshCw className="h-5 w-5 text-blue-500" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Slow Endpoints Table */}
                                    <div className="rounded-lg border overflow-hidden">
                                        <div className="bg-muted/50 px-4 py-2 border-b">
                                            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Top 5 Slowest Endpoints (Tail Latency Analysis)</p>
                                        </div>
                                        <div className="divide-y">
                                            {apm.slow_endpoints.length > 0 ? apm.slow_endpoints.slice(0, 5).map((op, i) => (
                                                <div key={i} className="px-4 py-3 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline" className="font-mono text-[10px]">{op.method}</Badge>
                                                        <span className="text-sm font-medium">{op.endpoint}</span>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className="text-sm font-bold text-red-600">{op.avg_latency_ms}ms</p>
                                                            <p className="text-[10px] text-muted-foreground">avg latency</p>
                                                        </div>
                                                        <div className="text-right min-w-[60px]">
                                                            <p className="text-sm font-bold">{op.calls}</p>
                                                            <p className="text-[10px] text-muted-foreground">calls</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="p-4 text-center text-sm text-muted-foreground">No tracing data collected for endpoints yet.</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Historical Statistics */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Average Metrics</CardTitle>
                            <CardDescription>Average values over the selected period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">CPU Usage</span>
                                    <span className="font-medium">{historicalData.averages.cpu}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Memory Usage</span>
                                    <span className="font-medium">{historicalData.averages.memory}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Disk Usage</span>
                                    <span className="font-medium">{historicalData.averages.disk}%</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Database Response</span>
                                    <span className="font-medium">{historicalData.averages.database} ms</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Peak Metrics</CardTitle>
                            <CardDescription>Maximum values recorded</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">CPU Usage</span>
                                    <Badge variant={historicalData.peaks.cpu > 85 ? 'destructive' : 'secondary'}>
                                        {historicalData.peaks.cpu}%
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Memory Usage</span>
                                    <Badge variant={historicalData.peaks.memory > 90 ? 'destructive' : 'secondary'}>
                                        {historicalData.peaks.memory}%
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Disk Usage</span>
                                    <Badge variant={historicalData.peaks.disk > 85 ? 'destructive' : 'secondary'}>
                                        {historicalData.peaks.disk}%
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Database Response</span>
                                    <Badge variant={historicalData.peaks.database > 100 ? 'destructive' : 'secondary'}>
                                        {historicalData.peaks.database} ms
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Health Logs */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Health Logs</CardTitle>
                        <CardDescription>Last {historicalData.timeline.length} health check entries</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {historicalData.timeline.slice(-10).reverse().map((log, index) => (
                                <div key={index} className="flex items-center justify-between border-b pb-2 last:border-0">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-2 w-2 rounded-full ${getStatusColor(log.status)}`} />
                                        <span className="text-sm text-muted-foreground">{log.timestamp}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span>CPU: {log.cpu_usage}%</span>
                                        <span>RAM: {log.memory_usage}%</span>
                                        <span>Disk: {log.disk_usage}%</span>
                                        <span>DB: {log.database_response_ms}ms</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
