import { usePage } from '@inertiajs/react';
import { ReactNode } from 'react';

interface PermissionGateProps {
    /** Single permission or array of permissions to check */
    permission: string | string[];
    /** If true, requires ALL permissions. If false, requires ANY permission. Default: false */
    requireAll?: boolean;
    /** Content to render if permission check passes */
    children: ReactNode;
    /** Optional fallback content to render if permission check fails */
    fallback?: ReactNode;
}

/**
 * PermissionGate Component
 * 
 * Conditionally renders children based on user permissions.
 * 
 * @example
 * // Single permission
 * <PermissionGate permission="hr.employees.create">
 *   <Button>Add Employee</Button>
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (any)
 * <PermissionGate permission={["hr.employees.create", "hr.employees.update"]}>
 *   <Button>Edit Employee</Button>
 * </PermissionGate>
 * 
 * @example
 * // Multiple permissions (all required)
 * <PermissionGate 
 *   permission={["hr.employees.view", "hr.employees.view_salary"]} 
 *   requireAll
 * >
 *   <SalaryInfo />
 * </PermissionGate>
 * 
 * @example
 * // With fallback
 * <PermissionGate 
 *   permission="hr.departments.manage"
 *   fallback={<p>Access denied</p>}
 * >
 *   <DepartmentSettings />
 * </PermissionGate>
 */
export function PermissionGate({ 
    permission, 
    requireAll = false, 
    children, 
    fallback = null 
}: PermissionGateProps) {
    const { auth } = usePage<{ auth: { permissions: string[] } }>().props;
    const userPermissions = auth.permissions || [];

    // Convert single permission to array for uniform handling
    const requiredPermissions = Array.isArray(permission) ? permission : [permission];

    // Check if user has required permissions
    const hasPermission = requireAll
        ? requiredPermissions.every(perm => userPermissions.includes(perm))
        : requiredPermissions.some(perm => userPermissions.includes(perm));

    return hasPermission ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook to check permissions programmatically
 * 
 * @example
 * const { hasPermission } = usePermission();
 * 
 * if (hasPermission('hr.employees.create')) {
 *   // Show create form
 * }
 */
export function usePermission() {
    const { auth } = usePage<{ auth: { permissions: string[] } }>().props;
    const userPermissions = auth.permissions || [];

    const hasPermission = (permission: string | string[], requireAll = false): boolean => {
        const requiredPermissions = Array.isArray(permission) ? permission : [permission];
        
        return requireAll
            ? requiredPermissions.every(perm => userPermissions.includes(perm))
            : requiredPermissions.some(perm => userPermissions.includes(perm));
    };

    return { hasPermission, permissions: userPermissions };
}
