import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { ImportDetailModal } from '@/components/timekeeping/import-detail-modal';
import { ImportBatch, ImportError } from '@/types/timekeeping-pages';

interface ImportManagementProps {
    batches: ImportBatch[] | { data: ImportBatch[] };
    summary: {
        total_imports: number;
        pending: number;
        successful: number;
        records_imported: number;
        failed: number;
    };
}

export default function ImportManagement() {
    const { batches, summary } = usePage().props as unknown as ImportManagementProps;
    const batchList = Array.isArray(batches) ? batches : (batches?.data || []);

    // Modal states
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedBatch, setSelectedBatch] = useState<ImportBatch | null>(null);
    const [batchErrors, setBatchErrors] = useState<ImportError[]>([]);

    const breadcrumbs = [
        { title: 'HR', href: '/hr' },
        { title: 'Timekeeping', href: '/hr/timekeeping' },
        { title: 'Import Management', href: '/hr/timekeeping/import' },
    ];

    const handleViewBatch = (batch: ImportBatch) => {
        setSelectedBatch(batch);
        // In a real app, fetch errors for this batch
        setBatchErrors([]);
        setIsDetailModalOpen(true);
    };

    const handleRetryImport = (batch: ImportBatch) => {
        console.log('Retry import for batch:', batch.id);
        // API call would go here
    };

    const handleUploadFile = () => {
        console.log('Upload file clicked');
        // File upload dialog would open here
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Import Management" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Import Management</h1>
                        <p className="text-gray-600">Bulk upload and manage attendance imports</p>
                    </div>
                    <Button onClick={handleUploadFile} className="gap-2">
                        <Upload className="h-4 w-4" />
                        Upload File
                    </Button>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Imports</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_imports}</div>
                            <p className="text-xs text-gray-500">all batches</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{summary.pending}</div>
                            <p className="text-xs text-gray-500">review needed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Successful</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{summary.successful}</div>
                            <p className="text-xs text-gray-500">completed</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Records Imported</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{summary.records_imported}</div>
                            <p className="text-xs text-gray-500">total records</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{summary.failed}</div>
                            <p className="text-xs text-gray-500">with errors</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Import Batches Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Import Batches</CardTitle>
                        <CardDescription>History of attendance file imports</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-3 px-4 font-semibold">Batch ID</th>
                                        <th className="text-left py-3 px-4 font-semibold">File Name</th>
                                        <th className="text-left py-3 px-4 font-semibold">Records</th>
                                        <th className="text-left py-3 px-4 font-semibold">Success</th>
                                        <th className="text-left py-3 px-4 font-semibold">Errors</th>
                                        <th className="text-left py-3 px-4 font-semibold">Status</th>
                                        <th className="text-left py-3 px-4 font-semibold">Uploaded</th>
                                        <th className="text-right py-3 px-4 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {batchList.slice(0, 10).map((batch) => (
                                        <tr key={batch.id} className="border-b hover:bg-muted/50">
                                            <td className="py-3 px-4">{batch.id}</td>
                                            <td className="py-3 px-4">{batch.file_name}</td>
                                            <td className="py-3 px-4">{batch.total_records}</td>
                                            <td className="py-3 px-4 text-green-600">{batch.successful_records}</td>
                                            <td className="py-3 px-4 text-red-600">{batch.failed_records}</td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                                    batch.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    batch.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                                                    batch.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                    batch.status === 'partial' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {batch.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-xs">{batch.created_at}</td>
                                            <td className="py-3 px-4 text-right">
                                                <Button variant="outline" size="sm" onClick={() => handleViewBatch(batch)}>Details</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Import Detail Modal */}
                {selectedBatch && (
                    <ImportDetailModal
                        isOpen={isDetailModalOpen}
                        onClose={() => {
                            setIsDetailModalOpen(false);
                            setSelectedBatch(null);
                            setBatchErrors([]);
                        }}
                        batch={selectedBatch}
                        errors={batchErrors}
                        onRetry={() => {
                            handleRetryImport(selectedBatch);
                            setIsDetailModalOpen(false);
                        }}
                    />
                )}

                {/* Upload Instructions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Import Instructions</CardTitle>
                        <CardDescription>Guidelines for bulk attendance imports</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Supported File Formats</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>CSV (.csv)</li>
                                <li>Excel (.xlsx, .xls)</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-sm mb-2">Required Columns</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>Employee ID or Employee Number</li>
                                <li>Attendance Date</li>
                                <li>Time In</li>
                                <li>Time Out</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
