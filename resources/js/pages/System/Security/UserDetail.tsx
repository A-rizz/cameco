import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	ArrowLeft,
	CheckCircle2,
	XCircle,
	Mail,
	Calendar,
	Clock,
	Shield,
	ShieldAlert,
	ShieldCheck,
	KeyRound,
	UserX,
	UserCheck,
	AlertTriangle,
	Info,
	AlertCircle,
} from 'lucide-react';

interface AuditLog {
	id: number;
	user_id: number;
	event_type: string;
	description: string | null;
	severity: 'info' | 'warning' | 'critical';
	created_at: string;
}

interface LoginRecord {
	id: number;
	user_id: number;
	event_type: string;
	description: string | null;
	severity: string;
	created_at: string;
}

interface UserDetailProps {
	user: {
		id: number;
		name: string;
		email: string;
		is_active: boolean;
		email_verified_at: string | null;
		created_at: string;
		last_login_at: string | null;
		roles: string[];
		two_factor_confirmed: boolean;
	};
	auditLogs: AuditLog[];
	loginHistory: LoginRecord[];
}

function SeverityIcon({ severity }: { severity: string }) {
	switch (severity) {
		case 'critical':
			return <ShieldAlert className="h-4 w-4 text-red-500" />;
		case 'warning':
			return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
		default:
			return <Info className="h-4 w-4 text-blue-500" />;
	}
}

