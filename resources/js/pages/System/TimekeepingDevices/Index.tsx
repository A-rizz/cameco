import { Head, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, RefreshCw, Download, Wifi, WifiOff, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

/**
 * Device interface representing RFID scanner/reader information
 */
interface Device {
    id: string;
    name: string;
    device_type: 'reader' | 'controller' | 'hybrid';
    status: 'online' | 'offline' | 'maintenance' | 'error';
    location: string;
    ip_address: string;
    port: number;
    last_heartbeat: string | null;
    installation_date: string;
    firmware_version: string;
    sync_status: 'synced' | 'pending' | 'failed';
    maintenance_due: boolean;
    last_issue_at: string | null; // For "Last 24h Issues" filter
    notes?: string;
}

/**
 * Props for the Device Management page
 */
interface TimekeepingDevicesProps {
    devices: Device[];
    stats: {
        total_devices: number;
        online_devices: number;
        offline_devices: number;
        maintenance_due: number;
    };
}

/**
 * Device Management Layout Component - Subtask 1.1.1
 * 
 * Main page component displaying RFID device management interface
 * Features:
 * - Page header with title and breadcrumbs
 * - Action buttons: Register New Device, Sync with Server, Export Report
 * - Tab navigation: All Devices, Active, Offline, Maintenance
 * - Responsive layout (grid on desktop, stack on mobile)
 * - Status dashboard with stats cards
 */
export default function TimekeepingDevicesIndex({
    devices = [],
    stats = {
        total_devices: 0,
        online_devices: 0,
        offline_devices: 0,
        maintenance_due: 0,
    },
}: TimekeepingDevicesProps) {
    const [selectedTab, setSelectedTab] = useState('all');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showCriticalOnly, setShowCriticalOnly] = useState(false);
    const [showLast24hIssues, setShowLast24hIssues] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    /**
     * Check if device had issues in the last 24 hours
     */
    const hasRecentIssue = (device: Device): boolean => {
        if (!device.last_issue_at) return false;
        const issueTime = new Date(device.last_issue_at).getTime();
        const now = new Date().getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;
        return (now - issueTime) <= oneDayMs;
    };

    /**
     * Check if device is critical
     */
    const isCritical = (device: Device): boolean => {
        return (
            device.status === 'offline' ||
            device.status === 'error' ||
            (device.status === 'maintenance' && device.maintenance_due)
        );
    };

    /**
     * Filter devices based on selected tab
     */
    const getFilteredDevices = () => {
        let filtered = devices;

        // Apply tab filter
        switch (selectedTab) {
            case 'active':
                filtered = filtered.filter(d => d.status === 'online');
                break;
            case 'offline':
                filtered = filtered.filter(d => d.status === 'offline');
                break;
            case 'maintenance':
                filtered = filtered.filter(d => d.status === 'maintenance' || d.maintenance_due);
                break;
            default:
                break;
        }

        // Apply critical only filter
        if (showCriticalOnly) {
            filtered = filtered.filter(d => isCritical(d));
        }

        // Apply last 24h issues filter
        if (showLast24hIssues) {
            filtered = filtered.filter(d => hasRecentIssue(d));
        }

        return filtered;
    };

    /**
     * Handle page refresh
     */
    const handleRefresh = () => {
        setIsRefreshing(true);
        setLastUpdated(new Date());
        router.reload({
            onFinish: () => setIsRefreshing(false),
        });
    };

    /**
     * Handle register new device
     */
    const handleRegisterDevice = () => {
        // TODO: Navigate to registration page or open modal
        router.visit('/system/timekeeping-devices/register');
    };

    /**
     * Handle sync with server
     */
    const handleSyncWithServer = () => {
        // TODO: Trigger sync API call
        console.log('Syncing with FastAPI server...');
    };

    /**
     * Handle export report
     */
    const handleExportReport = () => {
        // TODO: Trigger export functionality
        console.log('Exporting device report...');
    };

    /**
     * Get status badge variant
     */
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'online':
                return <Badge variant="default" className="bg-green-600">Online</Badge>;
            case 'offline':
                return <Badge variant="destructive">Offline</Badge>;
            case 'maintenance':
                return <Badge variant="secondary">Maintenance</Badge>;
            case 'error':
                return <Badge variant="destructive" className="bg-red-600">Error</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    /**
     * Get status icon
     */
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'online':
                return <Wifi className="h-4 w-4 text-green-600" />;
            case 'offline':
                return <WifiOff className="h-4 w-4 text-red-600" />;
            case 'maintenance':
                return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
            default:
                return <CheckCircle2 className="h-4 w-4 text-gray-400" />;
        }
    };

    const filteredDevices = getFilteredDevices();

    return (
        <AppLayout>
            <Head title="Device Management" />

            <div className="space-y-6 p-6">
                {/* ================== SECTION: Page Header ================== */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight dark:text-foreground">
                            Device Management
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Monitor and manage RFID scanners and readers
                        </p>
                    </div>

                    {/* ================== SECTION: Action Buttons ================== */}
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                            onClick={handleRegisterDevice}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Register Device
                        </Button>
                        <Button
                            onClick={handleSyncWithServer}
                            variant="outline"
                            className="gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Sync Server
                        </Button>
                        <Button
                            onClick={handleExportReport}
                            variant="outline"
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Export
                        </Button>
                    </div>
                </div>

                {/* ================== SECTION: Status Dashboard ================== */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Total Devices Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_devices}</div>
                            <p className="text-xs text-muted-foreground">All registered devices</p>
                        </CardContent>
                    </Card>

                    {/* Online Devices Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Online</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.online_devices}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats.total_devices > 0
                                    ? `${((stats.online_devices / stats.total_devices) * 100).toFixed(0)}% operational`
                                    : 'No devices'}
                            </p>
                        </CardContent>
                    </Card>

                    {/* Offline Devices Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Offline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.offline_devices}</div>
                            <p className="text-xs text-muted-foreground">Requires attention</p>
                        </CardContent>
                    </Card>

                    {/* Maintenance Due Card */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium">Maintenance Due</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.maintenance_due}</div>
                            <p className="text-xs text-muted-foreground">Schedule required</p>
                        </CardContent>
                    </Card>
                </div>

                {/* ================== SECTION: Quick Filters ================== */}
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="text-base">Quick Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="critical-only"
                                    checked={showCriticalOnly}
                                    onCheckedChange={(checked) => setShowCriticalOnly(checked as boolean)}
                                />
                                <label htmlFor="critical-only" className="text-sm font-medium cursor-pointer">
                                    Show Critical Only
                                </label>
                                <Badge variant="destructive" className="ml-2">
                                    Offline, Error, or Due
                                </Badge>
                            </div>

                            <div className="flex items-center gap-3">
                                <Checkbox
                                    id="last-24h"
                                    checked={showLast24hIssues}
                                    onCheckedChange={(checked) => setShowLast24hIssues(checked as boolean)}
                                />
                                <label htmlFor="last-24h" className="text-sm font-medium cursor-pointer">
                                    Last 24h Issues
                                </label>
                                <Badge variant="outline" className="ml-2">
                                    Recent problems
                                </Badge>
                            </div>

                            <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* ================== SECTION: Tab Navigation ================== */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Device List</CardTitle>
                                <CardDescription>
                                    Manage and monitor all registered RFID devices
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        Updated: {lastUpdated.toLocaleTimeString()}
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="gap-2"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                    {isRefreshing ? 'Syncing...' : 'Refresh'}
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Tabs */}
                        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
                            <div className="mb-4">
                                <TabsList className="grid w-full max-w-md grid-cols-4">
                                    <TabsTrigger value="all">
                                        All
                                        <span className="ml-2 text-xs">
                                            ({devices.length})
                                        </span>
                                    </TabsTrigger>
                                    <TabsTrigger value="active">
                                        Online
                                        <span className="ml-2 text-xs">
                                            ({devices.filter(d => d.status === 'online').length})
                                        </span>
                                    </TabsTrigger>
                                    <TabsTrigger value="offline">
                                        Offline
                                        <span className="ml-2 text-xs">
                                            ({devices.filter(d => d.status === 'offline').length})
                                        </span>
                                    </TabsTrigger>
                                    <TabsTrigger value="maintenance">
                                        Service
                                        <span className="ml-2 text-xs">
                                            ({devices.filter(d => d.status === 'maintenance' || d.maintenance_due).length})
                                        </span>
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            {/* Tab: All Devices */}
                            <TabsContent value="all" className="space-y-4">
                                {filteredDevices.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center">
                                        <WifiOff className="h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="text-muted-foreground">No devices registered yet</p>
                                        <Button
                                            onClick={handleRegisterDevice}
                                            variant="link"
                                            className="mt-2"
                                        >
                                            Register your first device
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredDevices.map(device => (
                                            <DeviceRow key={device.id} device={device} statusIcon={getStatusIcon} statusBadge={getStatusBadge} />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Tab: Online Devices */}
                            <TabsContent value="active" className="space-y-4">
                                {filteredDevices.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center">
                                        <Wifi className="h-8 w-8 text-muted-foreground mb-2" />
                                        <p className="text-muted-foreground">No online devices</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredDevices.map(device => (
                                            <DeviceRow key={device.id} device={device} statusIcon={getStatusIcon} statusBadge={getStatusBadge} />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Tab: Offline Devices */}
                            <TabsContent value="offline" className="space-y-4">
                                {filteredDevices.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center">
                                        <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                                        <p className="text-muted-foreground">All devices are online!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredDevices.map(device => (
                                            <DeviceRow key={device.id} device={device} statusIcon={getStatusIcon} statusBadge={getStatusBadge} />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            {/* Tab: Maintenance Devices */}
                            <TabsContent value="maintenance" className="space-y-4">
                                {filteredDevices.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center p-8 text-center">
                                        <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                                        <p className="text-muted-foreground">No devices requiring maintenance</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {filteredDevices.map(device => (
                                            <DeviceRow key={device.id} device={device} statusIcon={getStatusIcon} statusBadge={getStatusBadge} />
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* ================== SECTION: Help Text ================== */}
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardHeader>
                        <CardTitle className="text-base">Device Management Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-2">
                        <p>
                            • Register new RFID scanners and readers using the <strong>Register Device</strong> button
                        </p>
                        <p>
                            • Monitor real-time device status: Online, Offline, or Maintenance
                        </p>
                        <p>
                            • Click <strong>Sync Server</strong> to synchronize device data with FastAPI backend
                        </p>
                        <p>
                            • Export device reports for compliance and auditing
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

/**
 * Device Row Component
 * Renders a single device row with status, information, and actions
 */
function DeviceRow({
    device,
    statusIcon: getStatusIcon,
    statusBadge: getStatusBadge,
}: {
    device: Device;
    statusIcon: (status: string) => React.ReactNode;
    statusBadge: (status: string) => React.ReactNode;
}) {
    return (
        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 flex-1">
                {getStatusIcon(device.status)}
                <div className="flex-1">
                    <div className="font-medium">{device.name}</div>
                    <div className="text-sm text-muted-foreground">
                        {device.location} • {device.ip_address}:{device.port}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="text-right">
                    <div className="text-sm font-medium">{device.device_type}</div>
                    <div className="text-xs text-muted-foreground">v{device.firmware_version}</div>
                </div>
                {getStatusBadge(device.status)}
            </div>
        </div>
    );
}
