import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SalaryStatusWidget } from "@/components/dashboard/SalaryStatusWidget";
import { Users, Clock, Calendar, DollarSign, Bell, FileText, Building } from "lucide-react";

export default function Dashboard() {
  const { role, loading, user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingAttendance: 0,
    pendingLeaves: 0,
    activeAnnouncements: 0,
    pendingDocuments: 0,
    pendingSalaries: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading) {
      fetchDashboardStats();
    }
  }, [loading, role]);

  const fetchDashboardStats = async () => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Fetch stats based on role
      const [
        employeesResult,
        attendanceResult,
        leavesResult,
        announcementsResult,
        salariesResult,
      ] = await Promise.all([
        role === "admin" || role === "manager"
          ? supabase.from("employee_profiles").select("id", { count: "exact" })
          : Promise.resolve({ count: 0 }),
        supabase.from("attendance").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("leaves").select("id", { count: "exact" }).eq("status", "pending"),
        supabase.from("announcements").select("id", { count: "exact" }).eq("is_active", true),
        role === "admin"
          ? supabase
              .from("salaries")
              .select("id", { count: "exact" })
              .eq("month", currentMonth)
              .eq("year", currentYear)
              .eq("approval_status", "pending_approval")
              .eq("is_locked", false)
          : Promise.resolve({ count: 0 }),
      ]);

      setStats({
        totalEmployees: employeesResult.count || 0,
        pendingAttendance: attendanceResult.count || 0,
        pendingLeaves: leavesResult.count || 0,
        activeAnnouncements: announcementsResult.count || 0,
        pendingDocuments: 0,
        pendingSalaries: salariesResult.count || 0,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const getRoleTitle = () => {
    switch (role) {
      case "admin":
        return "Admin Dashboard";
      case "manager":
        return "Manager Dashboard";
      case "employee":
        return "Employee Dashboard";
      default:
        return "Dashboard";
    }
  };

  const getStatCards = () => {
    const commonCards = [
      {
        title: "Pending Leaves",
        value: stats.pendingLeaves,
        icon: <Calendar className="h-6 w-6 text-primary" />,
        description: "Leave requests awaiting approval",
        onClick: () => router.push("/leaves"),
      },
      {
        title: "Announcements",
        value: stats.activeAnnouncements,
        icon: <Bell className="h-6 w-6 text-primary" />,
        description: "Active announcements",
        onClick: () => router.push("/announcements"),
      },
    ];

    if (role === "admin") {
      return [
        {
          title: "Total Employees",
          value: stats.totalEmployees,
          icon: <Users className="h-6 w-6 text-primary" />,
          description: "Active employees in the system",
          onClick: () => router.push("/employees"),
        },
        {
          title: "Pending Attendance",
          value: stats.pendingAttendance,
          icon: <Clock className="h-6 w-6 text-primary" />,
          description: "Attendance records to review",
          onClick: () => router.push("/attendance"),
        },
        ...commonCards,
        {
          title: "Pending Documents",
          value: stats.pendingDocuments,
          icon: <FileText className="h-6 w-6 text-primary" />,
          description: "Documents awaiting verification",
          onClick: () => router.push("/documents"),
        },
        {
          title: "Salary Processing",
          value: stats.pendingSalaries,
          icon: <DollarSign className="h-6 w-6 text-primary" />,
          description: "Salaries to process this month",
          onClick: () => router.push("/salaries"),
        },
      ];
    }

    if (role === "manager") {
      return [
        {
          title: "Team Members",
          value: stats.totalEmployees,
          icon: <Users className="h-6 w-6 text-primary" />,
          description: "Employees in your institution",
          onClick: () => router.push("/employees"),
        },
        {
          title: "Pending Attendance",
          value: stats.pendingAttendance,
          icon: <Clock className="h-6 w-6 text-primary" />,
          description: "Attendance records to approve",
          onClick: () => router.push("/attendance"),
        },
        ...commonCards,
      ];
    }

    // Employee view
    return [
      {
        title: "My Attendance",
        value: "-",
        icon: <Clock className="h-6 w-6 text-primary" />,
        description: "View your attendance records",
        onClick: () => router.push("/attendance"),
      },
      {
        title: "My Leaves",
        value: "-",
        icon: <Calendar className="h-6 w-6 text-primary" />,
        description: "Manage your leave requests",
        onClick: () => router.push("/leaves"),
      },
      {
        title: "My Documents",
        value: "-",
        icon: <FileText className="h-6 w-6 text-primary" />,
        description: "Upload and manage documents",
        onClick: () => router.push("/documents"),
      },
      {
        title: "Announcements",
        value: stats.activeAnnouncements,
        icon: <Bell className="h-6 w-6 text-primary" />,
        description: "View company announcements",
        onClick: () => router.push("/announcements"),
      },
    ];
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{getRoleTitle()}</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's an overview of your workspace.
          </p>
        </div>

        {loadingStats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded w-1/4 mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getStatCards().map((card, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={card.onClick}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                    {card.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Salary Status Widget for Admin/Manager */}
        {(role === "admin" || role === "manager") && user && (
          <SalaryStatusWidget userId={user.id} role={role} />
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {role === "employee" && (
                <>
                  <button
                    onClick={() => router.push("/attendance")}
                    className="p-4 rounded-lg border bg-card hover:bg-muted transition-colors text-left"
                  >
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">Mark Attendance</h3>
                    <p className="text-sm text-muted-foreground">Check in for today</p>
                  </button>
                  <button
                    onClick={() => router.push("/leaves")}
                    className="p-4 rounded-lg border bg-card hover:bg-muted transition-colors text-left"
                  >
                    <Calendar className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">Apply for Leave</h3>
                    <p className="text-sm text-muted-foreground">Request time off</p>
                  </button>
                </>
              )}
              {(role === "admin" || role === "manager") && (
                <>
                  <button
                    onClick={() => router.push("/attendance")}
                    className="p-4 rounded-lg border bg-card hover:bg-muted transition-colors text-left"
                  >
                    <Clock className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">Review Attendance</h3>
                    <p className="text-sm text-muted-foreground">Approve pending requests</p>
                  </button>
                  <button
                    onClick={() => router.push("/leaves")}
                    className="p-4 rounded-lg border bg-card hover:bg-muted transition-colors text-left"
                  >
                    <Calendar className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">Manage Leaves</h3>
                    <p className="text-sm text-muted-foreground">Review leave applications</p>
                  </button>
                </>
              )}
              {role === "admin" && (
                <>
                  <button
                    onClick={() => router.push("/employees")}
                    className="p-4 rounded-lg border bg-card hover:bg-muted transition-colors text-left"
                  >
                    <Users className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">Add Employee</h3>
                    <p className="text-sm text-muted-foreground">Onboard new staff</p>
                  </button>
                  <button
                    onClick={() => router.push("/salaries")}
                    className="p-4 rounded-lg border bg-card hover:bg-muted transition-colors text-left"
                  >
                    <DollarSign className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-medium">Process Salaries</h3>
                    <p className="text-sm text-muted-foreground">Run monthly payroll</p>
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
