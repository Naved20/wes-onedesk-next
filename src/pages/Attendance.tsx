import { useEffect, useState } from "react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Attendance = Database["public"]["Tables"]["attendance"]["Row"];

interface AttendanceWithEmployee extends Attendance {
  employee_name?: string;
}

export default function Attendance() {
  const { user, role } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [todayCheckedIn, setTodayCheckedIn] = useState(false);

  useEffect(() => {
    fetchAttendance();
    checkTodayAttendance();
  }, [role]);

  const fetchAttendance = async () => {
    try {
      const { data: attendanceData, error } = await supabase
        .from("attendance")
        .select("*")
        .order("date", { ascending: false })
        .limit(50);

      if (error) throw error;

      // For managers and admins, fetch employee names
      if ((role === "admin" || role === "manager") && attendanceData && attendanceData.length > 0) {
        const userIds = [...new Set(attendanceData.map(a => a.user_id))];
        const { data: profiles } = await supabase
          .from("employee_profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", userIds);

        const profileMap = new Map(
          profiles?.map(p => [p.user_id, `${p.first_name} ${p.last_name}`]) || []
        );

        const recordsWithNames = attendanceData.map(record => ({
          ...record,
          employee_name: profileMap.get(record.user_id) || "Unknown",
        }));

        setAttendanceRecords(recordsWithNames);
      } else {
        setAttendanceRecords(attendanceData || []);
      }
    } catch (error) {
      console.error("Error fetching attendance:", error);
      toast({
        title: "Error",
        description: "Failed to load attendance records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkTodayAttendance = async () => {
    if (!user) return;
    
    const today = format(new Date(), "yyyy-MM-dd");
    const { data } = await supabase
      .from("attendance")
      .select("id")
      .eq("user_id", user.id)
      .eq("date", today)
      .maybeSingle();

    setTodayCheckedIn(!!data);
  };

  const handleCheckIn = async () => {
    if (!user) return;
    
    setCheckingIn(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const now = new Date().toISOString();

      const { error } = await supabase.from("attendance").insert({
        user_id: user.id,
        date: today,
        check_in_time: now,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Checked In",
        description: "Your attendance has been recorded successfully.",
      });
      setTodayCheckedIn(true);
      fetchAttendance();
    } catch (error) {
      console.error("Error checking in:", error);
      toast({
        title: "Error",
        description: "Failed to record attendance",
        variant: "destructive",
      });
    } finally {
      setCheckingIn(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("attendance")
        .update({ 
          status: "approved", 
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Approved", description: "Attendance approved successfully." });
      fetchAttendance();
    } catch (error) {
      console.error("Error approving:", error);
      toast({ title: "Error", description: "Failed to approve attendance", variant: "destructive" });
    }
  };

  const handleReject = async (id: string) => {
    try {
      const { error } = await supabase
        .from("attendance")
        .update({ status: "rejected" })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Rejected", description: "Attendance rejected." });
      fetchAttendance();
    } catch (error) {
      console.error("Error rejecting:", error);
      toast({ title: "Error", description: "Failed to reject attendance", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
            <p className="text-muted-foreground">Track and manage attendance records</p>
          </div>
          {role === "employee" && (
            <Button onClick={handleCheckIn} disabled={checkingIn || todayCheckedIn}>
              <Clock className="h-4 w-4 mr-2" />
              {todayCheckedIn ? "Already Checked In" : checkingIn ? "Checking In..." : "Check In"}
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {role === "employee" ? "My Attendance Records" : "Attendance Records"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {(role === "admin" || role === "manager") && (
                        <TableHead>Employee</TableHead>
                      )}
                      <TableHead>Date</TableHead>
                      <TableHead>Check-in Time</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      {(role === "admin" || role === "manager") && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        {(role === "admin" || role === "manager") && (
                          <TableCell className="font-medium">{record.employee_name || "-"}</TableCell>
                        )}
                        <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          {record.check_in_time
                            ? format(new Date(record.check_in_time), "hh:mm a")
                            : "-"}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status || "pending")}</TableCell>
                        <TableCell>{record.notes || "-"}</TableCell>
                        {(role === "admin" || role === "manager") && (
                          <TableCell className="text-right">
                            {record.status === "pending" && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(record.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(record.id)}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
