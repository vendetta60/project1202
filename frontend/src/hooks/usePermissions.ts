import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '../api/auth';

/**
 * Central hook for permission checks.
 * Admins (is_admin = true) bypass all checks.
 */
export function usePermissions() {
    const { data: user } = useQuery({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
    });

    const isAdmin = user?.is_admin ?? false;
    const isSuperAdmin = user?.is_super_admin ?? false;
    const perms = user?.permissions ?? [];
    const rank = user?.rank ?? 1;

    /** Returns true if user has the given permission OR is admin */
    const can = (code: string): boolean => {
        if (isAdmin) return true;
        return perms.includes(code);
    };

    /** Returns true if user has ANY of the given permissions OR is admin */
    const canAny = (...codes: string[]): boolean => {
        if (isAdmin) return true;
        return codes.some((c) => perms.includes(c));
    };

    return {
        user,
        isAdmin,
        isSuperAdmin,
        can,
        canAny,
        rank,
        // Convenience shortcuts
        canViewAppeals: isAdmin || perms.includes('view_appeals'),
        canCreateAppeal: isAdmin || perms.includes('create_appeal'),
        canEditAppeal: isAdmin || perms.includes('edit_appeal'),
        canDeleteAppeal: isAdmin || perms.includes('delete_appeal'),
        canViewAppealDetails: isAdmin || perms.includes('view_appeal_details'),
        canAssignAppeal: isAdmin || perms.includes('assign_appeal'),
        canCompleteAppeal: isAdmin || perms.includes('complete_appeal'),
        canExportAppeals: isAdmin || perms.includes('export_appeals'),
        canViewUsers: isAdmin || perms.includes('view_users'),
        canCreateUser: isAdmin || perms.includes('create_user'),
        canEditUser: isAdmin || perms.includes('edit_user'),
        canDeleteUser: isAdmin || perms.includes('delete_user'),
        canBlockUser: isAdmin || perms.includes('block_user'),
        canManageRoles: isAdmin || perms.includes('manage_user_roles'),
        canResetPassword: isAdmin || perms.includes('reset_user_password'),
    };
}
