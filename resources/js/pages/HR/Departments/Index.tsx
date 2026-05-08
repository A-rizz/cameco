import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    DepartmentFormModal,
    type Department,
} from '@/components/hr/department-form-modal';
import { DepartmentArchiveDialog } from '@/components/hr/department-archive-dialog';
import { Building2, Plus, Edit, Archive, ChevronRight, Users, Network, TrendingUp, Layers } from 'lucide-react';
import { useState, useMemo, useEffect } from 'react';
import { usePermission } from '@/components/permission-gate';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

// ============================================================================
// Type Definitions
// ============================================================================

interface DepartmentIndexProps {
    departments: Department[];
    statistics?: {
        total?: number;
        active?: number;
        inactive?: number;
        largest_dept?: {
            name: string;
            count: number;
        };
        avg_size?: number;
    };
}

// ============================================================================
// Helper Functions
// ============================================================================

interface DepartmentNode extends Department {
    children?: DepartmentNode[];
}

/**
 * Build hierarchical tree structure from flat department list
 */
function buildDepartmentTree(departments: Department[]): DepartmentNode[] {
    const map = new Map<number, DepartmentNode>();
    const roots: DepartmentNode[] = [];

    // Create map of all departments
    departments.forEach(dept => {
        map.set(dept.id, { ...dept, children: [] });
    });

    // Build tree structure
    departments.forEach(dept => {
        const node = map.get(dept.id)!;
        if (dept.parent_id) {
            const parent = map.get(dept.parent_id);
            if (parent) {
                parent.children = parent.children || [];
                parent.children.push(node);
            }
        } else {
            roots.push(node);
        }
    });

    // Sort children alphabetically
    const sortChildren = (node: DepartmentNode) => {
        if (node.children) {
            node.children.sort((a, b) => a.name.localeCompare(b.name));
            node.children.forEach(sortChildren);
        }
    };

    roots.sort((a, b) => a.name.localeCompare(b.name));
    roots.forEach(sortChildren);

    return roots;
}

// ============================================================================
// Component
// ============================================================================

