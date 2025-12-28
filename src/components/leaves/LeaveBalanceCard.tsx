import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, AlertTriangle, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LeaveBalance {
  casual_leaves_entitled: number;
  casual_leaves_used: number;
  sick_leaves_used: number;
  unplanned_leaves_used: number;
}

interface LeaveBalanceCardProps {
  balance: LeaveBalance | null;
  loading?: boolean;
}

export function LeaveBalanceCard({ balance, loading }: LeaveBalanceCardProps) {
  const casualEntitled = balance?.casual_leaves_entitled ?? 2;
  const casualUsed = balance?.casual_leaves_used ?? 0;
  const casualRemaining = Math.max(0, casualEntitled - casualUsed);
  const sickUsed = balance?.sick_leaves_used ?? 0;
  const unplannedUsed = balance?.unplanned_leaves_used ?? 0;
  
  const usagePercent = (casualUsed / casualEntitled) * 100;

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Leave Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CalendarDays className="h-4 w-4" />
          Monthly Leave Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Casual Leaves */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Casual Leaves</span>
            <Badge variant={casualRemaining > 0 ? "secondary" : "destructive"}>
              {casualUsed}/{casualEntitled} used
            </Badge>
          </div>
          <Progress value={usagePercent} className="h-2" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">
              {casualRemaining} remaining
            </span>
            {casualRemaining === 0 && (
              <span className="text-xs text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Limit reached
              </span>
            )}
            {casualRemaining === 1 && (
              <span className="text-xs text-amber-600 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                1 remaining
              </span>
            )}
          </div>
        </div>

        {/* Single Day Policy Notice */}
        <div className="bg-muted/50 rounded-lg p-2 flex items-start gap-2">
          <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            <strong>1 day per application only.</strong> Each casual leave application must be for exactly 1 day.
          </p>
        </div>

        {/* Other Leave Types Summary */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-amber-600">{sickUsed}</div>
            <div className="text-xs text-muted-foreground">Sick (50% ded.)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-destructive">{unplannedUsed}</div>
            <div className="text-xs text-muted-foreground">Unplanned (100% ded.)</div>
          </div>
        </div>

        {/* Legend */}
        <div className="text-xs text-muted-foreground pt-2 border-t space-y-1">
          <p>• <strong>Casual:</strong> 2/month max, <u>1 day per application</u>, 3-day notice</p>
          <p>• <strong>Sick:</strong> With medical proof, 50% salary deduction</p>
          <p>• <strong>Unplanned:</strong> 100% salary deduction</p>
        </div>
      </CardContent>
    </Card>
  );
}
