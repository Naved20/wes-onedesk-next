import { useRef } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Printer } from "lucide-react";

interface PayslipData {
  employee_name: string;
  employee_id?: string;
  designation?: string;
  department?: string;
  month: number;
  year: number;
  base_salary: number;
  working_days: number;
  present_days: number;
  paid_leave_days: number;
  per_day_salary: number;
  hra_amount: number;
  travel_allowance: number;
  special_bonus: number;
  pf_deduction: number;
  tds_deduction: number;
  professional_tax: number;
  other_deductions: number;
  gross_salary: number;
  net_salary: number;
}

interface PayslipGeneratorProps {
  data: PayslipData;
  companyName?: string;
  companyAddress?: string;
}

export function PayslipGenerator({ 
  data, 
  companyName = "World Education Services", 
  companyAddress = "India" 
}: PayslipGeneratorProps) {
  const payslipRef = useRef<HTMLDivElement>(null);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrint = () => {
    const content = payslipRef.current;
    if (!content) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${data.employee_name} - ${months[data.month - 1]} ${data.year}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .payslip { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; }
            .company-address { color: #666; }
            .title { font-size: 18px; font-weight: bold; margin: 20px 0; text-align: center; background: #f0f0f0; padding: 10px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
            .info-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px dashed #ddd; }
            .label { color: #666; }
            .value { font-weight: 500; }
            .section { margin: 20px 0; }
            .section-title { font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #333; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { background: #f5f5f5; }
            .amount { text-align: right; }
            .total-row { font-weight: bold; background: #f0f0f0; }
            .net-pay { font-size: 18px; text-align: center; margin-top: 20px; padding: 15px; background: #e8f5e9; border-radius: 8px; }
            .net-amount { font-size: 24px; font-weight: bold; color: #2e7d32; }
            .footer { text-align: center; margin-top: 40px; color: #666; font-size: 12px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          ${content.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPDF = () => {
    // For simplicity, we'll use print as PDF option
    handlePrint();
  };

  const totalEarnings = data.base_salary + data.hra_amount + data.travel_allowance + data.special_bonus;
  const totalDeductions = data.pf_deduction + data.tds_deduction + data.professional_tax + data.other_deductions;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Payslip Preview
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button size="sm" onClick={handleDownloadPDF}>
              <Download className="h-4 w-4 mr-1" />
              Download PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={payslipRef} className="payslip bg-background p-6 border rounded-lg">
          {/* Header */}
          <div className="header text-center mb-6">
            <h1 className="company-name text-2xl font-bold">{companyName}</h1>
            <p className="company-address text-muted-foreground">{companyAddress}</p>
          </div>

          <div className="title text-center font-bold text-lg bg-muted p-3 rounded">
            PAYSLIP FOR {months[data.month - 1].toUpperCase()} {data.year}
          </div>

          {/* Employee Info */}
          <div className="info-grid grid grid-cols-2 gap-4 my-6">
            <div className="space-y-2">
              <div className="info-item flex justify-between border-b border-dashed pb-1">
                <span className="label text-muted-foreground">Employee Name</span>
                <span className="value font-medium">{data.employee_name}</span>
              </div>
              {data.employee_id && (
                <div className="info-item flex justify-between border-b border-dashed pb-1">
                  <span className="label text-muted-foreground">Employee ID</span>
                  <span className="value font-medium">{data.employee_id}</span>
                </div>
              )}
              {data.designation && (
                <div className="info-item flex justify-between border-b border-dashed pb-1">
                  <span className="label text-muted-foreground">Designation</span>
                  <span className="value font-medium">{data.designation}</span>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <div className="info-item flex justify-between border-b border-dashed pb-1">
                <span className="label text-muted-foreground">Working Days</span>
                <span className="value font-medium">{data.working_days}</span>
              </div>
              <div className="info-item flex justify-between border-b border-dashed pb-1">
                <span className="label text-muted-foreground">Present Days</span>
                <span className="value font-medium">{data.present_days}</span>
              </div>
              <div className="info-item flex justify-between border-b border-dashed pb-1">
                <span className="label text-muted-foreground">Paid Leave Days</span>
                <span className="value font-medium">{data.paid_leave_days}</span>
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Earnings & Deductions */}
          <div className="grid grid-cols-2 gap-6">
            {/* Earnings */}
            <div className="section">
              <h3 className="section-title font-bold border-b-2 border-foreground pb-2 mb-4">EARNINGS</h3>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-2">Basic Salary</td>
                    <td className="amount text-right py-2">₹{data.base_salary.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2">HRA</td>
                    <td className="amount text-right py-2">₹{data.hra_amount.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2">Travel Allowance</td>
                    <td className="amount text-right py-2">₹{data.travel_allowance.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2">Special Bonus</td>
                    <td className="amount text-right py-2">₹{data.special_bonus.toLocaleString()}</td>
                  </tr>
                  <tr className="total-row font-bold bg-muted">
                    <td className="py-2">Total Earnings</td>
                    <td className="amount text-right py-2">₹{totalEarnings.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions */}
            <div className="section">
              <h3 className="section-title font-bold border-b-2 border-foreground pb-2 mb-4">DEDUCTIONS</h3>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="py-2">Provident Fund (PF)</td>
                    <td className="amount text-right py-2">₹{data.pf_deduction.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2">TDS</td>
                    <td className="amount text-right py-2">₹{data.tds_deduction.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2">Professional Tax</td>
                    <td className="amount text-right py-2">₹{data.professional_tax.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="py-2">Other Deductions</td>
                    <td className="amount text-right py-2">₹{data.other_deductions.toLocaleString()}</td>
                  </tr>
                  <tr className="total-row font-bold bg-muted">
                    <td className="py-2">Total Deductions</td>
                    <td className="amount text-right py-2">₹{totalDeductions.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Pay */}
          <div className="net-pay text-center mt-6 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
            <p className="text-muted-foreground mb-1">Net Payable Amount</p>
            <p className="net-amount text-3xl font-bold text-green-700 dark:text-green-300">
              ₹{data.net_salary.toLocaleString()}
            </p>
          </div>

          {/* Footer */}
          <div className="footer text-center mt-8 text-muted-foreground text-sm">
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p className="mt-1">Generated on: {format(new Date(), "dd MMMM yyyy, hh:mm a")}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
