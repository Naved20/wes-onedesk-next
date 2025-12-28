import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { DollarSign, Calendar, Clock, Calculator, CheckCircle, Lock, AlertCircle, TrendingUp, TrendingDown, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface SalaryRecord {
  id: string;
  month: number;
  year: number;
  base_salary: number;
  working_days: number;
  present_days: number | null;
  absent_days: number | null;
  paid_leave_days: number | null;
  per_day_salary: number | null;
  hra_amount: number | null;
  travel_allowance: number | null;
  special_bonus: number | null;
  pf_deduction: number | null;
  tds_deduction: number | null;
  professional_tax: number | null;
  other_deductions: number | null;
  gross_salary: number | null;
  net_salary_calculated: number | null;
  net_salary_manual: number | null;
  final_salary: number | null;
  manager_proposed_salary: number | null;
  approval_status: string | null;
  is_locked: boolean | null;
  locked_at: string | null;
}

interface EmployeeSalaryViewProps {
  userId: string;
}

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export function EmployeeSalaryView({ userId }: EmployeeSalaryViewProps) {
  const [salary, setSalary] = useState<SalaryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const fetchSalary = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("salaries")
        .select("*")
        .eq("user_id", userId)
        .eq("month", selectedMonth)
        .eq("year", selectedYear)
        .eq("is_locked", true)
        .maybeSingle();

      if (error) throw error;
      setSalary(data);
    } catch (error) {
      console.error("Error fetching salary:", error);
      toast({
        title: "Error",
        description: "Failed to load salary data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [userId, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchSalary();
  }, [fetchSalary]);

  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return "₹0.00";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const hasManualOverride = salary?.net_salary_manual !== null && salary?.net_salary_manual !== undefined;
  const finalNetSalary = salary?.final_salary || salary?.net_salary_manual || salary?.net_salary_calculated || 0;
  const calculatedNetSalary = salary?.net_salary_calculated || 0;
  const difference = hasManualOverride ? finalNetSalary - calculatedNetSalary : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Month/Year Selector */}
      <div className="flex gap-4 flex-wrap">
        <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((m) => (
              <SelectItem key={m.value} value={String(m.value)}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026].map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!salary ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Salary Data Available</h3>
            <p className="text-muted-foreground mt-2">
              Salary for {months.find((m) => m.value === selectedMonth)?.label} {selectedYear} has not been processed yet.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              You can only view salaries that have been locked by the admin.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <CardTitle>Salary Summary</CardTitle>
                </div>
                <Badge className="bg-green-500">
                  <Lock className="h-3 w-3 mr-1" />
                  Finalized
                </Badge>
              </div>
              <CardDescription>
                {months.find((m) => m.value === salary.month)?.label} {salary.year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{formatCurrency(finalNetSalary)}</div>
              <p className="text-sm text-muted-foreground mt-1">Net Salary (Final)</p>

              {hasManualOverride && (
                <div className="mt-4 p-3 rounded-lg bg-accent/50 border border-accent">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Manager/Admin Override Applied</span>
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="text-muted-foreground">
                      Auto-calculated: <span className="line-through">{formatCurrency(calculatedNetSalary)}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      {difference > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                      <span className={difference > 0 ? "text-green-600" : "text-red-600"}>
                        {difference > 0 ? "+" : ""}
                        {formatCurrency(difference)}
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calculation Breakdown */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Attendance & Working Days */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Attendance Details</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Working Days</p>
                    <p className="text-2xl font-semibold">{salary.working_days}</p>
                    <p className="text-xs text-muted-foreground">Excl. Sundays & Holidays</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Present Days</p>
                    <p className="text-2xl font-semibold">{salary.present_days || 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Paid Leaves</p>
                    <p className="text-2xl font-semibold">{salary.paid_leave_days || 0}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm text-muted-foreground">Absent Days</p>
                    <p className="text-2xl font-semibold text-destructive">{salary.absent_days || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Salary Calculation Formula */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-muted-foreground" />
                  <CardTitle className="text-lg">Calculation Breakdown</CardTitle>
                </div>
                <CardDescription>How your salary is calculated</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Base Salary</span>
                  <span className="font-medium">{formatCurrency(salary.base_salary)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-muted/30 px-2 rounded">
                  <span className="text-muted-foreground">÷ Working Days</span>
                  <span className="font-medium">{salary.working_days}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-muted-foreground font-medium">Per Day Salary</span>
                  <span className="font-semibold text-primary">{formatCurrency(salary.per_day_salary)}</span>
                </div>
                <div className="flex justify-between items-center py-2 bg-muted/30 px-2 rounded">
                  <span className="text-muted-foreground">× (Present + Paid Leave)</span>
                  <span className="font-medium">{(salary.present_days || 0) + (salary.paid_leave_days || 0)} days</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-muted-foreground font-medium">Earned Basic</span>
                  <span className="font-semibold">
                    {formatCurrency((salary.per_day_salary || 0) * ((salary.present_days || 0) + (salary.paid_leave_days || 0)))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Earnings & Deductions */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Earnings */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <CardTitle className="text-lg">Earnings</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Basic Earned</span>
                  <div className="text-right">
                    <span className="font-medium">
                      {formatCurrency((salary.per_day_salary || 0) * ((salary.present_days || 0) + (salary.paid_leave_days || 0)))}
                    </span>
                    <Badge variant="outline" className="ml-2 text-xs">Auto</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">HRA (Housing)</span>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(salary.hra_amount)}</span>
                    <Badge variant="outline" className="ml-2 text-xs">Auto</Badge>
                  </div>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Travel Allowance</span>
                  <div className="text-right">
                    <span className="font-medium">{formatCurrency(salary.travel_allowance)}</span>
                    <Badge variant="outline" className="ml-2 text-xs">Fixed</Badge>
                  </div>
                </div>
                {(salary.special_bonus || 0) > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Special Bonus</span>
                    <div className="text-right">
                      <span className="font-medium text-green-600">{formatCurrency(salary.special_bonus)}</span>
                      <Badge className="ml-2 text-xs bg-green-500">Bonus</Badge>
                    </div>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center py-2 font-semibold">
                  <span>Gross Salary</span>
                  <span className="text-green-600">{formatCurrency(salary.gross_salary)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <CardTitle className="text-lg">Deductions</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Provident Fund (PF)</span>
                  <div className="text-right">
                    <span className="font-medium text-red-600">-{formatCurrency(salary.pf_deduction)}</span>
                    <Badge variant="outline" className="ml-2 text-xs">12%</Badge>
                  </div>
                </div>
                {(salary.tds_deduction || 0) > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">TDS (Tax)</span>
                    <div className="text-right">
                      <span className="font-medium text-red-600">-{formatCurrency(salary.tds_deduction)}</span>
                      <Badge variant="outline" className="ml-2 text-xs">Tax</Badge>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">Professional Tax</span>
                  <div className="text-right">
                    <span className="font-medium text-red-600">-{formatCurrency(salary.professional_tax)}</span>
                    <Badge variant="outline" className="ml-2 text-xs">Fixed</Badge>
                  </div>
                </div>
                {(salary.other_deductions || 0) > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Other Deductions</span>
                    <span className="font-medium text-red-600">-{formatCurrency(salary.other_deductions)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center py-2 font-semibold">
                  <span>Total Deductions</span>
                  <span className="text-red-600">
                    -{formatCurrency(
                      (salary.pf_deduction || 0) +
                        (salary.tds_deduction || 0) +
                        (salary.professional_tax || 0) +
                        (salary.other_deductions || 0)
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Final Summary */}
          <Card className="border-2 border-primary/30">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Gross Salary</p>
                  <p className="text-xl font-semibold">{formatCurrency(salary.gross_salary)}</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground mb-1">Total Deductions</p>
                  <p className="text-xl font-semibold text-red-600">
                    -{formatCurrency(
                      (salary.pf_deduction || 0) +
                        (salary.tds_deduction || 0) +
                        (salary.professional_tax || 0) +
                        (salary.other_deductions || 0)
                    )}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-muted-foreground mb-1">
                    Net Salary {hasManualOverride ? "(Override)" : "(Calculated)"}
                  </p>
                  <p className="text-2xl font-bold text-primary">{formatCurrency(finalNetSalary)}</p>
                  {hasManualOverride && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Auto: {formatCurrency(calculatedNetSalary)}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
