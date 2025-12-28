import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { DollarSign, Lock, Unlock, FileText, Download, CheckCircle, Clock, AlertCircle, Calculator } from "lucide-react";

interface Employee {
  user_id: string;
  first_name: string;
  last_name: string;
  base_salary: number | null;
  institution_assignment: string | null;
}

interface SalaryRecord {
  id: string;
  user_id: string;
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
  manager_justification: string | null;
  approval_status: string | null;
  is_locked: boolean | null;
  locked_at: string | null;
  created_at: string;
  employee_name?: string;
}

interface SalaryManagementProps {
  userId: string;
  isAdmin: boolean;
  isManager: boolean;
}

export function SalaryManagement({ userId, isAdmin, isManager }: SalaryManagementProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState<SalaryRecord | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    base_salary: 0,
    working_days: 0,
    present_days: 0,
    paid_leave_days: 0,
    hra_amount: 0,
    travel_allowance: 0,
    special_bonus: 0,
    pf_deduction: 0,
    tds_deduction: 0,
    professional_tax: 0,
    other_deductions: 0,
    net_salary_manual: null as number | null,
    manager_justification: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch employees
      const { data: empData } = await supabase
        .from("employee_profiles")
        .select("user_id, first_name, last_name, base_salary, institution_assignment")
        .eq("is_active", true);

      setEmployees(empData || []);

      // Fetch salary records for selected month/year
      const { data: salaryData, error } = await supabase
        .from("salaries")
        .select("*")
        .eq("month", selectedMonth)
        .eq("year", selectedYear)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map employee names to salary records
      const recordsWithNames = (salaryData || []).map(record => {
        const emp = empData?.find(e => e.user_id === record.user_id);
        return {
          ...record,
          employee_name: emp ? `${emp.first_name} ${emp.last_name}` : "Unknown",
        };
      });

      setSalaryRecords(recordsWithNames);
    } catch (error) {
      console.error("Error fetching salary data:", error);
      toast({
        title: "Error",
        description: "Failed to load salary data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const calculateSalary = () => {
    const perDaySalary = formData.working_days > 0 ? formData.base_salary / formData.working_days : 0;
    const effectiveDays = formData.present_days + formData.paid_leave_days;
    const basicEarned = perDaySalary * effectiveDays;
    const grossSalary = basicEarned + formData.hra_amount + formData.travel_allowance + formData.special_bonus;
    const totalDeductions = formData.pf_deduction + formData.tds_deduction + formData.professional_tax + formData.other_deductions;
    const netSalary = grossSalary - totalDeductions;

    return {
      per_day_salary: Math.round(perDaySalary * 100) / 100,
      gross_salary: Math.round(grossSalary * 100) / 100,
      net_salary_calculated: Math.round(netSalary * 100) / 100,
    };
  };

  const openEditDialog = (salary: SalaryRecord) => {
    setSelectedSalary(salary);
    setFormData({
      base_salary: salary.base_salary || 0,
      working_days: salary.working_days || 0,
      present_days: salary.present_days || 0,
      paid_leave_days: salary.paid_leave_days || 0,
      hra_amount: salary.hra_amount || 0,
      travel_allowance: salary.travel_allowance || 0,
      special_bonus: salary.special_bonus || 0,
      pf_deduction: salary.pf_deduction || 0,
      tds_deduction: salary.tds_deduction || 0,
      professional_tax: salary.professional_tax || 0,
      other_deductions: salary.other_deductions || 0,
      net_salary_manual: salary.net_salary_manual,
      manager_justification: salary.manager_justification || "",
    });
    setEditDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedSalary) return;

    setIsSubmitting(true);
    try {
      const calculated = calculateSalary();

      const updateData: Record<string, unknown> = {
        base_salary: formData.base_salary,
        working_days: formData.working_days,
        present_days: formData.present_days,
        paid_leave_days: formData.paid_leave_days,
        per_day_salary: calculated.per_day_salary,
        hra_amount: formData.hra_amount,
        travel_allowance: formData.travel_allowance,
        special_bonus: formData.special_bonus,
        pf_deduction: formData.pf_deduction,
        tds_deduction: formData.tds_deduction,
        professional_tax: formData.professional_tax,
        other_deductions: formData.other_deductions,
        gross_salary: calculated.gross_salary,
        net_salary_calculated: calculated.net_salary_calculated,
        net_salary_manual: formData.net_salary_manual,
        final_salary: formData.net_salary_manual || calculated.net_salary_calculated,
        updated_at: new Date().toISOString(),
      };

      // If manager is proposing salary
      if (isManager && !isAdmin && formData.net_salary_manual) {
        updateData.manager_proposed_salary = formData.net_salary_manual;
        updateData.manager_proposed_by = userId;
        updateData.manager_proposed_at = new Date().toISOString();
        updateData.manager_justification = formData.manager_justification;
        updateData.approval_status = "pending_approval";
      }

      const { error } = await supabase
        .from("salaries")
        .update(updateData)
        .eq("id", selectedSalary.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Salary record updated successfully",
      });
      setEditDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error("Error updating salary:", error);
      toast({
        title: "Error",
        description: "Failed to update salary record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (salaryId: string) => {
    try {
      const { error } = await supabase
        .from("salaries")
        .update({
          approval_status: "approved",
          approved_by: userId,
          approved_at: new Date().toISOString(),
        })
        .eq("id", salaryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Salary approved successfully",
      });
      fetchData();
    } catch (error) {
      console.error("Error approving salary:", error);
      toast({
        title: "Error",
        description: "Failed to approve salary",
        variant: "destructive",
      });
    }
  };

  const handleLock = async (salaryId: string) => {
    try {
      const { error } = await supabase
        .from("salaries")
        .update({
          is_locked: true,
          locked_by: userId,
          locked_at: new Date().toISOString(),
          processed_at: new Date().toISOString(),
        })
        .eq("id", salaryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Salary locked successfully",
      });
      fetchData();
    } catch (error) {
      console.error("Error locking salary:", error);
      toast({
        title: "Error",
        description: "Failed to lock salary",
        variant: "destructive",
      });
    }
  };

  const handleUnlock = async (salaryId: string) => {
    try {
      const { error } = await supabase
        .from("salaries")
        .update({
          is_locked: false,
          locked_by: null,
          locked_at: null,
        })
        .eq("id", salaryId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Salary unlocked successfully",
      });
      fetchData();
    } catch (error) {
      console.error("Error unlocking salary:", error);
      toast({
        title: "Error",
        description: "Failed to unlock salary",
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ["Employee", "Month", "Year", "Base Salary", "Working Days", "Present Days", "Gross Salary", "Net Salary", "Status"];
    const rows = salaryRecords.map(s => [
      s.employee_name,
      s.month,
      s.year,
      s.base_salary,
      s.working_days,
      s.present_days,
      s.gross_salary,
      s.final_salary || s.net_salary_calculated,
      s.is_locked ? "Locked" : s.approval_status,
    ]);

    const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `salaries-${selectedMonth}-${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Salary data exported to CSV",
    });
  };

  const calculated = calculateSalary();
  const pendingApprovals = salaryRecords.filter(s => s.approval_status === "pending_approval" && !s.is_locked);

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

  const getStatusBadge = (salary: SalaryRecord) => {
    if (salary.is_locked) {
      return <Badge className="bg-green-500"><Lock className="h-3 w-3 mr-1" />Locked</Badge>;
    }
    switch (salary.approval_status) {
      case "approved":
        return <Badge className="bg-blue-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case "pending_approval":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Approval</Badge>;
      default:
        return <Badge variant="outline"><AlertCircle className="h-3 w-3 mr-1" />Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex gap-4">
          <Select value={String(selectedMonth)} onValueChange={(v) => setSelectedMonth(Number(v))}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(selectedYear)} onValueChange={(v) => setSelectedYear(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Salaries</TabsTrigger>
          {isAdmin && pendingApprovals.length > 0 && (
            <TabsTrigger value="pending" className="relative">
              Pending Approval
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-yellow-500 text-white">
                {pendingApprovals.length}
              </span>
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Salary Records - {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </CardTitle>
              <CardDescription>
                View and manage employee salaries for the selected period
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : salaryRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                  <p>No salary records for this period</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">Base Salary</TableHead>
                        <TableHead className="text-right">Working Days</TableHead>
                        <TableHead className="text-right">Present</TableHead>
                        <TableHead className="text-right">Gross</TableHead>
                        <TableHead className="text-right">Net Salary</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salaryRecords.map((salary) => (
                        <TableRow key={salary.id}>
                          <TableCell className="font-medium">{salary.employee_name}</TableCell>
                          <TableCell className="text-right">₹{salary.base_salary?.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{salary.working_days}</TableCell>
                          <TableCell className="text-right">{salary.present_days || 0}</TableCell>
                          <TableCell className="text-right">₹{salary.gross_salary?.toLocaleString() || "-"}</TableCell>
                          <TableCell className="text-right font-semibold">
                            ₹{(salary.final_salary || salary.net_salary_calculated || 0).toLocaleString()}
                            {salary.net_salary_manual && salary.net_salary_manual !== salary.net_salary_calculated && (
                              <span className="text-xs text-muted-foreground ml-1">(manual)</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(salary)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {!salary.is_locked && (
                                <Button size="sm" variant="outline" onClick={() => openEditDialog(salary)}>
                                  <Calculator className="h-4 w-4" />
                                </Button>
                              )}
                              {isAdmin && !salary.is_locked && salary.approval_status === "pending_approval" && (
                                <Button size="sm" onClick={() => handleApprove(salary.id)} className="bg-green-600 hover:bg-green-700">
                                  Approve
                                </Button>
                              )}
                              {isAdmin && salary.approval_status === "approved" && !salary.is_locked && (
                                <Button size="sm" onClick={() => handleLock(salary.id)}>
                                  <Lock className="h-4 w-4 mr-1" />
                                  Lock
                                </Button>
                              )}
                              {isAdmin && salary.is_locked && (
                                <Button size="sm" variant="outline" onClick={() => handleUnlock(salary.id)}>
                                  <Unlock className="h-4 w-4 mr-1" />
                                  Unlock
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && pendingApprovals.length > 0 && (
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Pending Salary Approvals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead className="text-right">Calculated Net</TableHead>
                      <TableHead className="text-right">Proposed Net</TableHead>
                      <TableHead>Justification</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingApprovals.map((salary) => (
                      <TableRow key={salary.id}>
                        <TableCell className="font-medium">{salary.employee_name}</TableCell>
                        <TableCell className="text-right">₹{salary.net_salary_calculated?.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">
                          ₹{salary.manager_proposed_salary?.toLocaleString()}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">{salary.manager_justification}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" onClick={() => handleApprove(salary.id)} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Edit Salary Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Edit Salary - {selectedSalary?.employee_name}
            </DialogTitle>
            <DialogDescription>
              {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            {/* Earnings Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm border-b pb-2">Earnings</h4>
              <div className="space-y-3">
                <div>
                  <Label>Base Salary</Label>
                  <Input
                    type="number"
                    value={formData.base_salary}
                    onChange={(e) => setFormData(p => ({ ...p, base_salary: Number(e.target.value) }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Working Days</Label>
                    <Input
                      type="number"
                      value={formData.working_days}
                      onChange={(e) => setFormData(p => ({ ...p, working_days: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label>Present Days</Label>
                    <Input
                      type="number"
                      value={formData.present_days}
                      onChange={(e) => setFormData(p => ({ ...p, present_days: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div>
                  <Label>Paid Leave Days</Label>
                  <Input
                    type="number"
                    value={formData.paid_leave_days}
                    onChange={(e) => setFormData(p => ({ ...p, paid_leave_days: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>HRA Amount</Label>
                  <Input
                    type="number"
                    value={formData.hra_amount}
                    onChange={(e) => setFormData(p => ({ ...p, hra_amount: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Travel Allowance</Label>
                  <Input
                    type="number"
                    value={formData.travel_allowance}
                    onChange={(e) => setFormData(p => ({ ...p, travel_allowance: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Special Bonus</Label>
                  <Input
                    type="number"
                    value={formData.special_bonus}
                    onChange={(e) => setFormData(p => ({ ...p, special_bonus: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            {/* Deductions Section */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm border-b pb-2">Deductions</h4>
              <div className="space-y-3">
                <div>
                  <Label>PF Deduction (12%)</Label>
                  <Input
                    type="number"
                    value={formData.pf_deduction}
                    onChange={(e) => setFormData(p => ({ ...p, pf_deduction: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>TDS Deduction</Label>
                  <Input
                    type="number"
                    value={formData.tds_deduction}
                    onChange={(e) => setFormData(p => ({ ...p, tds_deduction: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Professional Tax</Label>
                  <Input
                    type="number"
                    value={formData.professional_tax}
                    onChange={(e) => setFormData(p => ({ ...p, professional_tax: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Other Deductions</Label>
                  <Input
                    type="number"
                    value={formData.other_deductions}
                    onChange={(e) => setFormData(p => ({ ...p, other_deductions: Number(e.target.value) }))}
                  />
                </div>
              </div>

              {/* Summary */}
              <div className="mt-4 p-4 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Per Day Salary:</span>
                  <span className="font-medium">₹{calculated.per_day_salary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Gross Salary:</span>
                  <span className="font-medium">₹{calculated.gross_salary.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>Calculated Net:</span>
                  <span className="text-green-600">₹{calculated.net_salary_calculated.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Net Salary Override */}
          <div className="border-t pt-4 space-y-4">
            <div>
              <Label>Manual Net Salary Override (Optional)</Label>
              <Input
                type="number"
                placeholder="Leave empty to use calculated value"
                value={formData.net_salary_manual || ""}
                onChange={(e) => setFormData(p => ({ ...p, net_salary_manual: e.target.value ? Number(e.target.value) : null }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Enter a value to override the calculated net salary
              </p>
            </div>

            {isManager && !isAdmin && formData.net_salary_manual && (
              <div>
                <Label>Justification (Required for manager proposals)</Label>
                <Textarea
                  placeholder="Explain why you're proposing this salary amount..."
                  value={formData.manager_justification}
                  onChange={(e) => setFormData(p => ({ ...p, manager_justification: e.target.value }))}
                  rows={3}
                />
              </div>
            )}

            {formData.net_salary_manual && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Calculated vs Manual Difference:</span>
                  <span className={`font-semibold ${
                    formData.net_salary_manual > calculated.net_salary_calculated 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    {formData.net_salary_manual > calculated.net_salary_calculated ? "+" : ""}
                    ₹{(formData.net_salary_manual - calculated.net_salary_calculated).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSubmitting}>
              {isManager && !isAdmin && formData.net_salary_manual ? "Submit for Approval" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
