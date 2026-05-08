import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Download, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import axios from 'axios';

interface Department {
    id: number;
    name: string;
}

interface Position {
    id: number;
    title: string;
}

interface ImportPageProps {
    departments: Department[];
    positions: Position[];
}

export default function ImportPage({ departments, positions }: ImportPageProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isImporting, setIsImporting] = useState(false);
    const [result, setResult] = useState<{
        imported: number;
        skipped: number;
        errors: string[];
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                setError('Please select a CSV file');
                return;
            }
            setFile(selectedFile);
            setError(null);
            setResult(null);
        }
    };

    const handleImport = async () => {
        if (!file) {
            setError('Please select a file');
            return;
        }

        setIsImporting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await axios.post('/hr/employees/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setResult({
                imported: response.data.imported,
                skipped: response.data.skipped,
                errors: response.data.errors,
            });

            setFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err) {
            const message = axios.isAxiosError(err) 
                ? err.response?.data?.message || err.message 
                : 'Import failed';
            setError(message);
        } finally {
            setIsImporting(false);
        }
    };

    const handleDownloadTemplate = () => {
        window.location.href = '/hr/employees/import/template';
    };

    return (
        <AppLayout>
            <Head title="Import Employees" />

            <div className="max-w-[1000px] mx-auto space-y-8 p-6 md:p-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <Link href="/hr/employees">
                            <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 hover:bg-muted transition-colors">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div className="space-y-1">
                            <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                                Import Employees
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Bulk add staff members using a CSV data sheet.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <Card className="border-none shadow-2xl shadow-primary/5 bg-background/50 backdrop-blur-sm border border-border/50 rounded-3xl overflow-hidden">
                    <CardHeader className="pb-8 border-b border-border/50 bg-muted/20">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Upload className="h-5 w-5 text-primary" />
                            </div>
                            <CardTitle className="text-2xl font-bold">Upload Data Sheet</CardTitle>
                        </div>
                        <CardDescription className="text-base">
                            Quickly import multiple employees. Ensure your file follows our standard template for accurate data mapping.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        {/* Template Download Section */}
                        <div className="relative group overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-6 transition-all hover:shadow-md">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="space-y-1 text-center md:text-left">
                                    <h3 className="text-lg font-bold text-primary flex items-center justify-center md:justify-start gap-2">
                                        <Download className="h-5 w-5" />
                                        Need a template?
                                    </h3>
                                    <p className="text-sm text-muted-foreground max-w-md">
                                        Download our pre-formatted CSV template to ensure all employee data is correctly mapped during import.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={handleDownloadTemplate}
                                    className="rounded-xl border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all active:scale-95 font-semibold px-6 h-12 shadow-sm"
                                >
                                    Download CSV Template
                                </Button>
                            </div>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        {/* Success Alert */}
                        {result && (
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    <strong>Import completed!</strong> {result.imported} employees imported, {result.skipped} skipped.
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* File Upload Area */}
                        <div className="space-y-6">
                            <div 
                                className={`relative group border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                                    file 
                                    ? 'border-primary/50 bg-primary/5 shadow-inner' 
                                    : 'border-border/60 hover:border-primary/40 hover:bg-muted/30'
                                } cursor-pointer`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="space-y-4">
                                    <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                                        file ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                                    }`}>
                                        <Upload className="h-10 w-10" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xl font-bold">
                                            {file ? file.name : 'Click or drag to upload'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Only CSV files are supported (Maximum 10MB)
                                        </p>
                                    </div>
                                    {file && (
                                        <div className="flex items-center justify-center gap-2 text-primary font-semibold animate-in fade-in zoom-in duration-300">
                                            <CheckCircle className="h-5 w-5" />
                                            <span>Ready for import</span>
                                        </div>
                                    )}
                                </div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    onClick={handleImport}
                                    disabled={!file || isImporting}
                                    className="h-12 px-10 rounded-xl bg-primary shadow-lg shadow-primary/20 hover:shadow-xl transition-all active:scale-95 font-bold text-base gap-3"
                                >
                                    {isImporting ? (
                                        <>
                                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="h-5 w-5" />
                                            Start Import
                                        </>
                                    )}
                                </Button>
                                {file && (
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setFile(null);
                                            setResult(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = '';
                                            }
                                        }}
                                        className="h-12 px-6 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
                                    >
                                        Remove File
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Import Results */}
                        {result && result.errors.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold text-amber-900">Import Issues</h3>
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                                    <ul className="space-y-1 text-sm text-amber-800">
                                        {result.errors.map((err, index) => (
                                            <li key={index} className="flex gap-2">
                                                <span className="text-amber-600">•</span>
                                                <span>{err}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        )}

                        {/* CSV Format Info */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                            <h3 className="font-semibold text-gray-900">CSV Format Requirements</h3>
                            <div className="space-y-2 text-sm text-gray-700">
                                <p><strong>Required columns:</strong></p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>First Name</li>
                                    <li>Last Name</li>
                                    <li>Department (must match existing department name)</li>
                                    <li>Position (must match existing position title)</li>
                                    <li>Date Hired (format: YYYY-MM-DD)</li>
                                </ul>
                                <p className="mt-3"><strong>Optional columns:</strong></p>
                                <ul className="list-disc list-inside space-y-1 ml-2">
                                    <li>Employee Number</li>
                                    <li>Middle Name</li>
                                    <li>Email</li>
                                    <li>Mobile</li>
                                    <li>Employment Type (default: regular)</li>
                                    <li>Status (default: active)</li>
                                    <li>Gender</li>
                                    <li>Civil Status</li>
                                    <li>Date of Birth (format: YYYY-MM-DD)</li>
                                </ul>
                                <p className="mt-3 text-gray-600">
                                    All dates should be in YYYY-MM-DD format (e.g., 2024-01-15)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Reference Data */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Available Departments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {departments.map((dept) => (
                                    <div key={dept.id} className="text-sm text-gray-700 py-1 border-b">
                                        {dept.name}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Available Positions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {positions.map((pos) => (
                                    <div key={pos.id} className="text-sm text-gray-700 py-1 border-b">
                                        {pos.title}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
