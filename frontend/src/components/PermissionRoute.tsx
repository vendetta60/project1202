import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isAuthenticated } from '../utils/auth';
import { getCurrentUser } from '../api/auth';
import LoadingSpinner from './LoadingSpinner';
import Layout from './Layout';

interface PermissionRouteProps {
    children: React.ReactNode;
    /** The permission code required to access this route */
    permission: string;
    /** Optional: redirect destination if permission is missing (default: /dashboard) */
    redirectTo?: string;
}

/**
 * Route guard that requires a specific permission code.
 * Admins (is_admin = true) always pass through.
 */
export default function PermissionRoute({
    children,
    permission,
    redirectTo = '/dashboard',
}: PermissionRouteProps) {
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    const { data: user, isLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
    });

    if (isLoading) {
        return <Layout><LoadingSpinner /></Layout>;
    }

    const hasPermission =
        user?.is_admin || (user?.permissions ?? []).includes(permission);

    if (!hasPermission) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
