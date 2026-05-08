import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { usePermission } from '@/components/permission-gate';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    PositionFormModal,
    type Position,
    type Department,
} from '@/components/hr/position-form-modal';
import { PositionConfirmationDialog } from '@/components/hr/position-confirmation-dialog';
import { PositionArchiveDialog } from '@/components/hr/position-archive-dialog';
import { 
    Briefcase, 
    Plus, 
    Edit, 
    Archive, 
    MoreHorizontal, 
    Search, 
    Users, 
    TrendingUp, 
    Layers,
    Building2,
    FileText,
    ArrowRight
} from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';

// ============================================================================
// Type Definitions
// ============================================================================

interface PositionIndexProps {
    positions: Position[];
    departments: Department[];
    statistics?: {
        total?: number;
        active?: number;
        inactive?: number;
    };
}

// ============================================================================
// Component
// ============================================================================

export default function PositionIndex({
    positions,
    departments,
    statistics = {}
}: PositionIndexProps) {
    const { hasPermission } = usePermission();
    const page = usePage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [positionToArchive, setPositionToArchive] = useState<Position | null>(null);
    const [confirmationOpen, setConfirmationOpen] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<Omit<Position, 'id' | 'employee_count'> | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAdminContext = page.url.startsWith('/admin');
    const routePrefix = isAdminContext ? '/admin' : '/hr';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: isAdminContext ? 'Admin' : 'HR Dashboard', href: `${routePrefix}/dashboard` },
        { title: 'Positions', href: `${routePrefix}/positions` },
    ];

    useEffect(() => {
        const userRoles = (page.props.auth as any).roles || [];
        const isHRStaff = userRoles.includes('HR Staff');

        // Check if user has either HR manage, HR view or Admin view permission, or is HR Staff
        const hasAccess = hasPermission('hr.positions.manage') || 
                         hasPermission('hr.positions.view') || 
                         hasPermission('admin.positions.view') ||
                         isHRStaff;

        if (!hasAccess) {
            router.visit(isAdminContext ? '/admin/dashboard' : '/hr/dashboard');
        }
    }, [hasPermission, isAdminContext, page.props.auth]);

    const canManage = hasPermission('hr.positions.manage') || hasPermission('admin.positions.manage');

    // Filter and group positions
    const filteredPositions = useMemo(() => {
        return positions.filter(pos => {
            const matchesSearch = pos.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                (pos.code && pos.code.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesDept = !selectedDepartmentFilter || pos.department_id === selectedDepartmentFilter;
            return matchesSearch && matchesDept;
        });
    }, [positions, searchQuery, selectedDepartmentFilter]);

    // Group positions by department
    const positionsByDepartment = useMemo(() => {
        const grouped = new Map<number, Position[]>();

        departments.forEach(dept => {
            grouped.set(dept.id, []);
        });

        filteredPositions.forEach(pos => {
            const group = grouped.get(pos.department_id) || [];
            group.push(pos);
            grouped.set(pos.department_id, group);
        });

        // Sort positions within each department
        grouped.forEach((positions) => {
            positions.sort((a, b) => a.title.localeCompare(b.title));
        });

        return grouped;
    }, [filteredPositions, departments]);

    // Filter departments to display (only those with positions or the selected one)
    const visibleDepartments = useMemo(() => {
        return departments.filter(dept => {
            if (selectedDepartmentFilter) return dept.id === selectedDepartmentFilter;
            // If no search/filter, show all. If search, only show those with matches.
            if (!searchQuery) return true;
            return (positionsByDepartment.get(dept.id)?.length || 0) > 0;
        });
    }, [departments, selectedDepartmentFilter, searchQuery, positionsByDepartment]);

    const handleCreateClick = () => {
        setSelectedPosition(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEditClick = (position: Position) => {
        setSelectedPosition(position);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (data: Omit<Position, 'id' | 'employee_count'>) => {
        setPendingFormData(data);
        setConfirmationOpen(true);
    };

    const handleConfirmSubmit = async () => {
        if (!pendingFormData) return;

        setIsSubmitting(true);
        const url = modalMode === 'create'
            ? `${routePrefix}/positions`
            : `${routePrefix}/positions/${selectedPosition?.id}`;

        const method = modalMode === 'create' ? 'post' : 'put';

        router[method](url, pendingFormData, {
            onSuccess: () => {
                setIsModalOpen(false);
                setConfirmationOpen(false);
                setPendingFormData(null);
            },
            onError: () => {
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    const handleArchive = (position: Position) => {
        setPositionToArchive(position);
    };

    /**
     * Get position title by ID
     */
    const getPositionTitle = (posId: number | null): string | null => {
        if (!posId) return null;
        return positions.find(p => p.id === posId)?.title || null;
    };

    /**
     * Format currency
     */
    const formatCurrency = (value: number | null): string => {
        if (!value) return 'N/A';
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const totalHeadcount = useMemo(() => {
        return positions.reduce((sum, pos) => sum + (pos.employee_count || 0), 0);
    }, [positions]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Positions" />

            <div className="space-y-6 p-4 max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            {canManage ? 'Manage Positions' : 'View Positions'}
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            {canManage 
                                ? "Manage company positions and reporting lines."
                                : "View all company positions and their reporting structures."
                            }
                        </p>
                    </div>
                    {canManage && (
                        <Button
                            onClick={handleCreateClick}
                            className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create Position
                        </Button>
                    )}
                    {!canManage && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                            View Only Access
                        </div>
                    )}
                </div>

                {/* Primary Metrics */}
                {statistics.total !== undefined && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Card className="relative overflow-hidden group border-none shadow-md">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">All Positions</CardTitle>
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <Briefcase className="h-4 w-4 text-blue-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{statistics.total}</div>
                                <p className="text-xs text-muted-foreground mt-1">Total positions created</p>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden group border-none shadow-md">
                            <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">In Use</CardTitle>
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-green-600">
                                    {statistics.active}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Positions currently filled</p>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden group border-none shadow-md">
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Headcount</CardTitle>
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                    <Users className="h-4 w-4 text-indigo-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-indigo-600">{totalHeadcount}</div>
                                <p className="text-xs text-muted-foreground mt-1">Total employees</p>
                            </CardContent>
                        </Card>

                        <Card className="relative overflow-hidden group border-none shadow-md">
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-400" />
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Departments</CardTitle>
                                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <Building2 className="h-4 w-4 text-orange-600" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold text-orange-600">{departments.length}</div>
                                <p className="text-xs text-muted-foreground mt-1">Total departments</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Search and Filter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-blue-500/5 to-blue-500/10 border-none shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-3 opacity-5">
                            <Layers className="h-20 w-20" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-blue-600/60 flex items-center gap-2">
                                <Search className="h-3.5 w-3.5" />
                                Find Position
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    placeholder="Search positions..."
                                    className="pl-9 h-10 bg-white/50 dark:bg-slate-950/50 border-slate-200 focus:ring-1 focus:ring-blue-500/20 text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-indigo-500/5 to-indigo-500/10 border-none shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-3 opacity-5">
                            <Building2 className="h-20 w-20" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-600/60 flex items-center gap-2">
                                <Layers className="h-3.5 w-3.5" />
                                Department Filter
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2 p-1 bg-white/40 dark:bg-slate-900/40 rounded-lg border border-slate-200/50">
                                <Button
                                    variant={selectedDepartmentFilter === null ? 'secondary' : 'ghost'}
                                    size="sm"
                                    onClick={() => setSelectedDepartmentFilter(null)}
                                    className={`h-8 px-3 rounded-md text-[11px] font-bold transition-all ${
                                        selectedDepartmentFilter === null 
                                            ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' 
                                            : 'text-slate-500'
                                    }`}
                                >
                                    All Departments
                                </Button>
                                {departments.map(dept => (
                                    <Button
                                        key={dept.id}
                                        variant={selectedDepartmentFilter === dept.id ? 'secondary' : 'ghost'}
                                        size="sm"
                                        onClick={() => setSelectedDepartmentFilter(dept.id)}
                                        className={`h-8 px-3 rounded-md text-[11px] font-bold transition-all ${
                                            selectedDepartmentFilter === dept.id 
                                                ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' 
                                                : 'text-slate-500'
                                        }`}
                                    >
                                        {dept.name}
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Positions List */}
                <Card className="border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b bg-muted/30 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Positions List</CardTitle>
                                <CardDescription className="mt-1 font-medium italic text-xs">
                                    View all positions and who they report to
                                </CardDescription>
                            </div>
                            <div className="text-[10px] font-black px-2 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 tracking-tighter uppercase">
                                Table View
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {filteredPositions.length === 0 ? (
                            <div className="py-24 text-center">
                                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 ring-8 ring-muted/10">
                                    <Briefcase className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No positions found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-8 text-sm">
                                    We couldn't find any positions matching your search.
                                </p>
                                <Button
                                    onClick={() => { setSearchQuery(''); setSelectedDepartmentFilter(null); }}
                                    variant="outline"
                                    className="h-10 px-6 rounded-xl font-bold border-2"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {visibleDepartments.map(department => {
                                    const deptPositions = positionsByDepartment.get(department.id) || [];
                                    if (deptPositions.length === 0) return null;

                                    return (
                                        <div key={department.id} className="p-0">
                                            <div className="bg-muted/20 px-6 py-3 border-b flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Building2 className="h-4 w-4 text-primary" />
                                                    <span className="font-bold text-sm uppercase tracking-tight">{department.name}</span>
                                                    <Badge variant="outline" className="text-[10px] bg-background">
                                                        {deptPositions.length} Roles
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader className="bg-transparent">
                                                        <TableRow className="border-b border-border/50 hover:bg-transparent">
                                                            <TableHead className="py-3 px-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Position Name</TableHead>
                                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Reports To</TableHead>
                                                            <TableHead className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Count</TableHead>
                                                            <TableHead className="text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">Salary</TableHead>
                                                            <TableHead className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status</TableHead>
                                                            <TableHead className="w-[50px]"></TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {deptPositions.map(position => (
                                                            <TableRow
                                                                key={position.id}
                                                                className="group border-b last:border-0 border-border/40 hover:bg-muted/20 transition-colors"
                                                            >
                                                                <TableCell className="py-4 px-6">
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                                                            {position.title}
                                                                        </span>
                                                                        <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                                                            #{position.code || 'N/A'} • Lvl {position.level || '0'}
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-1">
                                                                        {position.reports_to ? (
                                                                            <span className="text-xs font-medium text-muted-foreground truncate max-w-[120px]" title={getPositionTitle(position.reports_to) || ''}>
                                                                                {getPositionTitle(position.reports_to)}
                                                                            </span>
                                                                        ) : (
                                                                            <Badge variant="outline" className="text-[9px] font-black uppercase opacity-50">Top Level</Badge>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <span className="font-bold text-sm">{position.employee_count || 0}</span>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <span className="text-[11px] font-bold font-mono">
                                                                        {position.salary_min ? formatCurrency(position.salary_min) : 'N/A'}
                                                                    </span>
                                                                </TableCell>
                                                                <TableCell className="text-center">
                                                                    {position.is_active ? (
                                                                        <Badge className="bg-green-500/10 text-green-600 border-green-500/20 text-[9px] uppercase font-black">Active</Badge>
                                                                    ) : (
                                                                        <Badge variant="outline" className="text-[9px] uppercase font-black opacity-50">Inactive</Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right px-4">
                                                                    {canManage && (
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    <MoreHorizontal className="h-4 w-4" />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end" className="w-48 shadow-xl border-none">
                                                                                <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-3 py-2">Actions</DropdownMenuLabel>
                                                                                <DropdownMenuSeparator />
                                                                                <DropdownMenuItem onClick={() => handleEditClick(position)} className="cursor-pointer">
                                                                                    <Edit className="mr-3 h-4 w-4 text-primary" />
                                                                                    <span className="font-medium">Edit Position</span>
                                                                                </DropdownMenuItem>
                                                                                <DropdownMenuSeparator />
                                                                                <DropdownMenuItem onClick={() => handleArchive(position)} className="text-destructive cursor-pointer">
                                                                                    <Archive className="mr-3 h-4 w-4" />
                                                                                    <span className="font-medium">Archive Position</span>
                                                                                </DropdownMenuItem>
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Position Form Modal */}
            <PositionFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                position={selectedPosition}
                departments={departments}
                positions={positions}
                mode={modalMode}
            />

            {/* Position Confirmation Dialog */}
            <PositionConfirmationDialog
                open={confirmationOpen}
                onOpenChange={setConfirmationOpen}
                onConfirm={handleConfirmSubmit}
                isLoading={isSubmitting}
                mode={modalMode}
                positionTitle={selectedPosition?.title}
            />

            {/* Position Archive Dialog */}
            {positionToArchive && (
                <PositionArchiveDialog
                    open={!!positionToArchive}
                    onOpenChange={(open) => !open && setPositionToArchive(null)}
                    positionId={positionToArchive.id}
                    positionTitle={positionToArchive.title}
                    employeeCount={positionToArchive.employee_count}
                    routePrefix={routePrefix}
                />
            )}
        </AppLayout>
    );
}
