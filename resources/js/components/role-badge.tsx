import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, Crown } from 'lucide-react';

interface RoleBadgeProps {
    /** Role name to display */
    role: string;
    /** Optional size variant */
    size?: 'sm' | 'md' | 'lg';
    /** Show icon */
    showIcon?: boolean;
}

/**
 * RoleBadge Component
 * 
 * Displays a styled badge for user roles with appropriate colors and icons.
 * 
 * @example
 * <RoleBadge role="HR Manager" />
 * <RoleBadge role="HR Staff" size="sm" />
 * <RoleBadge role="Superadmin" showIcon />
 */
export function RoleBadge({ role, size = 'md', showIcon = true }: RoleBadgeProps) {
    const getRoleConfig = (roleName: string) => {
        const roleUpper = roleName.toUpperCase();
        
        if (roleUpper.includes('SUPERADMIN')) {
            return {
                variant: 'default' as const,
                icon: Crown,
                className: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0',
            };
        }
        
        if (roleUpper.includes('HR MANAGER')) {
            return {
                variant: 'default' as const,
                icon: ShieldCheck,
                className: 'bg-blue-600 text-white border-0',
            };
        }
        
        if (roleUpper.includes('HR STAFF')) {
            return {
                variant: 'secondary' as const,
                icon: Shield,
                className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
            };
        }
        
        if (roleUpper.includes('PAYROLL')) {
            return {
                variant: 'secondary' as const,
                icon: Shield,
                className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
            };
        }
        
        // Default for unknown roles
        return {
            variant: 'outline' as const,
            icon: Shield,
            className: '',
        };
    };

    const config = getRoleConfig(role);
    const Icon = config.icon;
    
    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5',
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-3.5 w-3.5',
        lg: 'h-4 w-4',
    };

    return (
        <Badge 
            variant={config.variant} 
            className={`${config.className} ${sizeClasses[size]} font-semibold inline-flex items-center gap-1.5`}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            <span>{role}</span>
        </Badge>
    );
}

/**
 * RoleIndicator Component
 * 
 * Displays role with descriptive text, useful for dashboard headers.
 * 
 * @example
 * <RoleIndicator role="HR Staff" description="Operational Support" />
 */
export function RoleIndicator({ 
    role, 
    description 
}: { 
    role: string; 
    description?: string;
}) {
    return (
        <div className="flex items-center gap-2">
            <RoleBadge role={role} size="md" />
            {description && (
                <span className="text-sm text-muted-foreground">
                    {description}
                </span>
            )}
        </div>
    );
}
