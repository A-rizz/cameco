import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    ShieldCheck,
    AlertCircle,
    Info,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';

// ── Types ──────────────────────────────────────────────────────────────────

interface BackupFile {
    name: string;
    path: string;
    size: number;
    last_modified: number;
    disk: string;
    disks: string[];
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

interface Props {
    backups: BackupFile[];
    stats: Stats;
    history: HistoryItem[];
    retention_days: number;
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

export default function Backups({ backups, stats, history, retention_days }: Props) {
    const { toast } = useToast();
    const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
    const [selectedDisks, setSelectedDisks] = useState<string[]>(['local']);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pollingActive, setPollingActive] = useState(false);

    // ── Polling logic ───────────────────────────────────────────────────────

    const checkStatus = useCallback(async () => {
        try {
            const response = await axios.get(route('system.backups.status'));
            const latest = response.data.latest;

            if (latest) {
                if (latest.status === 'completed') {
                    setPollingActive(false);
                    setIsProcessing(false);
                    toast({
                        title: "Backup Successful",
                        description: "Your database backup has been completed and stored.",
                        variant: "default",
                    });
                    router.reload({ only: ['backups', 'stats', 'history'] });
                } else if (latest.status === 'failed') {
                    setPollingActive(false);
                    setIsProcessing(false);
                    toast({
                        title: "Backup Failed",
                        description: latest.error_message || "An error occurred during the backup process.",
                        variant: "destructive",
                    });
                    router.reload({ only: ['backups', 'stats', 'history'] });
                }
            }
        } catch (error) {
            console.error("Status polling failed", error);
        }
    }, [toast]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (pollingActive) {
            interval = setInterval(checkStatus, 3000); // Poll every 3 seconds
        }
        return () => clearInterval(interval);
    }, [pollingActive, checkStatus]);

    // Check if any history item is currently in progress on load
    useEffect(() => {
        const inProgress = history?.some(h => h.status === 'in_progress');
        if (inProgress) {
            setPollingActive(true);
            setIsProcessing(true);
        }
    }, [history]);

    // ── Actions ─────────────────────────────────────────────────────────────