function SeverityBadge({ severity }: { severity: string }) {
	const variants: Record<string, string> = {
		critical: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200',
		warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
		info: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
	};
	return (
		<span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ${variants[severity] ?? variants.info}`}>
			{severity}
		</span>
	);
}

export default function UserDetailPage({ user, auditLogs, loginHistory }: UserDetailProps) {
	const breadcrumbs = [
		{ title: 'System', href: '#' },
		{ title: 'Security & Access', href: '#' },
		{ title: 'User Management', href: '/system/users' },
		{ title: user.name, href: '#' },
	];

	const { flash } = usePage<{ flash?: { success?: string; error?: string; new_password?: string } }>().props;
	const [resetResult, setResetResult] = useState<{ name: string; password: string } | null>(null);
	const [confirmation, setConfirmation] = useState<{
		title: string;
		description: string;
		onConfirm: () => void;
		confirmText: string;
		variant: 'default' | 'destructive' | 'amber';
	} | null>(null);

	function handleResetPassword() {
		setConfirmation({
			title: 'Reset User Password',
			description: `Are you sure you want to generate a new password for ${user.name}? The current password will be invalidated immediately.`,
			confirmText: 'Generate New Password',
			variant: 'amber',
			onConfirm: () => {
				router.post(`/system/users/${user.id}/password-reset`, {}, {
					preserveScroll: true,
					onSuccess: (page) => {
						const flashProps = page.props.flash as { new_password?: string };
						if (flashProps.new_password) {
							setResetResult({ name: user.name, password: flashProps.new_password });
						}
						setConfirmation(null);
					}
				});
			}
		});
	}

	function handleToggleActive() {
		const action = user.is_active ? 'deactivate' : 'activate';
		const label = user.is_active ? 'Deactivate' : 'Activate';
		
		setConfirmation({
			title: `${label} User Account`,
			description: `Are you sure you want to ${label.toLowerCase()} ${user.name}'s account?`,
			confirmText: label,
			variant: user.is_active ? 'destructive' : 'default',
			onConfirm: () => {
				router.post(`/system/users/${user.id}/${action}`, {}, {
					onSuccess: () => setConfirmation(null)
				});
			}
		});
	}

	return (
		<AppLayout breadcrumbs={breadcrumbs}>
			<Head title={`User: ${user.name}`} />

			<div className="flex flex-col gap-6 p-4 md:p-6">
				{/* Flash messages */}
				{flash?.success && !flash?.new_password && (
					<div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
						{flash.success}
					</div>
				)}
				{flash?.error && (
					<div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
						{flash.error}
					</div>
				)}

				{/* Header */}
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center gap-3">
						<Link href="/system/users">
							<Button variant="outline" size="sm" className="gap-2">
								<ArrowLeft className="h-4 w-4" />
								Back
							</Button>
						</Link>
						<div>
							<h1 className="text-2xl font-bold">{user.name}</h1>
							<p className="text-sm text-muted-foreground">{user.email}</p>
						</div>
					</div>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" className="gap-2" onClick={handleResetPassword}>
							<KeyRound className="h-4 w-4" />
							Reset Password
						</Button>
						<Button
							variant={user.is_active ? 'destructive' : 'default'}
							size="sm"
							className="gap-2"
							onClick={handleToggleActive}
						>
							{user.is_active ? (
								<>
									<UserX className="h-4 w-4" />
									Deactivate
								</>
							) : (
								<>
									<UserCheck className="h-4 w-4" />
									Activate
								</>
							)}
						</Button>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					{/* Left column — profile card */}
					<div className="flex flex-col gap-4">
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Account Details</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Status */}
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Status</span>
									{user.is_active ? (
										<Badge className="gap-1 bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">
											<CheckCircle2 className="h-3 w-3" />
											Active
										</Badge>
									) : (
										<Badge variant="secondary" className="gap-1">
											<XCircle className="h-3 w-3" />
											Inactive
										</Badge>
									)}
								</div>

								<Separator />

								{/* Email */}
								<div className="flex flex-col gap-1">
									<span className="text-xs text-muted-foreground">Email</span>
									<span className="flex items-center gap-2 text-sm font-medium">
										<Mail className="h-3.5 w-3.5 text-muted-foreground" />
										{user.email}
									</span>
									{user.email_verified_at ? (
										<span className="text-xs text-green-600">
											Verified {user.email_verified_at}
										</span>
									) : (
										<span className="text-xs text-yellow-600">Not verified</span>
									)}
								</div>

								<Separator />

								{/* Roles */}
								<div className="flex flex-col gap-2">
									<span className="text-xs text-muted-foreground">Roles</span>
									{user.roles.length === 0 ? (
										<span className="text-sm text-muted-foreground">No roles assigned</span>
									) : (
										<div className="flex flex-wrap gap-1">
											{user.roles.map((r) => (
												<Badge key={r} variant="outline" className="text-xs">
													<Shield className="mr-1 h-3 w-3" />
													{r}
												</Badge>
											))}
										</div>
									)}
								</div>

								<Separator />

								{/* 2FA */}
								<div className="flex items-center justify-between">
									<span className="text-sm text-muted-foreground">Two-Factor Auth</span>
									{user.two_factor_confirmed ? (
										<div className="flex items-center gap-1 text-xs text-green-600">
											<ShieldCheck className="h-3.5 w-3.5" />
											Enabled
										</div>
									) : (
										<div className="flex items-center gap-1 text-xs text-muted-foreground">
											<AlertCircle className="h-3.5 w-3.5" />
											Not set up
										</div>
									)}
								</div>

								<Separator />

								{/* Timestamps */}
								<div className="flex flex-col gap-2">
									<div className="flex flex-col gap-0.5">
										<span className="text-xs text-muted-foreground">Account Created</span>
										<span className="flex items-center gap-1.5 text-sm">
											<Calendar className="h-3.5 w-3.5 text-muted-foreground" />
											{user.created_at}
										</span>
									</div>
									<div className="flex flex-col gap-0.5">
										<span className="text-xs text-muted-foreground">Last Login</span>
										<span className="flex items-center gap-1.5 text-sm">
											<Clock className="h-3.5 w-3.5 text-muted-foreground" />
											{user.last_login_at ?? 'Never'}
										</span>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right columns — audit log + login history */}
					<div className="flex flex-col gap-6 lg:col-span-2">
						{/* Audit Log */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Recent Audit Events</CardTitle>
							</CardHeader>
							<CardContent>
								{auditLogs.length === 0 ? (
									<p className="py-4 text-center text-sm text-muted-foreground">No audit events recorded.</p>
								) : (
									<div className="divide-y">
										{auditLogs.map((log) => (
											<div key={log.id} className="flex items-start gap-3 py-3">
												<div className="mt-0.5 shrink-0">
													<SeverityIcon severity={log.severity} />
												</div>
												<div className="min-w-0 flex-1">
													<div className="flex flex-wrap items-center gap-2">
														<span className="text-sm font-medium">{log.event_type}</span>
														<SeverityBadge severity={log.severity} />
													</div>
													{log.description && (
														<p className="mt-0.5 text-xs text-muted-foreground">{log.description}</p>
													)}
												</div>
												<span className="shrink-0 text-xs text-muted-foreground">{log.created_at}</span>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Login History */}
						<Card>
							<CardHeader>
								<CardTitle className="text-base">Login History</CardTitle>
							</CardHeader>
							<CardContent>
								{loginHistory.length === 0 ? (
									<p className="py-4 text-center text-sm text-muted-foreground">No login records found.</p>
								) : (
									<div className="divide-y">
										{loginHistory.map((record) => (
											<div key={record.id} className="flex items-start gap-3 py-3">
												<div className="mt-0.5 shrink-0">
													<SeverityIcon severity={record.severity} />
												</div>
												<div className="min-w-0 flex-1">
													<span className="text-sm font-medium">{record.event_type}</span>
													{record.description && (
														<p className="mt-0.5 text-xs text-muted-foreground">{record.description}</p>
													)}
												</div>
												<span className="shrink-0 text-xs text-muted-foreground">{record.created_at}</span>
											</div>
										))}
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Action Confirmation Modal */}
			<Dialog open={confirmation !== null} onOpenChange={(open) => !open && setConfirmation(null)}>
				<DialogContent className="max-w-md">
					{confirmation && (
						<>
							<DialogHeader>
								<DialogTitle>{confirmation.title}</DialogTitle>
								<DialogDescription>{confirmation.description}</DialogDescription>
							</DialogHeader>
							<DialogFooter className="gap-2 sm:gap-0">
								<Button variant="outline" onClick={() => setConfirmation(null)}>
									Cancel
								</Button>
								<Button 
									variant={confirmation.variant === 'destructive' ? 'destructive' : 'default'}
									className={confirmation.variant === 'amber' ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
									onClick={confirmation.onConfirm}
								>
									{confirmation.confirmText}
								</Button>
							</DialogFooter>
						</>
					)}
				</DialogContent>
			</Dialog>

			{/* Password Reset Result Modal */}
			<Dialog open={resetResult !== null} onOpenChange={() => setResetResult(null)}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<KeyRound className="h-5 w-5 text-amber-500" />
							Password Reset Successful
						</DialogTitle>
						<DialogDescription>
							A new password has been generated for <strong>{resetResult?.name}</strong>.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="rounded-lg bg-slate-950 p-4 font-mono text-2xl text-center tracking-widest text-amber-400 select-all border border-amber-500/20 shadow-inner">
							{resetResult?.password}
						</div>
						<p className="text-xs text-muted-foreground text-center">
							Please copy this password now. It will not be shown again for security reasons.
						</p>
					</div>

					<DialogFooter>
						<Button onClick={() => setResetResult(null)} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
							I have copied the password
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</AppLayout>
	);
}
