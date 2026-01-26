import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    FileText,
    FileUp,
    Download,
    Upload,
    CheckCircle,
    XCircle,
    AlertTriangle,
    FileArchive,
    Table,
    ArrowRight,
    ArrowLeft,
    Clock,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// ============================================================================
// Type Definitions
// ============================================================================

interface CSVRow {
    row: number;
    employee_number: string;
    document_category: string;
    document_type: string;
    file_name: string;
    expires_at: string;
    notes: string;
}

interface ValidationResult {
    row: number;
    valid: boolean;
    errors: string[];
    data: CSVRow;
}

interface BulkUploadProps {
    csvTemplate: {
        headers: string[];
        example: string[];
    };
    categories: string[];
}

// ============================================================================
// Main Component
// ============================================================================

export default function BulkUpload({ csvTemplate, categories }: BulkUploadProps) {
    const { toast } = useToast();
    
    // Wizard state
    const [currentStep, setCurrentStep] = useState(1);
    const [csvFile, setCSVFile] = useState<File | null>(null);
    const [zipFile, setZIPFile] = useState<File | null>(null);
    const [csvValidation, setCSVValidation] = useState<ValidationResult[]>([]);
    const [isValidating, setIsValidating] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Helper: Download CSV Template
    const handleDownloadTemplate = () => {
        const headers = csvTemplate.headers.join(',');
        const example = csvTemplate.example.join(',');
        const csvContent = `${headers}\n${example}`;
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'bulk-upload-template.csv';
        link.click();
    };

    // Step 1: Continue to CSV Upload
    const handleContinueToStep2 = () => {
        setCurrentStep(2);
    };

    // Step 2: CSV File Selection
    const handleCSVFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'CSV file must be less than 5MB',
                    variant: 'destructive',
                });
                return;
            }
            setCSVFile(file);
            validateCSV();
        }
    };

    // Validate CSV (mock implementation)
    const validateCSV = async () => {
        setIsValidating(true);
        
        // Simulate validation
        setTimeout(() => {
            // Mock validation results
            const mockResults: ValidationResult[] = [
                {
                    row: 1,
                    valid: true,
                    errors: [],
                    data: {
                        row: 1,
                        employee_number: 'EMP-2024-001',
                        document_category: 'personal',
                        document_type: 'Birth Certificate',
                        file_name: 'birth-cert.pdf',
                        expires_at: 'N/A',
                        notes: 'PSA copy',
                    },
                },
                {
                    row: 2,
                    valid: false,
                    errors: ['Employee EMP-2024-999 not found in system'],
                    data: {
                        row: 2,
                        employee_number: 'EMP-2024-999',
                        document_category: 'medical',
                        document_type: 'Medical Certificate',
                        file_name: 'medical.pdf',
                        expires_at: '2024-12-31',
                        notes: '',
                    },
                },
            ];
            
            setCSVValidation(mockResults);
            setIsValidating(false);
            
            toast({
                title: 'CSV Validation Complete',
                description: `${mockResults.filter((r) => r.valid).length} valid, ${
                    mockResults.filter((r) => !r.valid).length
                } errors`,
            });
        }, 1500);
    };

    // Step 2: Continue to ZIP Upload
    const handleContinueToStep3 = () => {
        const hasErrors = csvValidation.some((r) => !r.valid);
        if (hasErrors) {
            toast({
                title: 'Validation Errors',
                description: 'Please fix CSV errors or continue with valid rows only',
                variant: 'destructive',
            });
            return;
        }
        setCurrentStep(3);
    };

    // Step 3: ZIP File Selection
    const handleZIPFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) {
                toast({
                    title: 'File too large',
                    description: 'ZIP file must be less than 100MB',
                    variant: 'destructive',
                });
                return;
            }
            setZIPFile(file);
        }
    };

    // Step 3: Start Upload
    const handleStartUpload = () => {
        if (!csvFile || !zipFile) {
            toast({
                title: 'Missing Files',
                description: 'Please upload both CSV and ZIP files',
                variant: 'destructive',
            });
            return;
        }
        
        setCurrentStep(4);
        processUpload();
    };

    // Step 4: Process Upload (mock implementation)
    const processUpload = () => {
        setIsUploading(true);
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            
            if (progress >= 100) {
                clearInterval(interval);
                setIsUploading(false);
                toast({
                    title: 'Upload Complete',
                    description: 'All documents have been processed',
                });
            }
        }, 500);
    };

    // Navigation
    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleReset = () => {
        setCurrentStep(1);
        setCSVFile(null);
        setZIPFile(null);
        setCSVValidation([]);
        setUploadProgress(0);
    };

    return (
        <AppLayout>
            <Head title="Bulk Document Upload" />

            <div className="space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Bulk Document Upload</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Upload multiple documents for multiple employees using CSV + ZIP
                    </p>
                </div>

                {/* Stepper */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            {[
                                { number: 1, title: 'Instructions' },
                                { number: 2, title: 'CSV Upload' },
                                { number: 3, title: 'ZIP Upload' },
                                { number: 4, title: 'Processing' },
                            ].map((step, index) => (
                                <div key={step.number} className="flex items-center">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className={`h-10 w-10 rounded-full flex items-center justify-center font-semibold ${
                                                currentStep > step.number
                                                    ? 'bg-green-500 text-white'
                                                    : currentStep === step.number
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200 text-gray-500'
                                            }`}
                                        >
                                            {currentStep > step.number ? (
                                                <CheckCircle className="h-6 w-6" />
                                            ) : (
                                                step.number
                                            )}
                                        </div>
                                        <span className="text-sm mt-2 font-medium">
                                            {step.title}
                                        </span>
                                    </div>
                                    {index < 3 && (
                                        <div
                                            className={`w-24 h-1 mx-4 ${
                                                currentStep > step.number
                                                    ? 'bg-green-500'
                                                    : 'bg-gray-200'
                                            }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Step 1: Instructions */}
                {currentStep === 1 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-6 w-6" />
                                Upload Instructions
                            </CardTitle>
                            <CardDescription>
                                Learn how to prepare your files for bulk upload
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Overview */}
                            <Alert>
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    <strong>Important:</strong> Maximum 100 documents per batch, 100MB
                                    total ZIP file size. Ensure all file names in CSV match exactly with
                                    files in ZIP.
                                </AlertDescription>
                            </Alert>

                            {/* Step-by-Step Guide */}
                            <div className="space-y-4">
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <h3 className="font-semibold mb-2">Step 1: Download CSV Template</h3>
                                    <p className="text-sm text-gray-600 mb-3">
                                        Download the pre-formatted CSV template with required columns
                                    </p>
                                    <Button onClick={handleDownloadTemplate} size="sm">
                                        <Download className="h-4 w-4 mr-2" />
                                        Download CSV Template
                                    </Button>
                                    <div className="mt-3 bg-gray-50 p-3 rounded-md text-xs font-mono overflow-x-auto">
                                        {csvTemplate.headers.join(',')}
                                        <br />
                                        {csvTemplate.example.join(',')}
                                    </div>
                                </div>

                                <div className="border-l-4 border-green-500 pl-4">
                                    <h3 className="font-semibold mb-2">Step 2: Fill CSV with Data</h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Required columns:
                                    </p>
                                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                        <li>
                                            <strong>employee_number:</strong> Employee ID (e.g.,
                                            EMP-2024-001)
                                        </li>
                                        <li>
                                            <strong>document_category:</strong> {categories.join(', ')}
                                        </li>
                                        <li>
                                            <strong>document_type:</strong> Specific document name
                                        </li>
                                        <li>
                                            <strong>file_name:</strong> Exact filename in ZIP
                                            (case-sensitive)
                                        </li>
                                        <li>
                                            <strong>expires_at:</strong> YYYY-MM-DD or "N/A"
                                        </li>
                                        <li>
                                            <strong>notes:</strong> Optional, max 500 characters
                                        </li>
                                    </ul>
                                </div>

                                <div className="border-l-4 border-purple-500 pl-4">
                                    <h3 className="font-semibold mb-2">
                                        Step 3: Prepare ZIP File with Documents
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-2">
                                        Create a ZIP file containing all documents mentioned in CSV
                                    </p>
                                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                                        <li>File names must EXACTLY match CSV (case-sensitive)</li>
                                        <li>Supported formats: PDF, JPG, JPEG, PNG, DOCX</li>
                                        <li>Each file max 10MB</li>
                                        <li>Total ZIP max 100MB</li>
                                    </ul>
                                </div>

                                <div className="border-l-4 border-orange-500 pl-4">
                                    <h3 className="font-semibold mb-2">Step 4: Upload Both Files</h3>
                                    <p className="text-sm text-gray-600">
                                        Upload CSV first for validation, then upload ZIP file and start
                                        processing
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button onClick={handleContinueToStep2}>
                                    I Understand, Continue to Upload
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: CSV Upload */}
                {currentStep === 2 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Table className="h-6 w-6" />
                                Upload CSV File
                            </CardTitle>
                            <CardDescription>
                                Upload your CSV file with employee-document mapping
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* CSV Upload Zone */}
                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                <Table className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleCSVFileChange}
                                    className="hidden"
                                    id="csv-upload"
                                />
                                <label htmlFor="csv-upload">
                                    <Button variant="outline" asChild>
                                        <span className="cursor-pointer">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Choose CSV File
                                        </span>
                                    </Button>
                                </label>
                                <p className="text-sm text-gray-500 mt-2">
                                    Max 5MB. Only .csv files accepted
                                </p>
                            </div>

                            {/* CSV File Preview */}
                            {csvFile && (
                                <Alert>
                                    <FileText className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>File:</strong> {csvFile.name} (
                                        {(csvFile.size / 1024).toFixed(2)} KB)
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Validation Loading */}
                            {isValidating && (
                                <div className="text-center py-8">
                                    <Clock className="h-12 w-12 mx-auto text-blue-500 animate-spin mb-4" />
                                    <p className="font-medium">Validating CSV...</p>
                                </div>
                            )}

                            {/* Validation Results */}
                            {!isValidating && csvValidation.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Validation Results</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="text-center p-4 bg-gray-50 rounded-lg">
                                                <div className="text-2xl font-bold">
                                                    {csvValidation.length}
                                                </div>
                                                <div className="text-sm text-gray-600">Total Rows</div>
                                            </div>
                                            <div className="text-center p-4 bg-green-50 rounded-lg">
                                                <div className="text-2xl font-bold text-green-600">
                                                    {csvValidation.filter((r) => r.valid).length}
                                                </div>
                                                <div className="text-sm text-gray-600">Valid Rows</div>
                                            </div>
                                            <div className="text-center p-4 bg-red-50 rounded-lg">
                                                <div className="text-2xl font-bold text-red-600">
                                                    {csvValidation.filter((r) => !r.valid).length}
                                                </div>
                                                <div className="text-sm text-gray-600">Errors</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            {csvValidation.map((result) => (
                                                <div
                                                    key={result.row}
                                                    className={`p-3 rounded-lg ${
                                                        result.valid ? 'bg-green-50' : 'bg-red-50'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {result.valid ? (
                                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                            ) : (
                                                                <XCircle className="h-5 w-5 text-red-600" />
                                                            )}
                                                            <span className="font-medium">
                                                                Row {result.row}: {result.data.employee_number}
                                                            </span>
                                                        </div>
                                                        <Badge variant={result.valid ? 'default' : 'destructive'}>
                                                            {result.valid ? 'Valid' : 'Error'}
                                                        </Badge>
                                                    </div>
                                                    {!result.valid && result.errors.length > 0 && (
                                                        <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                                                            {result.errors.map((error, i) => (
                                                                <li key={i}>{error}</li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={handleBack}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button
                                    onClick={handleContinueToStep3}
                                    disabled={!csvFile || csvValidation.length === 0}
                                >
                                    Continue to ZIP Upload
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 3: ZIP Upload */}
                {currentStep === 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileArchive className="h-6 w-6" />
                                Upload ZIP File
                            </CardTitle>
                            <CardDescription>
                                Upload ZIP file containing all document files
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* ZIP Upload Zone */}
                            <div className="border-2 border-dashed rounded-lg p-8 text-center">
                                <FileArchive className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                                <input
                                    type="file"
                                    accept=".zip"
                                    onChange={handleZIPFileChange}
                                    className="hidden"
                                    id="zip-upload"
                                />
                                <label htmlFor="zip-upload">
                                    <Button variant="outline" asChild>
                                        <span className="cursor-pointer">
                                            <Upload className="h-4 w-4 mr-2" />
                                            Choose ZIP File
                                        </span>
                                    </Button>
                                </label>
                                <p className="text-sm text-gray-500 mt-2">
                                    Max 100MB. Only .zip files accepted
                                </p>
                            </div>

                            {/* ZIP File Preview */}
                            {zipFile && (
                                <Alert>
                                    <FileArchive className="h-4 w-4" />
                                    <AlertDescription>
                                        <strong>File:</strong> {zipFile.name} (
                                        {(zipFile.size / 1024 / 1024).toFixed(2)} MB)
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={handleBack}>
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                                <Button onClick={handleStartUpload} disabled={!zipFile}>
                                    Start Upload
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 4: Processing */}
                {currentStep === 4 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileUp className="h-6 w-6" />
                                Processing Upload
                            </CardTitle>
                            <CardDescription>
                                Uploading and validating documents...
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Upload Progress</span>
                                    <span className="font-medium">{uploadProgress}%</span>
                                </div>
                                <Progress value={uploadProgress} />
                            </div>

                            {/* Completion Status */}
                            {uploadProgress === 100 && (
                                <Alert>
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertDescription>
                                        <strong>Upload Complete!</strong> All documents have been processed
                                        successfully.
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="flex justify-between">
                                <Button variant="outline" onClick={handleReset}>
                                    Upload More Documents
                                </Button>
                                <Button onClick={() => router.visit('/hr/documents')}>
                                    View All Documents
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
