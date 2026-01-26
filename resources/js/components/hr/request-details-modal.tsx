import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    FileText,
    Building,
    Calendar,
    User,
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Download,
    Printer,
    Loader2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface DocumentRequest {
    id: number;
    employee_id: number;
    employee_name: string;
    employee_number: string;
    department: string;
    position?: string;
    email?: string;
    phone?: string;
    date_hired?: string;
    employment_status?: string;
    document_type: string;
    purpose: string;
    priority: 'urgent' | 'high' | 'normal';
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    requested_at: string;
    processed_by: string | null;
    processed_at: string | null;
    generated_document_path?: string | null;
    rejection_reason?: string | null;
}

interface DocumentHistory {
    id: number;
    document_type: string;
    status: string;
    requested_at: string;
    processed_by?: string;
    downloaded_at?: string;
}

interface RequestStatistics {
    total_requests: number;
    most_requested_type: string;
    average_processing_time_minutes: number;
    success_rate_percentage: number;
}

interface AuditTrailEntry {
    id: number;
    action: string;
    description: string;
    timestamp: string;
    user: string;
    event_type: string;
}

interface RequestDetailsModalProps {
    open: boolean;
    onClose: () => void;
    request: DocumentRequest;
    onProcessClick?: () => void;
}

export function RequestDetailsModal({ open, onClose, request, onProcessClick }: RequestDetailsModalProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [fullRequest, setFullRequest] = useState<DocumentRequest>(request);
    const [history, setHistory] = useState<DocumentHistory[]>([]);
    const [statistics, setStatistics] = useState<RequestStatistics | null>(null);
    const [auditTrail, setAuditTrail] = useState<AuditTrailEntry[]>([]);
    const [downloading, setDownloading] = useState(false);
    const [downloading, setDownloading] = useState(false);

    // Fetch full request details with history and audit trail
    useEffect(() => {
        if (!open || !request.id) return;

        const fetchRequestDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/hr/documents/requests/${request.id}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch request details');
                
                const result = await response.json();
                
                if (result.data) {
                    setFullRequest({ ...request, ...result.data });
                }
                if (result.history) {
                    setHistory(result.history);
                }
                if (result.statistics) {
                    setStatistics(result.statistics);
                }
                if (result.audit_trail) {
                    setAuditTrail(result.audit_trail);
                }
            } catch (error) {
                console.error('Error fetching request details:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to load request details',
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRequestDetails();
    }, [open, request.id, toast]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-500" />;
            case 'processing':
                return <FileText className="h-5 w-5 text-blue-500" />;
            case 'completed':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-gray-500" />;
        }
    };

    const getPriorityBadge = (priority: string) => {
        const variants: Record<string, string> = {
            urgent: 'bg-red-100 text-red-800',
            high: 'bg-orange-100 text-orange-800',
            normal: 'bg-gray-100 text-gray-800',
        };
        return (
            <Badge className={variants[priority] || variants.normal}>
                {priority.toUpperCase()}
            </Badge>
        );
    };

    const getEventTypeColor = (eventType: string): string => {
        switch (eventType) {
            case 'submitted':
                return 'bg-blue-100 text-blue-600';
            case 'assigned':
                return 'bg-purple-100 text-purple-600';
            case 'processing':
                return 'bg-yellow-100 text-yellow-600';
            case 'generated':
                return 'bg-green-100 text-green-600';
            case 'uploaded':
                return 'bg-green-100 text-green-600';
            case 'rejected':
                return 'bg-red-100 text-red-600';
            case 'email_sent':
                return 'bg-indigo-100 text-indigo-600';
            case 'downloaded':
                return 'bg-teal-100 text-teal-600';
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    const handleDownloadDocument = async () => {
        if (!fullRequest.generated_document_path) {
            toast({
                title: 'Error',
                description: 'Document path not available',
                variant: 'destructive',
            });
            return;
        }

        setDownloading(true);
        try {
            const response = await fetch(fullRequest.generated_document_path);
            if (!response.ok) throw new Error('Failed to download document');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fullRequest.document_type.replace(/\s+/g, '-')}_${fullRequest.employee_number}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: 'Success',
                description: 'Document downloaded successfully',
            });
        } catch (error) {
            console.error('Download error:', error);
            toast({
                title: 'Error',
                description: 'Failed to download document',
                variant: 'destructive',
            });
        } finally {
            setDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="flex items-center gap-2">
                                <Badge variant="outline" className="font-mono">
                                    REQ-{String(request.id).padStart(3, '0')}
                                </Badge>
                                {getStatusIcon(request.status)}
                                <span className="capitalize">{request.status}</span>
                            </DialogTitle>
                            <DialogDescription>
                                Detailed information about this document request
                            </DialogDescription>
                        </div>
                        {getPriorityBadge(request.priority)}
                    </div>
                </DialogHeader>

                <Tabs defaultValue="info" className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="info">Request Information</TabsTrigger>
                        <TabsTrigger value="history">Document History</TabsTrigger>
                        <TabsTrigger value="audit">Audit Trail</TabsTrigger>
                    </TabsList>

                    {/* Tab 1: Request Information */}
                    <TabsContent value="info" className="space-y-4">
                        {/* Employee Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Employee Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start gap-4">
                                    <Avatar className="h-16 w-16">
                                        <AvatarFallback className="text-lg">
                                            {request.employee_name
                                                .split(' ')
                                                .map((n) => n[0])
                                                .join('')
                                                .toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 space-y-3">
                                        <div>
                                            <h3 className="font-semibold text-lg">
                                                {request.employee_name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {request.employee_number}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <Building className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <div className="text-xs text-gray-500">
                                                        Department
                                                    </div>
                                                    <div className="font-medium">
                                                        {request.department}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-gray-500" />
                                                <div>
                                                    <div className="text-xs text-gray-500">
                                                        Employee ID
                                                    </div>
                                                    <div className="font-medium">{request.employee_id}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Request Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Request Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-500">Document Type</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <FileText className="h-4 w-4 text-blue-600" />
                                            <span className="font-medium">{request.document_type}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Priority</label>
                                        <div className="mt-1">{getPriorityBadge(request.priority)}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Request Date</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="font-medium">
                                                {format(new Date(request.requested_at), 'PPpp')}
                                            </span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500">Status</label>
                                        <div className="flex items-center gap-2 mt-1">
                                            {getStatusIcon(request.status)}
                                            <span className="font-medium capitalize">
                                                {request.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-sm text-gray-500">Purpose / Reason</label>
                                    <p className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                                        {request.purpose}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Processing Information */}
                        {request.status !== 'pending' && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Processing Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {request.processed_by && (
                                        <div>
                                            <label className="text-sm text-gray-500">Processed By</label>
                                            <p className="font-medium">{request.processed_by}</p>
                                        </div>
                                    )}
                                    {request.processed_at && (
                                        <div>
                                            <label className="text-sm text-gray-500">Processed Date</label>
                                            <p className="font-medium">
                                                {format(new Date(request.processed_at), 'PPpp')}
                                            </p>
                                        </div>
                                    )}
                                    {request.status === 'rejected' && request.rejection_reason && (
                                        <div>
                                            <label className="text-sm text-gray-500">
                                                Rejection Reason
                                            </label>
                                            <p className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md text-sm">
                                                {request.rejection_reason}
                                            </p>
                                        </div>
                                    )}
                                    {request.status === 'completed' &&
                                        request.generated_document_path && (
                                            <div>
                                                <label className="text-sm text-gray-500">
                                                    Generated Document
                                                </label>
                                                <p className="mt-1 p-3 bg-green-50 border border-green-200 rounded-md text-sm font-mono">
                                                    {request.generated_document_path}
                                                </p>
                                            </div>
                                        )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Tab 2: Document History */}
                    <TabsContent value="history">
                        <Card>
                            <CardHeader>
                                <CardTitle>Previous Document Requests</CardTitle>
                                <CardDescription>
                                    History of document requests from this employee
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8 text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                    <p>Document history feature coming soon</p>
                                    <p className="text-sm">
                                        Will show previous requests, completion rates, and statistics
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab 3: Audit Trail */}
                    <TabsContent value="audit">
                        <Card>
                            <CardHeader>
                                <CardTitle>Activity Timeline</CardTitle>
                                <CardDescription>
                                    Complete audit trail of all actions on this request
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Request Submitted */}
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                                <FileText className="h-4 w-4 text-blue-600" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">Request Submitted</p>
                                            <p className="text-sm text-gray-600">
                                                Submitted by {request.employee_name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {format(new Date(request.requested_at), 'PPpp')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Processing Status */}
                                    {request.status !== 'pending' && request.processed_at && (
                                        <div className="flex gap-4">
                                            <div className="flex-shrink-0">
                                                <div
                                                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                                        request.status === 'completed'
                                                            ? 'bg-green-100'
                                                            : request.status === 'rejected'
                                                            ? 'bg-red-100'
                                                            : 'bg-yellow-100'
                                                    }`}
                                                >
                                                    {getStatusIcon(request.status)}
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium capitalize">
                                                    {request.status === 'completed'
                                                        ? 'Request Completed'
                                                        : request.status === 'rejected'
                                                        ? 'Request Rejected'
                                                        : 'Processing Started'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Processed by {request.processed_by}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {format(new Date(request.processed_at), 'PPpp')}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-center py-4 text-sm text-gray-500">
                                        Full audit logging will be implemented with Phase 4
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
