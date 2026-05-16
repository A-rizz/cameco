import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import { HardDrive, Folder, TrendingUp, Trash2, Database, FileCode, Package } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

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

interface Directory {
    name: string;
    path: string;
    size_bytes: number;
    size_formatted: string;
    description: string;
}

interface TrendPoint {
    date: string;
    used_bytes: number;
    used_formatted: string;
}

interface Props {
    storage: StorageMetrics;
    directories: Directory[];
    trends: TrendPoint[];
}

export default function Storage({ storage, directories, trends }: Props) {
    const [showCleanupDialog, setShowCleanupDialog] = useState(false);

    const handleCleanup = () => {
        setShowCleanupDialog(false);
        router.post('/system/storage/cleanup');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'healthy':
                return 'text-green-600';
            case 'warning':
                return 'text-yellow-600';
            case 'critical':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage > 90) return 'bg-red-500';
        if (percentage > 80) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getDirectoryIcon = (name: string) => {
        switch (name.toLowerCase()) {
            case 'database':
                return <Database className="h-5 w-5" />;
            case 'vendor':
            case 'node modules':
                return <Package className="h-5 w-5" />;
            case 'storage':
            case 'public':
                return <Folder className="h-5 w-5" />;
            default:
                return <FileCode className="h-5 w-5" />;
        }
    };

    // Calculate percentage for each directory
    const directoriesWithPercentage = directories.map(dir => ({
        ...dir,
        percentage: ((dir.size_bytes / storage.total_bytes) * 100).toFixed(1),
    }));

    return (
        <AppLayout>
            <Head title="Storage Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight dark:text-foreground">Storage Management</h1>
                        <p className="text-muted-foreground">Monitor and manage disk space utilization</p>
                    </div>
                    <Button onClick={() => setShowCleanupDialog(true)} variant="outline">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clean Up Storage
                    </Button>
                </div>

                {/* Overall Storage Status */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <HardDrive className="h-5 w-5" />
                                    Overall Disk Usage
                                </CardTitle>
                                <CardDescription>Total storage capacity and usage</CardDescription>
                            </div>
                            <Badge variant={storage.status === 'healthy' ? 'default' : storage.status === 'warning' ? 'secondary' : 'destructive'}>
                                {storage.status}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Disk Usage</span>
                                <span className={`text-2xl font-bold ${getStatusColor(storage.status)}`}>
                                    {storage.usage_percentage.toFixed(1)}%
                                </span>
                            </div>
                            <div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
                                <div
                                    className={`${getProgressColor(storage.usage_percentage)} h-4 rounded-full transition-all`}
                                    style={{ width: `${storage.usage_percentage}%` }}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Capacity</p>
                                <p className="text-xl font-bold">{storage.total_formatted}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Used Space</p>
                                <p className="text-xl font-bold text-blue-600">{storage.used_formatted}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Free Space</p>
                                <p className="text-xl font-bold text-green-600">{storage.free_formatted}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Directory Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Folder className="h-5 w-5" />
                            Storage Breakdown by Directory
                        </CardTitle>
                        <CardDescription>Disk space usage by major directories</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {directoriesWithPercentage.map((dir, index) => (
                                <div key={index} className="space-y-2 pb-4 border-b last:border-0">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className="text-muted-foreground mt-1">
                                                {getDirectoryIcon(dir.name)}
                                            </div>
                                            <div>
                                                <p className="font-medium">{dir.name}</p>
                                                <p className="text-sm text-muted-foreground">{dir.description}</p>
                                                <p className="text-xs text-muted-foreground mt-1">/{dir.path}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-semibold">{dir.size_formatted}</p>
                                            <p className="text-xs text-muted-foreground">{dir.percentage}% of total</p>
                                        </div>
                                    </div>
                                    <Progress value={parseFloat(dir.percentage)} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Storage Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Storage Trends (Last 30 Days)
                        </CardTitle>
                        <CardDescription>Historical storage usage patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Simple trend visualization */}
                            <div className="grid grid-cols-7 gap-2">
                                {trends.slice(-7).map((trend, index) => {
                                    const percentage = (trend.used_bytes / storage.total_bytes) * 100;
                                    return (
                                        <div key={index} className="text-center">
                                            <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded relative flex items-end justify-center">
                                                <div
                                                    className={`w-full ${getProgressColor(percentage)} rounded-b`}
                                                    style={{ height: `${percentage}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </p>
                                            <p className="text-xs font-medium">{trend.used_formatted}</p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Trend Summary */}
                            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                                <div>
                                    <p className="text-sm text-muted-foreground">30 Days Ago</p>
                                    <p className="text-lg font-semibold">{trends[0]?.used_formatted || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Current</p>
                                    <p className="text-lg font-semibold">{trends[trends.length - 1]?.used_formatted || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Growth</p>
                                    <p className="text-lg font-semibold text-blue-600">
                                        {trends.length > 1
                                            ? `+${(((trends[trends.length - 1].used_bytes - trends[0].used_bytes) / trends[0].used_bytes) * 100).toFixed(1)}%`
                                            : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Storage Recommendations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Storage Recommendations</CardTitle>
                        <CardDescription>Suggestions to optimize disk space</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm">
                            {storage.usage_percentage > 80 && (
                                <li className="flex items-start gap-2">
                                    <span className="text-yellow-600">⚠️</span>
                                    <span>Storage usage is high. Consider cleaning up old files or expanding disk capacity.</span>
                                </li>
                            )}
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">💡</span>
                                <span>Run "Clean Up Storage" to remove cache and old log files.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">💡</span>
                                <span>Consider archiving old database backups to external storage.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-blue-600">💡</span>
                                <span>Review and remove unused vendor packages to reduce node_modules and vendor folder sizes.</span>
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>

            {/* Cleanup Confirmation Dialog */}
            <Dialog open={showCleanupDialog} onOpenChange={setShowCleanupDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clean Up Storage</DialogTitle>
                        <DialogDescription>
                            This will clear the application cache and delete log files older than 30 days. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setShowCleanupDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleCleanup}
                        >
                            Perform Cleanup
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
