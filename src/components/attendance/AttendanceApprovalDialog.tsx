import { useState } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Clock, AlertTriangle, Shield } from "lucide-react";

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  check_in_time: string | null;
  status: string | null;
  is_half_day: boolean | null;
  half_day_type: string | null;
  is_late: boolean | null;
  notes: string | null;
  employee_name?: string;
}

interface AttendanceApprovalDialogProps {
  attendance: AttendanceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
  userId: string;
  isAdmin: boolean;
}

export function AttendanceApprovalDialog({
  attendance,
  isOpen,
  onClose,
  onUpdate,
  userId,
  isAdmin,
}: AttendanceApprovalDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminOverride, setAdminOverride] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!attendance) return null;

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("attendance")
        .update({
          status: "approved",
          approved_by: userId,
          approved_at: new Date().toISOString(),
          admin_override: adminOverride,
          modified_by: adminOverride ? userId : null,
        })
        .eq("id", attendance.id);

      if (error) throw error;

      toast({ title: "Approved", description: "Attendance approved successfully" });
      onClose();
      onUpdate();
    } catch (error) {
      console.error("Error approving:", error);
      toast({
        title: "Error",
        description: "Failed to approve attendance",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Reason Required",
        description: "Please provide a reason for rejection",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("attendance")
        .update({
          status: "rejected",
          rejection_reason: rejectionReason.trim(),
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", attendance.id);

      if (error) throw error;

      toast({ title: "Rejected", description: "Attendance rejected" });
      setRejectionReason("");
      onClose();
      onUpdate();
    } catch (error) {
      console.error("Error rejecting:", error);
      toast({
        title: "Error",
        description: "Failed to reject attendance",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Review Attendance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee Info */}
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-sm text-muted-foreground">Employee</p>
            <p className="font-semibold text-lg">{attendance.employee_name || "Unknown"}</p>
          </div>

          {/* Attendance Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">{format(new Date(attendance.date), "MMM dd, yyyy")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Check-in Time</p>
              <p className="font-medium">
                {attendance.check_in_time
                  ? format(new Date(attendance.check_in_time), "hh:mm a")
                  : "-"}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {attendance.is_half_day && (
              <Badge variant="secondary">
                Half Day ({attendance.half_day_type === "first_half" ? "Morning" : "Afternoon"})
              </Badge>
            )}
            {attendance.is_late && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Late Check-in
              </Badge>
            )}
          </div>

          {/* Notes */}
          {attendance.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm p-3 rounded-lg bg-muted">{attendance.notes}</p>
            </div>
          )}

          {/* Late Warning */}
          {attendance.is_late && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Late Check-in Flagged</p>
                <p className="text-sm text-muted-foreground">
                  This employee checked in after 11:00 AM IST
                </p>
              </div>
            </div>
          )}

          {/* Admin Override */}
          {isAdmin && attendance.status !== "approved" && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                <Label htmlFor="admin-override" className="cursor-pointer">
                  Admin Override
                </Label>
              </div>
              <Switch
                id="admin-override"
                checked={adminOverride}
                onCheckedChange={setAdminOverride}
              />
            </div>
          )}

          {/* Rejection Reason */}
          {attendance.status === "pending" && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Required if rejecting..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={2}
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          {attendance.status === "pending" && (
            <>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={submitting}
                className="flex-1 sm:flex-none"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={handleApprove}
                disabled={submitting}
                className="flex-1 sm:flex-none"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
          {attendance.status !== "pending" && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
