import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle 
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    Play, 
    Pause, 
    Trash2, 
    RefreshCw, 
    Plus, 
    MoreVertical, 
    Edit, 
    CheckCircle2, 
    XCircle, 
    Search
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ScheduledJob {
    id: number;
    name: string;
    description: string | null;
    command: string;
    cron_expression: string;
    is_enabled: boolean;
    last_run_at: string | null;
    next_run_at: string | null;
    last_exit_code: number | null;
    run_count: number;
    success_count: number;
    failure_count: number;
    formatted_next_run: string;
    formatted_last_run: string;
    success_rate: number;
    status: 'active' | 'disabled' | 'overdue' | 'failed';
    cron_description: string;
}

interface PaginatedJobs {
    data: ScheduledJob[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface JobMetrics {
    total_jobs: number;
    enabled_jobs: number;
    disabled_jobs: number;
    overdue_jobs: number;
    failed_jobs: number;
    recent_failures: number;
    overall_success_rate: number;
    total_runs: number;
    next_job: {
        name: string;
        next_run_at: string;
        formatted_next_run: string;
    } | null;
}

interface AvailableCommand {
    name: string;
    description: string;
}

interface Props {
    jobs: PaginatedJobs;
    metrics: JobMetrics;
    availableCommands: AvailableCommand[];
    filters: {
        is_enabled?: string;
        status?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
    };
}

export default function Cron({ jobs, metrics, availableCommands, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [enabledFilter, setEnabledFilter] = useState(filters.is_enabled || 'all');
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showRunDialog, setShowRunDialog] = useState(false);
    const [selectedJob, setSelectedJob] = useState<ScheduledJob | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const createForm = useForm({
        name: '',
        description: '',
        command: '',
        cron_expression: '',
        is_enabled: true,
    });

    const editForm = useForm({
        name: '',
        description: '',
        command: '',
        cron_expression: '',
        is_enabled: true,
    });

    const handleSearch = () => {
        router.get('/system/cron', {
            search: searchTerm,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            is_enabled: enabledFilter !== 'all' ? enabledFilter : undefined,
        }, { preserveState: true });
    };

    const handleSync = () => {
        setIsSyncing(true);
        router.post('/system/cron/sync', {}, {
            onFinish: () => setIsSyncing(false),
        });
    };

    const handleToggle = (jobId: number) => {
        router.post(`/system/cron/${jobId}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    const handleRun = () => {
        if (!selectedJob) return;

        router.post(`/system/cron/${selectedJob.id}/run`, {}, {
            preserveScroll: true,
            onSuccess: () => {
                setShowRunDialog(false);
                setSelectedJob(null);
            }
        });
    };

    const handleDelete = () => {
        if (!selectedJob) return;
        
        router.delete(`/system/cron/${selectedJob.id}`, {
            onSuccess: () => {
                setShowDeleteDialog(false);
                setSelectedJob(null);
            },
        });
    };

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        createForm.post('/system/cron', {
            onSuccess: () => {
                setShowCreateDialog(false);
                createForm.reset();
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedJob) return;

        editForm.put(`/system/cron/${selectedJob.id}`, {
            onSuccess: () => {
                setShowEditDialog(false);
                setSelectedJob(null);
                editForm.reset();
            },
        });
    };

    const openEditDialog = (job: ScheduledJob) => {
        setSelectedJob(job);
        editForm.setData({
            name: job.name,
            description: job.description || '',
            command: job.command,
            cron_expression: job.cron_expression,
            is_enabled: job.is_enabled,
        });
        setShowEditDialog(true);
    };

    const getStatusBadge = (job: ScheduledJob) => {
        if (!job.is_enabled) {
            return <Badge variant="secondary">Disabled</Badge>;
        }
        if (job.status === 'overdue') {
            return <Badge variant="destructive">Overdue</Badge>;
        }
        if (job.status === 'failed') {
            return <Badge variant="destructive">Failed</Badge>;
        }
        return <Badge className="bg-green-500">Active</Badge>;
    };

    return (
        <AppLayout>
            <Head title="Cron Job Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight dark:text-foreground">Scheduled Jobs</h1>
                        <p className="text-muted-foreground">Manage and monitor Laravel scheduled tasks</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button 
                            variant="outline" 
                            onClick={handleSync}
                            disabled={isSyncing}
                        >
                            <RefreshCw className={cn("mr-2 h-4 w-4", isSyncing && "animate-spin")} />
                            Sync Jobs
                        </Button>
                        <Button onClick={() => setShowCreateDialog(true)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Custom Job
                        </Button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Jobs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.total_jobs}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                <span className="text-green-600">{metrics.enabled_jobs} enabled</span>
                                {' / '}
                                <span className="text-gray-500">{metrics.disabled_jobs} disabled</span>
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.overall_success_rate.toFixed(1)}%</div>
                            <Progress 
                                value={metrics.overall_success_rate} 
                                className="mt-2"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Runs</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.total_runs}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {metrics.recent_failures > 0 && (
                                    <span className="text-red-600">{metrics.recent_failures} recent failures</span>
                                )}
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Next Job</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {metrics.next_job ? (
                                <>
                                    <div className="text-sm font-semibold truncate">{metrics.next_job.name}</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {metrics.next_job.formatted_next_run}
                                    </p>
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">No scheduled jobs</div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Jobs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Label htmlFor="search">Search</Label>
                                <div className="flex gap-2 mt-1">
                                    <Input
                                        id="search"
                                        placeholder="Search by name or command..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button onClick={handleSearch}>
                                        <Search className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="w-full sm:w-48">
                                <Label htmlFor="status">Status</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger id="status" className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Status</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="overdue">Overdue</SelectItem>
                                        <SelectItem value="failed">Failed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="w-full sm:w-48">
                                <Label htmlFor="enabled">Enabled</Label>
                                <Select value={enabledFilter} onValueChange={setEnabledFilter}>
                                    <SelectTrigger id="enabled" className="mt-1">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Jobs</SelectItem>
                                        <SelectItem value="1">Enabled Only</SelectItem>
                                        <SelectItem value="0">Disabled Only</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Jobs Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Scheduled Jobs</CardTitle>
                        <CardDescription>
                            Showing {jobs.data.length} of {jobs.total} jobs
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Command</th>
                                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Schedule</th>
                                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Last Run</th>
                                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Next Run</th>
                                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Success Rate</th>
                                        <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {jobs.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="p-8 text-center text-muted-foreground">
                                                No scheduled jobs found. Click "Sync Jobs" to discover Laravel scheduled commands.
                                            </td>
                                        </tr>
                                    ) : (
                                        jobs.data.map((job) => (
                                            <tr key={job.id} className="border-b hover:bg-muted/50">
                                                <td className="p-3">
                                                    <div className="font-medium">{job.name}</div>
                                                    {job.description && (
                                                        <div className="text-xs text-muted-foreground truncate max-w-xs">
                                                            {job.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <code className="text-xs bg-muted px-2 py-1 rounded">
                                                        {job.command}
                                                    </code>
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-sm">{job.cron_expression}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {job.cron_description}
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    {getStatusBadge(job)}
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-sm">{job.formatted_last_run}</div>
                                                    {job.last_exit_code !== null && (
                                                        <div className="flex items-center gap-1 text-xs">
                                                            {job.last_exit_code === 0 ? (
                                                                <CheckCircle2 className="h-3 w-3 text-green-600" />
                                                            ) : (
                                                                <XCircle className="h-3 w-3 text-red-600" />
                                                            )}
                                                            <span className={job.last_exit_code === 0 ? 'text-green-600' : 'text-red-600'}>
                                                                Exit {job.last_exit_code}
                                                            </span>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    <div className="text-sm">{job.formatted_next_run}</div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        <Progress 
                                                            value={job.success_rate} 
                                                            className="h-2 w-16"
                                                        />
                                                        <span className="text-sm font-medium">
                                                            {job.success_rate.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {job.success_count}/{job.run_count} runs
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleToggle(job.id)}
                                                        >
                                                            {job.is_enabled ? (
                                                                <Pause className="h-4 w-4" />
                                                            ) : (
                                                                <Play className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button size="sm" variant="ghost">
                                                                    <MoreVertical className="h-4 w-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem onClick={() => {
                                                                    setSelectedJob(job);
                                                                    setShowRunDialog(true);
                                                                }}>
                                                                    <Play className="mr-2 h-4 w-4" />
                                                                    Run Now
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={() => openEditDialog(job)}>
                                                                    <Edit className="mr-2 h-4 w-4" />
                                                                    Edit
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem 
                                                                    onClick={() => {
                                                                        setSelectedJob(job);
                                                                        setShowDeleteDialog(true);
                                                                    }}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {jobs.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <div className="text-sm text-muted-foreground">
                                    Page {jobs.current_page} of {jobs.last_page}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={jobs.current_page === 1}
                                        onClick={() => router.get(`/system/cron?page=${jobs.current_page - 1}`)}
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={jobs.current_page === jobs.last_page}
                                        onClick={() => router.get(`/system/cron?page=${jobs.current_page + 1}`)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Create Job Dialog */}
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Create Scheduled Job</DialogTitle>
                            <DialogDescription>
                                Add a new scheduled job to run Laravel Artisan commands
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreate}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="create-name">Name *</Label>
                                    <Input
                                        id="create-name"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                        placeholder="Daily Cache Clear"
                                        required
                                    />
                                    {createForm.errors.name && (
                                        <p className="text-sm text-red-600">{createForm.errors.name}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-description">Description</Label>
                                    <Input
                                        id="create-description"
                                        value={createForm.data.description}
                                        onChange={(e) => createForm.setData('description', e.target.value)}
                                        placeholder="Clears application cache daily"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-command">Command *</Label>
                                    <Select 
                                        value={createForm.data.command}
                                        onValueChange={(value) => createForm.setData('command', value)}
                                    >
                                        <SelectTrigger id="create-command">
                                            <SelectValue placeholder="Select an Artisan command" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableCommands.map((cmd) => (
                                                <SelectItem key={cmd.name} value={cmd.name}>
                                                    <div>
                                                        <div className="font-medium">{cmd.name}</div>
                                                        <div className="text-xs text-muted-foreground">{cmd.description}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {createForm.errors.command && (
                                        <p className="text-sm text-red-600">{createForm.errors.command}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="create-cron">Cron Expression *</Label>
                                    <Input
                                        id="create-cron"
                                        value={createForm.data.cron_expression}
                                        onChange={(e) => createForm.setData('cron_expression', e.target.value)}
                                        placeholder="0 0 * * *"
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Examples: <code>* * * * *</code> (every minute), 
                                        <code> 0 * * * *</code> (hourly), 
                                        <code> 0 0 * * *</code> (daily)
                                    </p>
                                    {createForm.errors.cron_expression && (
                                        <p className="text-sm text-red-600">{createForm.errors.cron_expression}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="create-enabled"
                                        checked={createForm.data.is_enabled}
                                        onChange={(e) => createForm.setData('is_enabled', e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="create-enabled" className="cursor-pointer">
                                        Enable job immediately
                                    </Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setShowCreateDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createForm.processing}>
                                    {createForm.processing ? 'Creating...' : 'Create Job'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Job Dialog */}
                <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Edit Scheduled Job</DialogTitle>
                            <DialogDescription>
                                Update the scheduled job configuration
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEdit}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-name">Name *</Label>
                                    <Input
                                        id="edit-name"
                                        value={editForm.data.name}
                                        onChange={(e) => editForm.setData('name', e.target.value)}
                                        required
                                    />
                                    {editForm.errors.name && (
                                        <p className="text-sm text-red-600">{editForm.errors.name}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-description">Description</Label>
                                    <Input
                                        id="edit-description"
                                        value={editForm.data.description}
                                        onChange={(e) => editForm.setData('description', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-command">Command *</Label>
                                    <Select 
                                        value={editForm.data.command}
                                        onValueChange={(value) => editForm.setData('command', value)}
                                    >
                                        <SelectTrigger id="edit-command">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableCommands.map((cmd) => (
                                                <SelectItem key={cmd.name} value={cmd.name}>
                                                    <div>
                                                        <div className="font-medium">{cmd.name}</div>
                                                        <div className="text-xs text-muted-foreground">{cmd.description}</div>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {editForm.errors.command && (
                                        <p className="text-sm text-red-600">{editForm.errors.command}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="edit-cron">Cron Expression *</Label>
                                    <Input
                                        id="edit-cron"
                                        value={editForm.data.cron_expression}
                                        onChange={(e) => editForm.setData('cron_expression', e.target.value)}
                                        required
                                    />
                                    {editForm.errors.cron_expression && (
                                        <p className="text-sm text-red-600">{editForm.errors.cron_expression}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="edit-enabled"
                                        checked={editForm.data.is_enabled}
                                        onChange={(e) => editForm.setData('is_enabled', e.target.checked)}
                                        className="h-4 w-4"
                                    />
                                    <Label htmlFor="edit-enabled" className="cursor-pointer">
                                        Job enabled
                                    </Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setShowEditDialog(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editForm.processing}>
                                    {editForm.processing ? 'Updating...' : 'Update Job'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Delete Scheduled Job</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete "{selectedJob?.name}"? This action cannot be undone.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button 
                                variant="outline" 
                                onClick={() => setShowDeleteDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                variant="destructive" 
                                onClick={handleDelete}
                            >
                                Delete Job
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Run Confirmation Dialog */}
                <Dialog open={showRunDialog} onOpenChange={setShowRunDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Execute Job</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to run "{selectedJob?.name}" right now? This will execute the command in the background.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button 
                                variant="outline" 
                                onClick={() => setShowRunDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleRun}
                            >
                                Run Now
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
