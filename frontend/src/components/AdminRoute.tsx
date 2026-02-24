import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { isAuthenticated } from '../utils/auth';
import { getCurrentUser } from '../api/auth';
import LoadingSpinner from './LoadingSpinner';
import Layout from './Layout';

interface AdminRouteProps {
    children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
    // First check if logged in at all
    if (!isAuthenticated()) {
        return <Navigate to="/login" replace />;
    }

    // Then check if admin
    const { data: user, isLoading } = useQuery({
        queryKey: ['currentUser'],
        queryFn: getCurrentUser,
    });

    if (isLoading) {
        return <Layout><LoadingSpinner /></Layout>;
    }

    // Non-admin users → redirect to their own dashboard
    if (!user?.is_admin) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
}
