'use client'

import { usePathname, redirect } from 'next/navigation';
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children, allowedRoles }) {
  const { user, role, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    redirect(`/auth?from=${pathname}`);
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    redirect('/dashboard');
  }

  return <>{children}</>;
}
