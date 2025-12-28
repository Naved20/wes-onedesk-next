import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, AlertTriangle } from "lucide-react";

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
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Casual Leaves</span>
            <span className="font-medium">
              {casualUsed}/{casualEntitled} used
            </span>
          </div>
          <Progress value={usagePercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{casualRemaining} remaining</span>
            {casualRemaining === 0 && (
              <span className="text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Limit reached
              </span>
            )}
          </div>
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
          <p>• <strong>Casual:</strong> 2/month, 3-day notice, 1/week max</p>
          <p>• <strong>Sick:</strong> With medical proof, 50% salary deduction</p>
          <p>• <strong>Unplanned:</strong> 100% salary deduction</p>
        </div>
      </CardContent>
    </Card>
  );
}
