import { Head, router, usePage } from '@inertiajs/react';
import { Check, Clock, Shield, UserX, X } from 'lucide-react';
import { useState } from 'react';

import type { SharedData } from '@/types';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';

interface PasswordRequest {
    id: number;
    user_id: number;
    user_name: string;
    user_email: string;
    status: 'pending' | 'completed' | 'rejected';
    reason: string | null;
    processed_at: string | null;
    created_at: string;
}

interface Props {
    requests: PasswordRequest[];
}


interface FlashProps {
    success?: string;
    error?: string;
    new_password?: string;
}

type PageWithFlash = SharedData & { flash: FlashProps };

export default function PasswordResetRequests({ requests }: Props) {
    const { props } = usePage<PageWithFlash>();
    const flash = props.flash ?? {};

    const [rejectOpen, setRejectOpen] = useState(false);
    const [rejectId, setRejectId] = useState<number | null>(null);
    const [rejectReason, setRejectReason] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState<string | null>(
        flash.new_password ?? null
    );

    const pending = requests.filter((r) => r.status === 'pending');
    const history = requests.filter((r) => r.status !== 'pending');

    const handleProcess = (id: number) => {
        router.post(
            route('admin.password-requests.process', { passwordRequest: id }),
            {},
            {
                onSuccess: ({ props: p }) => {
                    const f = (p as unknown as PageWithFlash).flash;
                    if (f?.new_password) setGeneratedPassword(f.new_password);
                },
            }
        );
    };

    const handleReject = () => {
        if (!rejectId) return;
        router.post(
            route('admin.password-requests.reject', { passwordRequest: rejectId }),
            { reason: rejectReason },
            {
                onSuccess: () => {
                    setRejectOpen(false);
                    setRejectReason('');
                    setRejectId(null);
                },
            }
        );
    };

    const statusBadge = (status: string) => {
        const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            pending:   { label: 'Pending',   variant: 'default' },
            completed: { label: 'Completed', variant: 'secondary' },
            rejected:  { label: 'Rejected',  variant: 'destructive' },
        };
        const cfg = map[status] ?? { label: status, variant: 'outline' };
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Admin', href: '#' }, { title: 'Password Reset Requests', href: '#' }]}>
            <Head title="Password Reset Requests" />

            <div className="flex flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Password Reset Requests</h1>
                        <p className="text-sm text-muted-foreground">
                            Review and process user password reset requests
                        </p>
                    </div>
                </div>

                {/* Success flash + generated password */}
                {flash.success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                        <p className="font-medium text-green-700 dark:text-green-400">{flash.success}</p>
                    </div>
                )}

                {generatedPassword && (
                    <Card className="border-2 border-yellow-400 bg-yellow-50 dark:border-yellow-600 dark:bg-yellow-900/20">
                        <CardHeader>
                            <CardTitle className="text-yellow-800 dark:text-yellow-300">
                                🔑 Generated Password — Show Once
                            </CardTitle>
                            <CardDescription>
                                Copy and securely share this with the user. It will not be shown again.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <code className="rounded-md bg-white px-4 py-2 text-lg font-mono font-bold tracking-widest shadow dark:bg-gray-900">
                                {generatedPassword}
                            </code>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    navigator.clipboard.writeText(generatedPassword);
                                }}
                            >
                                Copy
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setGeneratedPassword(null)}
                            >
                                Dismiss
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Error flash */}
                {flash.error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                        <p className="text-red-700 dark:text-red-400">{flash.error}</p>
                    </div>
                )}

                {/* Pending Requests */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            Pending Requests
                            {pending.length > 0 && (
                                <Badge className="ml-1 bg-orange-500 text-white">
                                    {pending.length}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pending.length === 0 ? (
                            <p className="py-8 text-center text-muted-foreground">
                                No pending requests.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {pending.map((req) => (
                                    <div
                                        key={req.id}
                                        className="flex items-center justify-between rounded-lg border p-4"
                                    >
                                        <div>
                                            <p className="font-semibold">{req.user_name}</p>
                                            <p className="text-sm text-muted-foreground">{req.user_email}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Requested: {new Date(req.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleProcess(req.id)}
                                            >
                                                <Check className="mr-1 h-4 w-4" />
                                                Generate Password
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    setRejectId(req.id);
                                                    setRejectOpen(true);
                                                }}
                                            >
                                                <X className="mr-1 h-4 w-4" />
                                                Reject
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* History */}
                {history.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {history.map((req) => (
                                    <div
                                        key={req.id}
                                        className="flex items-center justify-between rounded-lg border p-4 opacity-70"
                                    >
                                        <div>
                                            <p className="font-semibold">{req.user_name}</p>
                                            <p className="text-sm text-muted-foreground">{req.user_email}</p>
                                            {req.reason && (
                                                <p className="text-xs text-muted-foreground">
                                                    Reason: {req.reason}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                                Requested: {new Date(req.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        {statusBadge(req.status)}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Reject Dialog */}
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserX className="h-5 w-5 text-red-500" />
                            Reject Password Reset Request
                        </DialogTitle>
                        <DialogDescription>
                            Optionally provide a reason. The user will not be notified automatically.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-2">
                        <Label htmlFor="reject-reason">Reason (optional)</Label>
                        <Input
                            id="reject-reason"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="e.g. Could not verify identity"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setRejectOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleReject}>
                            Reject Request
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
