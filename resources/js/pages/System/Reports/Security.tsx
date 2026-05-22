import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { AlertTriangle, Lock, Shield, Clock, Info, User, Activity } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';

interface FailedLoginAttempt {
  user_id: number;
  user_name: string;
  timestamp: string;
  details: { ip_address?: string; [key: string]: string | undefined };
}

interface TopAttemptUser {
  user_id: number;
  attempt_count: number;
}

interface PasswordReset {
  user_id: number;
  description: string;
  timestamp: string;
  details: { [key: string]: string | undefined };
}

interface RoleChange {
  user_id: number;
  action: string;
  description: string;
  timestamp: string;
  details: { [key: string]: string | undefined };
}

interface SuspiciousAlert {
  user_id: number;
  severity: string;
  action: string;
  description: string;
  timestamp: string;
  details: { [key: string]: string | undefined };
}

interface Props {
  failed_logins: {
    total_attempts: number;
    unique_users: number;
    attempts: FailedLoginAttempt[];
    top_users: TopAttemptUser[];
  };
  password_resets: {
    total_resets: number;
    resets: PasswordReset[];
  };
  role_changes: {
    total_changes: number;
    changes: RoleChange[];
  };
  suspicious_activity: {
    total_alerts: number;
    by_severity: {
      critical: number;
      warning: number;
    };
    alerts: SuspiciousAlert[];
  };
  from_date: string;
  to_date: string;
}

