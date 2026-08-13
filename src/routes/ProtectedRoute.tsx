import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore, type UserRole } from '@/store/auth-store';

type ProtectedRouteProps = {
  allowedRoles?: UserRole[];
};

export function RequireAuth() {
  const role = useAuthStore((s) => s.role);
  if (!role) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function RequireRole({ allowedRoles }: ProtectedRouteProps) {
  const role = useAuthStore((s) => s.role);

  if (!role) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/jornadas" replace />;
  }

  return <Outlet />;
}