export default function DepartmentIndex({
    departments,
    statistics = {}
}: DepartmentIndexProps) {
    const { hasPermission } = usePermission();
    const page = usePage();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [expandedDepts, setExpandedDepts] = useState<Set<number>>(new Set());
    const [departmentToArchive, setDepartmentToArchive] = useState<Department | null>(null);

    const isAdminContext = page.url.startsWith('/admin');
    const routePrefix = isAdminContext ? '/admin' : '/hr';

    const breadcrumbs: BreadcrumbItem[] = [
        { title: isAdminContext ? 'Admin' : 'HR Dashboard', href: `${routePrefix}/dashboard` },
        { title: 'Departments', href: `${routePrefix}/departments` },
    ];

    useEffect(() => {
        const userRoles = (page.props.auth as any).roles || [];
        const isHRStaff = userRoles.includes('HR Staff');

        // Check if user has either HR manage, HR view or Admin view permission, or is HR Staff
        const hasAccess = hasPermission('hr.departments.manage') || 
                         hasPermission('hr.departments.view') || 
                         hasPermission('admin.departments.view') ||
                         isHRStaff;

        if (!hasAccess) {
            router.visit(isAdminContext ? '/admin/dashboard' : '/hr/dashboard');
        }
    }, [hasPermission, isAdminContext, page.props.auth]);

    const canManage = hasPermission('hr.departments.manage') || hasPermission('admin.departments.manage');

    const departmentTree = useMemo(() => buildDepartmentTree(departments), [departments]);

    const handleCreateClick = () => {
        setSelectedDepartment(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    const handleEditClick = (dept: Department) => {
        setSelectedDepartment(dept);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    const handleAddChildClick = (parentDept: Department) => {
        setSelectedDepartment({
            ...parentDept,
            id: 0,
            parent_id: parentDept.id,
        });
        setModalMode('create');
        setIsModalOpen(true);
    };

    const toggleExpanded = (deptId: number) => {
        const newExpanded = new Set(expandedDepts);
        if (newExpanded.has(deptId)) {
            newExpanded.delete(deptId);
        } else {
            newExpanded.add(deptId);
        }
        setExpandedDepts(newExpanded);
    };

    const handleModalSubmit = async (data: Omit<Department, 'id' | 'employee_count'>) => {
        const url = modalMode === 'create'
            ? `${routePrefix}/departments`
            : `${routePrefix}/departments/${selectedDepartment?.id}`;

        const method = modalMode === 'create' ? 'post' : 'put';

        router[method](url, data, {
            onSuccess: () => {
                setIsModalOpen(false);
            },
            onError: (errors) => {
                // Validation errors handled by Inertia
            }
        });
    };

    const handleArchive = (dept: Department) => {
        setDepartmentToArchive(dept);
    };

    /**
     * Render department tree node recursively
     */
    const renderDepartmentNode = (node: DepartmentNode, depth = 0) => {
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedDepts.has(node.id);

        return (
            <div key={node.id} className={`${depth > 0 ? 'ml-6 border-l-2 border-primary/10' : ''}`}>
                <div
                    className={`flex items-center gap-4 border-b group transition-all duration-200 hover:bg-primary/[0.02] active:bg-primary/[0.05] ${depth === 0 ? 'px-6 py-5' : 'px-4 py-3'
                        }`}
                >
                    {/* Expand/Collapse Button */}
                    <div className="flex-shrink-0 w-6 flex items-center justify-center">
                        {hasChildren && (
                            <button
                                onClick={() => toggleExpanded(node.id)}
                                className="p-1 hover:bg-primary/10 rounded-md transition-colors"
                            >
                                <ChevronRight
                                    className={`h-4 w-4 text-primary transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''
                                        }`}
                                />
                            </button>
                        )}
                    </div>

                    {/* Department Identity */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${depth === 0
                                ? 'bg-primary/10 text-primary'
                                : 'bg-muted text-muted-foreground'
                            }`}>
                            <Building2 className={`${depth === 0 ? 'h-5 w-5' : 'h-4 w-4'}`} />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                                <span className={`font-bold truncate ${depth === 0 ? 'text-lg' : 'text-sm'}`}>
                                    {node.name}
                                </span>
                                {!node.is_active ? (
                                    <Badge variant="outline" className="text-[10px] uppercase font-black px-1.5 py-0">
                                        Inactive
                                    </Badge>
                                ) : (
                                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20 text-[10px] uppercase font-black px-1.5 py-0">
                                        Active
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                                <span className="opacity-70">#</span>{node.code || 'NO-CODE'}
                                {hasChildren && (
                                    <>
                                        <span className="mx-1 opacity-20">|</span>
                                        <span className="flex items-center gap-1">
                                            <Layers className="h-3 w-3" />
                                            {node.children!.length} sub-units
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Personnel Metrics */}
                    <div className="hidden sm:flex items-center gap-6 flex-shrink-0 mr-4">
                        {node.employee_count !== undefined && (
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1.5 font-bold text-foreground">
                                    <Users className="h-3.5 w-3.5 text-primary" />
                                    <span>{node.employee_count}</span>
                                </div>
                                <span className="text-[10px] text-muted-foreground uppercase font-black tracking-tight">Employees</span>
                            </div>
                        )}
                    </div>

                    {/* Action Hub - Only for Managers */}
                    {canManage && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 shadow-xl border-none">
                                <DropdownMenuLabel className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-3 py-2">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handleEditClick(node)}
                                    className="cursor-pointer px-3 py-2"
                                >
                                    <Edit className="mr-3 h-4 w-4 text-primary" />
                                    <span className="font-medium">Edit Department</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => handleAddChildClick(node)}
                                    className="cursor-pointer px-3 py-2"
                                >
                                    <Plus className="mr-3 h-4 w-4 text-green-600" />
                                    <span className="font-medium">Add Sub-unit</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => handleArchive(node)}
                                    className="text-destructive cursor-pointer px-3 py-2 focus:bg-destructive/10"
                                >
                                    <Archive className="mr-3 h-4 w-4" />
                                    <span className="font-medium">Archive Department</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Recursive Children Rendering */}
                {hasChildren && isExpanded && (
                    <div className="transition-all duration-500 ease-in-out">
                        {node.children!.map(child => renderDepartmentNode(child, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departments" />

            <div className="space-y-6 p-4 max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                            {canManage ? 'Manage Departments' : 'View Departments'}
                        </h1>
                        <p className="text-lg text-muted-foreground">
                            {canManage 
                                ? "Manage your company's departments and sub-units."
                                : "View all company departments and their structures."
                            }
                        </p>
                    </div>
                    {canManage && (
                        <Button
                            onClick={handleCreateClick}
                            className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Department
                        </Button>
                    )}
                    {!canManage && (
                        <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-xl border border-border/50 text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                            View Only Access
                        </div>
                    )}
                </div>

                {/* Primary Metrics */}
                <div className="grid gap-6 sm:grid-cols-3">
                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">All Departments</CardTitle>
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Network className="h-4 w-4 text-primary" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{statistics.total}</div>
                            <p className="text-xs text-muted-foreground mt-1">Total departments created</p>
                        </CardContent>
                    </Card>
                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Open</CardTitle>
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {statistics.active || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Departments with people</p>
                        </CardContent>
                    </Card>
                    <Card className="relative overflow-hidden group border-none shadow-md">
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-400" />
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Closed</CardTitle>
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                <Archive className="h-4 w-4 text-slate-500" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-500">
                                {statistics.inactive || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Inactive departments</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Stats */}
                {statistics.largest_dept && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-none shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-3 opacity-5">
                                <Users className="h-20 w-20" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-primary/60 flex items-center gap-2">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    Biggest Department
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-primary">{statistics.largest_dept.name}</div>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-[10px] font-bold">
                                        {statistics.largest_dept.count} Employees
                                    </Badge>
                                    <span className="text-xs text-muted-foreground font-medium italic">Most employees</span>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-gradient-to-br from-indigo-500/5 to-indigo-500/10 border-none shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-3 opacity-5">
                                <Network className="h-20 w-20" />
                            </div>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-widest text-indigo-600/60 flex items-center gap-2">
                                    <Layers className="h-3.5 w-3.5" />
                                    Average Size
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-black text-indigo-600">{statistics.avg_size}</div>
                                <p className="text-xs text-muted-foreground mt-1 font-medium italic">Average people per department</p>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Departments List */}
                <Card className="border-none shadow-xl bg-card/80 backdrop-blur-md overflow-hidden">
                    <CardHeader className="border-b bg-muted/30 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold">Departments List</CardTitle>
                                <CardDescription className="mt-1 font-medium italic">
                                    View all departments and their sub-units
                                </CardDescription>
                            </div>
                            <div className="text-[10px] font-black px-2 py-1 bg-primary/10 text-primary rounded-full border border-primary/20 tracking-tighter uppercase">
                                Tree View
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {departments.length === 0 ? (
                            <div className="py-24 text-center">
                                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6 ring-8 ring-muted/10">
                                    <Building2 className="h-10 w-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">No departments found</h3>
                                <p className="text-muted-foreground max-w-sm mx-auto mb-8">
                                    Your department list is empty. Start by adding one.
                                </p>
                                <Button
                                    onClick={handleCreateClick}
                                    className="shadow-lg shadow-primary/20"
                                >
                                    Add First Department
                                </Button>
                            </div>
                        ) : (
                            <div className="divide-y divide-border border-none">
                                {departmentTree.map(dept => renderDepartmentNode(dept))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Department Form Modal */}
            <DepartmentFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleModalSubmit}
                department={selectedDepartment}
                departments={departments}
                mode={modalMode}
            />

            {/* Department Archive Dialog */}
            {departmentToArchive && (
                <DepartmentArchiveDialog
                    open={!!departmentToArchive}
                    onOpenChange={(open) => !open && setDepartmentToArchive(null)}
                    departmentId={departmentToArchive.id}
                    departmentName={departmentToArchive.name}
                    employeeCount={departmentToArchive.employee_count}
                    routePrefix={routePrefix}
                />
            )}
        </AppLayout>
    );
}
