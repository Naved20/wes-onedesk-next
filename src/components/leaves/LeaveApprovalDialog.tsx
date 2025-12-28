import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

interface LeaveRequest {
  id: string;
  employee_name?: string;
  start_date: string;
  end_date: string;
  reason: string;
  leave_type: string;
  is_half_day: boolean;
  half_day_type?: string;
  is_emergency: boolean;
  working_days_count: number;
  salary_deduction_percent: number;
  auto_rejected: boolean;
  auto_rejection_reason?: string;
}

interface LeaveApprovalDialogProps {
  leave: LeaveRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
}

export function LeaveApprovalDialog({
  leave,
  open,
  onOpenChange,
  onApprove,
  onReject,
}: LeaveApprovalDialogProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState<"approve" | "reject" | null>(null);

  if (!leave) return null;

  const handleApprove = async () => {
    setProcessing("approve");
    try {
      await onApprove(leave.id);
      onOpenChange(false);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setProcessing("reject");
    try {
      await onReject(leave.id, rejectionReason.trim());
      setRejectionReason("");
      onOpenChange(false);
    } finally {
      setProcessing(null);
    }
  };

  const getLeaveTypeBadge = () => {
    const type = leave.leave_type || "casual";
    switch (type) {
      case "casual":
        return <Badge variant="default">Casual</Badge>;
      case "sick":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800">Sick</Badge>;
      case "unplanned":
        return <Badge variant="destructive">Unplanned</Badge>;
      case "emergency":
        return <Badge variant="outline" className="border-red-500 text-red-600">Emergency</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getSalaryImpact = () => {
    const percent = leave.salary_deduction_percent || 0;
    if (percent === 0) return { text: "No deduction", color: "text-green-600" };
    if (percent === 50) return { text: "50% deduction", color: "text-amber-600" };
    return { text: "100% deduction", color: "text-destructive" };
  };

  const salaryImpact = getSalaryImpact();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Review Leave Request</DialogTitle>
          <DialogDescription>
            {leave.employee_name ? `From: ${leave.employee_name}` : "Review and approve or reject this leave request"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Auto-rejection warning */}
          {leave.auto_rejected && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-destructive">Auto-Rejected</p>
                <p className="text-sm text-muted-foreground">{leave.auto_rejection_reason}</p>
              </div>
            </div>
          )}

          {/* Leave Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Leave Type</Label>
              <div className="mt-1">{getLeaveTypeBadge()}</div>
            </div>
            <div>
              <Label className="text-muted-foreground">Duration</Label>
              <p className="font-medium">
                {leave.working_days_count || 1} day(s)
                {leave.is_half_day && ` (${leave.half_day_type === "first_half" ? "Morning" : "Afternoon"})`}
              </p>
            </div>
            <div>
              <Label className="text-muted-foreground">Start Date</Label>
              <p className="font-medium">{format(new Date(leave.start_date), "PPP")}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">End Date</Label>
              <p className="font-medium">{format(new Date(leave.end_date), "PPP")}</p>
            </div>
          </div>

          {/* Salary Impact */}
          <div className="bg-muted p-3 rounded-lg">
            <Label className="text-muted-foreground">Salary Impact</Label>
            <p className={`font-medium ${salaryImpact.color}`}>{salaryImpact.text}</p>
          </div>

          {/* Emergency Flag */}
          {leave.is_emergency && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Marked as Emergency</span>
            </div>
          )}

          {/* Reason */}
          <div>
            <Label className="text-muted-foreground">Reason</Label>
            <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{leave.reason}</p>
          </div>

          {/* Rejection Reason Input */}
          <div>
            <Label>Rejection Reason (required for rejection)</Label>
            <Textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Provide reason if rejecting..."
              rows={2}
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={!!processing}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={!!processing || !rejectionReason.trim()}
          >
            {processing === "reject" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <XCircle className="mr-2 h-4 w-4" />
            Reject
          </Button>
          <Button onClick={handleApprove} disabled={!!processing || leave.auto_rejected}>
            {processing === "approve" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