export default function SecurityReports({
  failed_logins,
  password_resets,
  role_changes,
  suspicious_activity,
  from_date,
  to_date,
}: Props) {
  const [fromDate, setFromDate] = useState(from_date);
  const [toDate, setToDate] = useState(to_date);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [selectedAlert, setSelectedAlert] = useState<SuspiciousAlert | null>(null);

  const handleDateFilter = () => {
    const params = new URLSearchParams({
      from: fromDate,
      to: toDate,
    });
    window.location.href = `/system/reports/security?${params.toString()}`;
  };

  const filteredAlerts =
    severityFilter === 'all'
      ? suspicious_activity.alerts
      : suspicious_activity.alerts.filter((a) => a.severity === severityFilter);

  const getSeverityColor = (severity: string) => {
    return severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800';
  };

  const breadcrumbItems = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reports', href: '#' },
    { title: 'Security Reports', href: '#' },
  ];

  return (
    <AppLayout breadcrumbs={breadcrumbItems}>
      <Head title="Security Reports" />

      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold dark:text-foreground">Security Reports</h1>
            <p className="text-muted-foreground mt-1">Security audit logs and suspicious activity monitoring</p>
          </div>
        </div>

        {/* Date Filter */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Date Range Filter</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium">From</label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">To</label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={handleDateFilter}>Apply Filter</Button>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                Failed Logins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{failed_logins.total_attempts}</div>
              <p className="text-xs text-muted-foreground mt-1">{failed_logins.unique_users} unique users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password Resets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{password_resets.total_resets}</div>
              <p className="text-xs text-muted-foreground mt-1">Total resets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Role Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{role_changes.total_changes}</div>
              <p className="text-xs text-muted-foreground mt-1">Total changes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Suspicious Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{suspicious_activity.total_alerts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {suspicious_activity.by_severity.critical} critical, {suspicious_activity.by_severity.warning} warnings
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Failed Login Attempts */}
        <Card>
          <CardHeader>
            <CardTitle>Failed Login Attempts</CardTitle>
            <CardDescription>Unauthorized access attempts</CardDescription>
          </CardHeader>
          <CardContent>
            {failed_logins.top_users.length > 0 && (
              <div className="mb-6">
                <h4 className="font-semibold text-sm mb-3">Most Targeted Users</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {failed_logins.top_users.map((user) => (
                    <div key={user.user_id} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">User ID: {user.user_id}</span>
                      <Badge variant="destructive">{user.attempt_count} attempts</Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">User</th>
                    <th className="text-left py-2 px-2">Timestamp</th>
                    <th className="text-left py-2 px-2">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {failed_logins.attempts.length > 0 ? (
                    failed_logins.attempts.map((attempt, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-200 dark:hover:bg-neutral-800">
                        <td className="py-2 px-2">
                          <div className="font-medium">{attempt.user_name}</div>
                          <div className="text-xs text-muted-foreground">ID: {attempt.user_id}</div>
                        </td>
                        <td className="py-2 px-2 text-xs">{new Date(attempt.timestamp).toLocaleString()}</td>
                        <td className="py-2 px-2 text-xs">
                          {attempt.details?.ip_address && (
                            <span className="text-muted-foreground">IP: {attempt.details.ip_address}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-muted-foreground">
                        No failed login attempts
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Password Resets */}
        <Card>
          <CardHeader>
            <CardTitle>Password Reset Requests</CardTitle>
            <CardDescription>User password change history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">User ID</th>
                    <th className="text-left py-2 px-2">Description</th>
                    <th className="text-left py-2 px-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {password_resets.resets.length > 0 ? (
                    password_resets.resets.map((reset, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-200 dark:hover:bg-neutral-800">
                        <td className="py-2 px-2 font-mono text-xs">{reset.user_id}</td>
                        <td className="py-2 px-2 text-xs">{reset.description}</td>
                        <td className="py-2 px-2 text-xs">{new Date(reset.timestamp).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-4 text-muted-foreground">
                        No password resets in this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Role Changes */}
        <Card>
          <CardHeader>
            <CardTitle>Role Changes Audit Log</CardTitle>
            <CardDescription>User role assignments and removals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">User ID</th>
                    <th className="text-left py-2 px-2">Action</th>
                    <th className="text-left py-2 px-2">Description</th>
                    <th className="text-left py-2 px-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {role_changes.changes.length > 0 ? (
                    role_changes.changes.map((change, idx) => (
                      <tr key={idx} className="border-b hover:bg-gray-200 dark:hover:bg-neutral-800">
                        <td className="py-2 px-2 font-mono text-xs">{change.user_id}</td>
                        <td className="py-2 px-2">
                          <Badge variant={change.action === 'role_removed' ? 'destructive' : 'default'}>
                            {change.action}
                          </Badge>
                        </td>
                        <td className="py-2 px-2 text-xs">{change.description}</td>
                        <td className="py-2 px-2 text-xs">{new Date(change.timestamp).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-muted-foreground">
                        No role changes in this period
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Suspicious Activity Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Suspicious Activity Alerts</CardTitle>
            <CardDescription>Critical and warning level security events</CardDescription>
            <div className="mt-2 flex gap-2">
              <Button
                variant={severityFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSeverityFilter('all')}
              >
                All ({suspicious_activity.total_alerts})
              </Button>
              <Button
                variant={severityFilter === 'critical' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSeverityFilter('critical')}
              >
                Critical ({suspicious_activity.by_severity.critical})
              </Button>
              <Button
                variant={severityFilter === 'warning' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSeverityFilter('warning')}
              >
                Warnings ({suspicious_activity.by_severity.warning})
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert, idx) => (
                  <div 
                    key={idx} 
                    className="group border rounded p-4 hover:bg-gray-100 dark:hover:bg-neutral-800 cursor-pointer transition-all duration-200 hover:border-amber-500/50 hover:shadow-md"
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge className={`${getSeverityColor(alert.severity)} font-bold`}>
                          {alert.severity.toUpperCase()}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">ID: {alert.user_id}</span>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{alert.action}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{alert.description}</p>
                      </div>
                      <Info className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">No alerts with selected filter</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alert Details Modal */}
        <Dialog open={selectedAlert !== null} onOpenChange={(open) => !open && setSelectedAlert(null)}>
          <DialogContent className="max-w-xl">
            {selectedAlert && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${getSeverityColor(selectedAlert.severity)} font-bold`}>
                      {selectedAlert.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="font-mono">{selectedAlert.action}</Badge>
                  </div>
                  <DialogTitle className="text-xl flex items-center gap-2">
                    <AlertTriangle className={`h-5 w-5 ${selectedAlert.severity === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                    Suspicious Activity Details
                  </DialogTitle>
                  <DialogDescription>
                    Event recorded on {new Date(selectedAlert.timestamp).toLocaleString()}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                    <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center border">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Involved User</p>
                      <p className="text-xs text-muted-foreground font-mono">User ID: {selectedAlert.user_id}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Incident Description
                    </h4>
                    <p className="text-sm bg-muted/30 p-3 rounded-md border italic">
                      "{selectedAlert.description}"
                    </p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="text-sm font-semibold mb-2">Granular Metadata</h4>
                    <div className="bg-slate-950 p-4 rounded-lg font-mono text-xs text-amber-400 overflow-x-auto">
                      <pre>{JSON.stringify(selectedAlert.details, null, 2)}</pre>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedAlert(null)}>
                    Dismiss
                  </Button>
                  <Button asChild>
                    <a href={`/system/users/${selectedAlert.user_id}`}>
                      View User Profile
                    </a>
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
