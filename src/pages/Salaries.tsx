import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { SalaryManagement } from "@/components/salary/SalaryManagement";

export default function Salaries() {
  const { user, role } = useAuth();
  const isAdmin = role === "admin";
  const isManager = role === "manager";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Salaries</h1>
          <p className="text-muted-foreground">View and manage employee salary information</p>
        </div>

        {user && (isAdmin || isManager) ? (
          <SalaryManagement 
            userId={user.id} 
            isAdmin={isAdmin} 
            isManager={isManager} 
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>You don't have permission to view salary management.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
