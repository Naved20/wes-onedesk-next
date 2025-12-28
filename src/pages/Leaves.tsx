import { useEffect, useState } from "react";
import { format, differenceInDays } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Calendar, Plus, CheckCircle, XCircle } from "lucide-react";
import { Database } from "@/integrations/supabase/types";

type Leave = Database["public"]["Tables"]["leaves"]["Row"];

interface LeaveWithEmployee extends Leave {
  employee_name?: string;
}

export default function Leaves() {
  const { user, role } = useAuth();
  const [leaves, setLeaves] = useState<LeaveWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, [role]);

  const fetchLeaves = async () => {
    try {
      const { data: leavesData, error } = await supabase
        .from("leaves")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // For managers and admins, fetch employee names
      if ((role === "admin" || role === "manager") && leavesData && leavesData.length > 0) {
        const userIds = [...new Set(leavesData.map(l => l.user_id))];
        const { data: profiles } = await supabase
          .from("employee_profiles")
          .select("user_id, first_name, last_name")
          .in("user_id", userIds);

        const profileMap = new Map(
          profiles?.map(p => [p.user_id, `${p.first_name} ${p.last_name}`]) || []
        );

        const leavesWithNames = leavesData.map(leave => ({
          ...leave,
          employee_name: profileMap.get(leave.user_id) || "Unknown",
        }));

        setLeaves(leavesWithNames);
      } else {
        setLeaves(leavesData || []);
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast({
        title: "Error",
        description: "Failed to load leave records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("leaves").insert({
        user_id: user.id,
        start_date: startDate,
        end_date: endDate,
        reason,
        is_emergency: isEmergency,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Leave Applied",
        description: "Your leave request has been submitted for approval.",
      });
      
      setDialogOpen(false);
      setStartDate("");
      setEndDate("");
      setReason("");
      setIsEmergency(false);
      fetchLeaves();
    } catch (error) {
      console.error("Error applying leave:", error);
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("leaves")
        .update({ 
          status: "approved", 
          approved_by: user?.id,
          approved_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Approved", description: "Leave request approved successfully." });
      fetchLeaves();
    } catch (error) {
      console.error("Error approving:", error);
      toast({ title: "Error", description: "Failed to approve leave", variant: "destructive" });
    }
  };

  const handleReject = async (id: string, rejectionReason?: string) => {
    try {
      const { error } = await supabase
        .from("leaves")
        .update({ 
          status: "rejected",
          rejection_reason: rejectionReason || "Request denied",
        })
        .eq("id", id);

      if (error) throw error;

      toast({ title: "Rejected", description: "Leave request rejected." });
      fetchLeaves();
    } catch (error) {
      console.error("Error rejecting:", error);
      toast({ title: "Error", description: "Failed to reject leave", variant: "destructive" });
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

  const calculateDays = (start: string, end: string) => {
    return differenceInDays(new Date(end), new Date(start)) + 1;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leaves</h1>
            <p className="text-muted-foreground">Manage leave requests and approvals</p>
          </div>
          {role === "employee" && (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Apply for Leave
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Please provide a reason for your leave..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="emergency"
                      checked={isEmergency}
                      onChange={(e) => setIsEmergency(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="emergency" className="text-sm font-normal">
                      This is an emergency leave
                    </Label>
                  </div>
                  <Button type="submit" className="w-full" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Leave Request"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {role === "employee" ? "My Leave Requests" : "Leave Requests"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : leaves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No leave requests found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {(role === "admin" || role === "manager") && (
                        <TableHead>Employee</TableHead>
                      )}
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Days</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      {(role === "admin" || role === "manager") && (
                        <TableHead className="text-right">Actions</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaves.map((leave) => (
                      <TableRow key={leave.id}>
                        {(role === "admin" || role === "manager") && (
                          <TableCell className="font-medium">{leave.employee_name || "-"}</TableCell>
                        )}
                        <TableCell>{format(new Date(leave.start_date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{format(new Date(leave.end_date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>{calculateDays(leave.start_date, leave.end_date)}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{leave.reason}</TableCell>
                        <TableCell>
                          {leave.is_emergency ? (
                            <Badge variant="destructive">Emergency</Badge>
                          ) : (
                            <Badge variant="outline">Regular</Badge>
                          )}
                        </TableCell>
                        <TableCell>{getStatusBadge(leave.status || "pending")}</TableCell>
                        {(role === "admin" || role === "manager") && (
                          <TableCell className="text-right">
                            {leave.status === "pending" && (
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleApprove(leave.id)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(leave.id)}
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
