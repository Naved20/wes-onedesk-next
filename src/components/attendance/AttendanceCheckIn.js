import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

export function AttendanceCheckIn({ userId, todayCheckedIn, onCheckInComplete  }) {
  const [checkingIn, setCheckingIn] = useState(false);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayType, setHalfDayType] = useState("");
  const [notes, setNotes] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isWithinWindow, setIsWithinWindow] = useState(false);
  const [isLate, setIsLate] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      // Check window (9 AM - 11 AM IST)
      // Convert to IST by adding 5:30 hours
      const istOffset = 5.5 * 60 * 60 * 1000;
      const istTime = new Date(now.getTime() + istOffset + now.getTimezoneOffset() * 60 * 1000);
      const hour = istTime.getHours();
      const minute = istTime.getMinutes();
      
      setIsWithinWindow((hour >= 9 && hour < 11) || (hour === 11 && minute === 0));
      setIsLate(hour >= 11);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get IST time for display
  const getISTTime = () => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(currentTime.getTime() + istOffset + currentTime.getTimezoneOffset() * 60 * 1000);
    return format(istTime, "hh:mm:ss a");
  };

  const getISTHour = () => {
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(currentTime.getTime() + istOffset + currentTime.getTimezoneOffset() * 60 * 1000);
    return istTime.getHours();
  };

  const handleCheckIn = async () => {
    if (!userId) return;
    if (isHalfDay && !halfDayType) {
      toast({
        title: "Validation Error",
        description: "Please select half day type",
        variant: "destructive",
      });
      return;
    }

    setCheckingIn(true);
    try {
      const today = format(new Date(), "yyyy-MM-dd");
      const now = new Date().toISOString();

      const { error } = await supabase.from("attendance").insert({
        user_id: userId,
        date: today,
        check_in_time: now,
        is_half_day: isHalfDay,
        half_day_type: isHalfDay ? halfDayType : null,
        is_late: isLate,
        notes: notes.trim() || null,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Attendance marked successfully",
      });
      
      onCheckInComplete();
    } catch (error) {
      console.error("Error checking in:", error);
      toast({
        title: "Error",
        description: "Failed to mark attendance",
        variant: "destructive",
      });
    } finally {
      setCheckingIn(false);
    }
  };

  if (todayCheckedIn) {
    return (
      <Card className="border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-lg">Already Checked In</p>
              <p className="text-sm text-muted-foreground">
                {format(new Date(), "EEEE, MMMM do, yyyy")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Daily Check-In
          </div>
          <Badge variant={isWithinWindow ? "default" : "secondary"}>
            {isWithinWindow ? "Window Open" : "Outside Window"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Time Display */}
        <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted">
          <div>
            <p className="text-sm text-muted-foreground">Current Time (IST)</p>
            <p className="text-2xl font-bold font-mono">{getISTTime()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Check-in Window</p>
            <p className="font-medium">9:00 AM - 11:00 AM</p>
          </div>
        </div>

        {/* Late Warning */}
        {isLate && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Late Check-In</p>
              <p className="text-sm text-muted-foreground">
                Your check-in will be flagged for manager review
              </p>
            </div>
          </div>
        )}

        {/* Half Day Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="half-day" className="cursor-pointer">
            Half Day Attendance
          </Label>
          <Switch
            id="half-day"
            checked={isHalfDay}
            onCheckedChange={setIsHalfDay}
          />
        </div>

        {/* Half Day Type Selection */}
        {isHalfDay && (
          <div className="space-y-2">
            <Label htmlFor="half-day-type">Half Day Type</Label>
            <Select value={halfDayType} onValueChange={setHalfDayType}>
              <SelectTrigger>
                <SelectValue placeholder="Select half day type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="first_half">First Half (Morning)</SelectItem>
                <SelectItem value="second_half">Second Half (Afternoon)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Notes (especially for late check-ins) */}
        {(isLate || notes) && (
          <div className="space-y-2">
            <Label htmlFor="notes">
              {isLate ? "Reason for Late Check-In *" : "Notes (Optional)"}
            </Label>
            <Textarea
              id="notes"
              placeholder={isLate ? "Please provide a reason for late check-in..." : "Any additional notes..."}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        )}

        {/* Check-In Button */}
        <Button 
          onClick={handleCheckIn} 
          disabled={checkingIn || (isLate && !notes)}
          className="w-full"
          size="lg"
        >
          <Clock className="h-4 w-4 mr-2" />
          {checkingIn ? "Checking In..." : isHalfDay ? "Check In (Half Day)" : "Check In"}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          {format(new Date(), "EEEE, MMMM do, yyyy")}
        </p>
      </CardContent>
    </Card>
  );
}
