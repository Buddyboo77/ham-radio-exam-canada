import { ReactNode } from 'react';
import { Route, Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';

interface ProtectedRouteProps {
  path: string;
  children: ReactNode;
}

export function ProtectedRoute({ path, children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  return (
    <Route
      path={path}
      component={() =>
        isAuthenticated ? (
          <>{children}</>
        ) : (
          <Redirect to="/auth" />
        )
      }
    />
  );
}