    const handleTriggerBackup = () => {
        if (selectedDisks.length === 0) {
            toast({
                title: "No disks selected",
                description: "Please select at least one storage location.",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);
        setIsTriggerModalOpen(false);

        router.post(route('system.backups.trigger'), {
            disks: selectedDisks
        }, {
            onSuccess: () => {
                setPollingActive(true);
                toast({
                    title: "Backup Initiated",
                    description: "The backup process is running in the background.",
                });
            },
            onError: (errors) => {
                setIsProcessing(false);
                toast({
                    title: "Trigger Failed",
                    description: Object.values(errors)[0] || "Could not start the backup process.",
                    variant: "destructive",
                });
            }
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
        if (!confirm(`Delete backup "${file.name}"?`)) return;
        router.post(route('system.backups.delete-file'), {
            file: file.name,
            disks: file.disks,
        }, {
            onSuccess: () => toast({ title: "Deleted", description: "Backup file removed." }),
        });
    };

    const runCleanup = () => {
        router.post(route('system.backups.cleanup'), {}, {
            onSuccess: () => toast({ title: "Cleanup Finished", description: "Old backups pruned." }),
        });
    };

    return (
        <AppLayout>
            <Head title="Backup Management" />

            <div className="space-y-6 p-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Backup Management</h1>
                        <p className="text-muted-foreground flex items-center gap-1.5 mt-1">
                            <ShieldCheck className="h-4 w-4 text-green-600" />
                            Production-ready database protection · Retention: {retention_days} days
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={runCleanup} className="bg-background">
                            <Trash2 className="h-4 w-4 mr-2 text-muted-foreground" />
                            Run Cleanup
                        </Button>

                        <Dialog open={isTriggerModalOpen} onOpenChange={setIsTriggerModalOpen}>
                            <DialogTrigger asChild>
                                <Button disabled={isProcessing} className="bg-primary hover:bg-primary/90">
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Backing up...
                                        </>
                                    ) : (
                                        <>
                                            <Database className="h-4 w-4 mr-2" />
                                            Create Backup Now
                                        </>
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Configure Manual Backup</DialogTitle>
                                    <DialogDescription>
                                        This will perform a full database dump of your production environment.
                                    </DialogDescription>
                                </DialogHeader>
                                
                                <div className="grid gap-6 py-4">
                                    <div className="space-y-4">
                                        <h4 className="text-sm font-medium leading-none">Storage Destinations</h4>
                                        <div className="grid gap-3">
                                            <div className="flex items-start space-x-3 rounded-md border p-3 shadow-sm">
                                                <Checkbox 
                                                    id="local" 
                                                    checked={selectedDisks.includes('local')}
                                                    onCheckedChange={(checked) => {
                                                        setSelectedDisks(prev => 
                                                            checked ? [...prev, 'local'] : prev.filter(d => d !== 'local')
                                                        )
                                                    }}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <label htmlFor="local" className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2">
                                                        <HardDrive className="h-4 w-4" /> Local Server Storage
                                                    </label>
                                                    <p className="text-xs text-muted-foreground">Stored securely on the application host.</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start space-x-3 rounded-md border p-3 shadow-sm">
                                                <Checkbox 
                                                    id="s3" 
                                                    checked={selectedDisks.includes('s3')}
                                                    onCheckedChange={(checked) => {
                                                        setSelectedDisks(prev => 
                                                            checked ? [...prev, 's3'] : prev.filter(d => d !== 's3')
                                                        )
                                                    }}
                                                />
                                                <div className="grid gap-1.5 leading-none">
                                                    <label htmlFor="s3" className="text-sm font-medium leading-none cursor-pointer flex items-center gap-2">
                                                        <Cloud className="h-4 w-4" /> Cloud Storage (S3/R2)
                                                    </label>
                                                    <p className="text-xs text-muted-foreground text-blue-600 font-medium">Recommended for disaster recovery.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-md bg-amber-50 p-3 flex gap-3 text-amber-800 border border-amber-200">
                                        <Info className="h-5 w-5 shrink-0" />
                                        <p className="text-xs">
                                            A background job will be queued. Large databases may take several minutes to compress and upload.
                                        </p>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="ghost" onClick={() => setIsTriggerModalOpen(false)}>Cancel</Button>
                                    <Button onClick={handleTriggerBackup}>Initiate Backup</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* Processing Overlay (if active) */}
                {isProcessing && (
                    <Card className="border-blue-200 bg-blue-50/50">
                        <CardContent className="pt-6 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-blue-900">Backup in Progress</h3>
                                    <p className="text-sm text-blue-700">Dumping database and encrypting archive... Please don't close this page.</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="animate-pulse bg-white border-blue-300 text-blue-700">
                                Monitoring Live
                            </Badge>
                        </CardContent>
                    </Card>
                )}

                {/* Stats */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Protection</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stats.total} Backups</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2 text-blue-600">
                            <CardTitle className="text-sm font-medium flex items-center gap-1 uppercase tracking-wider">
                                <Cloud className="h-4 w-4" /> Cloud
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stats.cloud_count}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2 text-gray-600">
                            <CardTitle className="text-sm font-medium flex items-center gap-1 uppercase tracking-wider">
                                <HardDrive className="h-4 w-4" /> Local
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{stats.local_count}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Capacity Used</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold">{formatBytes(stats.total_size)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-3">
                    
                    {/* Backup Files List */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Available Recovery Files</CardTitle>
                                <CardDescription>Recently generated ZIP archives containing database dumps.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {backups.length === 0 ? (
                                    <div className="py-20 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                                        <Database className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                        <p className="font-medium text-lg">No backup archives found</p>
                                        <p className="text-sm mt-1 max-w-[250px] mx-auto">Your backup schedule will automatically create protection points nightly.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y">
                                        {backups.map((file) => (
                                            <div key={file.name} className="group flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                                        <Database className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-mono text-sm font-semibold">{file.name}</p>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-xs text-muted-foreground">{formatDate(file.last_modified)}</span>
                                                            <span className="text-xs text-muted-foreground">·</span>
                                                            <span className="text-xs font-medium text-primary">{formatBytes(file.size)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="hidden sm:flex gap-1 mr-2">
                                                        {file.disks.map((d) => (
                                                            <Badge key={d} variant="outline" className="px-1.5 py-0 capitalize text-[10px] font-bold">
                                                                {d}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => downloadFile(file)}
                                                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        onClick={() => deleteFile(file)}
                                                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
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
                    </div>

                    {/* Side logs/info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <RefreshCw className="h-4 w-4" /> Operational History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {history && history.length > 0 ? (
                                    <div className="space-y-4">
                                        {history.slice(0, 10).map((item) => (
                                            <div key={item.id} className="flex gap-3 text-sm">
                                                <div className="mt-0.5">
                                                    {item.status === 'completed' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                                                     item.status === 'failed' ? <XCircle className="h-4 w-4 text-red-500" /> : 
                                                     <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
                                                </div>
                                                <div className="flex-1 space-y-0.5">
                                                    <p className="font-medium leading-none capitalize">{item.backup_type} backup</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleTimeString()}</p>
                                                    {item.error_message && (
                                                        <p className="text-[11px] text-red-600 line-clamp-1 mt-1 bg-red-50 p-1 rounded border border-red-100">
                                                            {item.error_message}
                                                        </p>
                                                    )}
                                                </div>
                                                <StatusBadge status={item.status} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No recent activities logged.</p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-muted/30">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" /> Best Practices
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs space-y-3 text-muted-foreground">
                                <p>• Always keep at least one cloud-based backup for disaster recovery.</p>
                                <p>• Test your recovery process monthly by restoring to a staging environment.</p>
                                <p>• Ensure your S3 bucket has <strong>Versioning</strong> enabled for extra protection.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
