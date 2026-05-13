import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Database,
    Download,
    Trash2,
    Cloud,
    HardDrive,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Loader2,
} from 'lucide-react';
import { useState } from 'react';

// ── Shape returned by the new BackupController ──────────────────────────────

interface BackupFile {
    name: string;           // e.g. "cameco-2026-05-13-02-00-00.zip"
    path: string;
    size: number;           // bytes
    last_modified: number;  // unix timestamp
    disk: string;
    disks: string[];        // ['local'] | ['s3'] | ['local','s3']
}

interface Stats {
    total: number;
    local_count: number;
    cloud_count: number;
    total_size: number;
    latest: BackupFile | null;
}

interface HistoryItem {
    id: number;
    backup_type: string;
    status: string;
    error_message: string | null;
    started_at: string;
    completed_at: string | null;
    created_at: string;
}

interface Filters {
    days: number;
}

interface Props {
    backups: BackupFile[];
    stats: Stats;
    history: HistoryItem[];
    retention_days: number;
    filters: Filters;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatDate(timestamp: number): string {
    return new Date(timestamp * 1000).toLocaleString();
}

function DiskBadge({ disk }: { disk: string }) {
    return disk === 's3' ? (
        <Badge variant="outline" className="gap-1 text-blue-600 border-blue-300">
            <Cloud className="h-3 w-3" /> Cloud
        </Badge>
    ) : (
        <Badge variant="outline" className="gap-1 text-gray-600 border-gray-300">
            <HardDrive className="h-3 w-3" /> Local
        </Badge>
    );
}

function StatusBadge({ status }: { status: string }) {
    switch (status) {
        case 'completed':
            return (
                <Badge className="bg-green-500 gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Completed
                </Badge>
            );
        case 'failed':
            return (
                <Badge className="bg-red-500 gap-1">
                    <XCircle className="h-3 w-3" /> Failed
                </Badge>
            );
        case 'in_progress':
            return (
                <Badge className="bg-blue-500 gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> In Progress
                </Badge>
            );
        default:
            return <Badge>{status}</Badge>;
    }
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Backups({ backups, stats, history, retention_days, filters }: Props) {
    const [triggeringBackup, setTriggeringBackup] = useState(false);
    const [runningCleanup, setRunningCleanup] = useState(false);

    const backupList = backups ?? [];

    const triggerBackup = () => {
        setTriggeringBackup(true);
        router.post(route('system.backups.trigger'), {}, {
            onFinish: () => setTriggeringBackup(false),
        });
    };

    const runCleanup = () => {
        setRunningCleanup(true);
        router.post(route('system.backups.cleanup'), {}, {
            onFinish: () => setRunningCleanup(false),
        });
    };

    const downloadFile = (file: BackupFile) => {
        const preferredDisk = file.disks.includes('s3') ? 's3' : 'local';
        router.post(route('system.backups.download'), {
            file: file.name,
            disk: preferredDisk,
        });
    };

    const deleteFile = (file: BackupFile) => {
        if (!confirm(`Delete backup "${file.name}" from ${file.disks.join(' + ')}?`)) return;
        router.post(route('system.backups.delete-file'), {
            file: file.name,
            disks: file.disks,
        });
    };

    return (
        <AppLayout>
            <Head title="Backup Management" />

            <div className="space-y-6 p-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Backup Management</h1>
                        <p className="text-muted-foreground">
                            Nightly database backups — local &amp; cloud. Retention: {retention_days} days.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={runCleanup} disabled={runningCleanup}>
                            {runningCleanup
                                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                : <Trash2 className="h-4 w-4 mr-2" />}
                            Run Cleanup
                        </Button>
                        <Button onClick={triggerBackup} disabled={triggeringBackup}>
                            {triggeringBackup
                                ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                : <Database className="h-4 w-4 mr-2" />}
                            Create Backup Now
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Backups</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stats.total}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <HardDrive className="h-4 w-4" /> Local
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stats.local_count}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Cloud className="h-4 w-4" /> Cloud (S3)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stats.cloud_count}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Storage Used</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatBytes(stats.total_size)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Backup Files */}
                <Card>
                    <CardHeader>
                        <CardTitle>Backup Files</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {backupList.length === 0 ? (
                            <div className="py-12 text-center text-muted-foreground">
                                <Database className="h-12 w-12 mx-auto mb-3 opacity-40" />
                                <p className="font-medium">No backup files found</p>
                                <p className="text-sm mt-1">Click "Create Backup Now" to generate the first backup.</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {backupList.map((file) => (
                                    <div key={file.name} className="flex items-center justify-between py-4">
                                        <div className="flex items-center gap-3">
                                            <Database className="h-5 w-5 shrink-0 text-muted-foreground" />
                                            <div>
                                                <p className="font-mono text-sm font-medium">{file.name}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {formatDate(file.last_modified)} · {formatBytes(file.size)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {/* Disk badges */}
                                            {file.disks.map((d) => (
                                                <DiskBadge key={d} disk={d} />
                                            ))}

                                            {/* Actions */}
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => downloadFile(file)}
                                                title="Download"
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => deleteFile(file)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Event History (DB log) */}
                {history && history.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" /> Backup Event Log
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="divide-y">
                                {history.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between py-3">
                                        <div>
                                            <p className="text-sm font-medium capitalize">{item.backup_type} backup</p>
                                            {item.error_message && (
                                                <p className="text-xs text-red-500 mt-0.5">{item.error_message}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {new Date(item.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <StatusBadge status={item.status} />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>
        </AppLayout>
    );
}
