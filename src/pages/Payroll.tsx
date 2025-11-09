import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Printer, Eye } from 'lucide-react';
import api from '@/lib/api';
import { Payslip, Employee } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { calculateSalary, calculateSalaryWithAttendance, calculatePayableDays, formatCurrency } from '@/utils/salary';
import { format, startOfMonth, endOfMonth } from 'date-fns';

const Payroll = () => {
  const { user } = useAuth();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [payrunData, setPayrunData] = useState({
    month: '',
    year: new Date().getFullYear(),
  });

  useEffect(() => {
    fetchPayslips();
    fetchEmployees();
  }, []);

  const fetchPayslips = async () => {
    try {
      const response = await api.get('/payslips', {
        params: { _sort: 'created_at', _order: 'desc' },
      });
      setPayslips(response.data);
    } catch (error) {
      console.error('Error fetching payslips:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleCreatePayrun = async () => {
    if (!payrunData.month) {
      toast.error('Please select a month');
      return;
    }

    try {
      const activeEmployees = employees.filter(emp => emp.status === 'active');
      let totalAmount = 0;
      
      // Calculate month date range
      const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].indexOf(payrunData.month);
      const monthStart = new Date(payrunData.year, monthIndex, 1);
      const monthEnd = endOfMonth(monthStart);
      const monthStartStr = format(monthStart, 'yyyy-MM-dd');
      const monthEndStr = format(monthEnd, 'yyyy-MM-dd');
      const totalWorkingDays = 30; // Standard working days in a month

      // Get all attendance and time-off records for the month
      const attendanceResponse = await api.get('/attendance');
      const allAttendance = attendanceResponse.data;
      
      const timeOffResponse = await api.get('/time_offs');
      const allTimeOffs = timeOffResponse.data;

      for (const employee of activeEmployees) {
        // Calculate attendance for this employee
        const employeeAttendance = allAttendance.filter((a: any) => 
          a.employee_id === employee.id && 
          a.date >= monthStartStr && 
          a.date <= monthEndStr &&
          a.status === 'present'
        );
        
        // Calculate approved paid leaves for this employee
        const employeeLeaves = allTimeOffs.filter((t: any) => 
          t.employee_id === employee.id &&
          t.status === 'approved' &&
          (t.leave_type === 'paid' || t.leave_type === 'sick') &&
          t.start_date >= monthStartStr &&
          t.start_date <= monthEndStr
        );
        
        const attendanceDays = employeeAttendance.length;
        const paidLeaveDays = employeeLeaves.reduce((sum: number, leave: any) => {
          // Calculate leave duration
          const start = new Date(leave.start_date);
          const end = new Date(leave.end_date);
          const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          return sum + days;
        }, 0);
        
        // Calculate payable days
        const payableDays = calculatePayableDays(attendanceDays, paidLeaveDays, totalWorkingDays);
        
        // Calculate salary based on payable days
        const salaryBreakdown = calculateSalaryWithAttendance(
          employee.monthly_wage,
          payableDays,
          totalWorkingDays
        );
        
        const payslip = {
          id: `ps_${Date.now()}_${employee.id}`,
          employee_id: employee.id,
          month: payrunData.month,
          year: payrunData.year,
          ...salaryBreakdown,
          payable_days: payableDays,
          attendance_days: attendanceDays,
          paid_leave_days: paidLeaveDays,
          total_working_days: totalWorkingDays,
          created_at: new Date().toISOString(),
        };

        await api.post('/payslips', payslip);
        totalAmount += salaryBreakdown.net_salary;
      }

      // Create payrun record
      const payrun = {
        id: `pr_${Date.now()}`,
        month: payrunData.month,
        year: payrunData.year,
        created_by: user?.id,
        created_at: new Date().toISOString(),
        total_employees: activeEmployees.length,
        total_amount: totalAmount,
      };

      await api.post('/payruns', payrun);
      
      toast.success(`Payrun created for ${activeEmployees.length} employees based on attendance!`, {
        description: `Total payable amount: ${formatCurrency(totalAmount)}`
      });
      setIsDialogOpen(false);
      fetchPayslips();
    } catch (error) {
      console.error('Error creating payrun:', error);
      toast.error('Failed to create payrun');
    }
  };

  const handlePrint = (payslip: Payslip) => {
    // Create print content
    const employee = employees.find(e => e.id === payslip.employee_id);
    const printWindow = window.open('', '_blank');
    
    if (!printWindow || !employee) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${employee.first_name} ${employee.last_name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-weight: bold; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>WorkZen HRMS</h1>
            <h2>Payslip</h2>
            <p>${payslip.month} ${payslip.year}</p>
          </div>
          <div class="section">
            <h3>Employee Details</h3>
            <p><strong>Name:</strong> ${employee.first_name} ${employee.last_name}</p>
            <p><strong>Email:</strong> ${employee.email}</p>
            <p><strong>Position:</strong> ${employee.position || 'N/A'}</p>
          </div>
          <div class="section">
            <h3>Earnings</h3>
            <table>
              <tr><td>Basic Salary</td><td>${formatCurrency(payslip.basic)}</td></tr>
              <tr><td>HRA</td><td>${formatCurrency(payslip.hra)}</td></tr>
              <tr><td>Standard Allowance</td><td>${formatCurrency(payslip.standard_allowance)}</td></tr>
              <tr><td>Performance Bonus</td><td>${formatCurrency(payslip.performance_bonus)}</td></tr>
              <tr><td>LTA</td><td>${formatCurrency(payslip.lta)}</td></tr>
              <tr><td>Fixed Allowance</td><td>${formatCurrency(payslip.fixed_allowance)}</td></tr>
              <tr class="total"><td>Gross Earnings</td><td>${formatCurrency(payslip.gross_earnings)}</td></tr>
            </table>
          </div>
          <div class="section">
            <h3>Deductions</h3>
            <table>
              <tr><td>PF Employee (12%)</td><td>${formatCurrency(payslip.pf_employee)}</td></tr>
              <tr><td>Professional Tax</td><td>${formatCurrency(payslip.professional_tax)}</td></tr>
              <tr class="total"><td>Total Deductions</td><td>${formatCurrency(payslip.total_deductions)}</td></tr>
            </table>
          </div>
          <div class="section">
            <h3>Net Salary</h3>
            <p class="total">${formatCurrency(payslip.net_salary)}</p>
          </div>
          <div class="section">
            <p><em>Note: PF Employer contribution (12%): ${formatCurrency(payslip.pf_employer)}</em></p>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payroll</h1>
        {(user?.role === 'admin' || user?.role === 'payroll') && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-dark">
                <Plus className="w-4 h-4 mr-2" />
                Create Payrun
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Payrun</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={payrunData.month} onValueChange={(value) => setPayrunData({ ...payrunData, month: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select value={payrunData.year.toString()} onValueChange={(value) => setPayrunData({ ...payrunData, year: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[2023, 2024, 2025].map((year) => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg text-sm space-y-1">
                  <p className="font-semibold">Attendance-Based Payroll:</p>
                  <ul className="text-xs space-y-1 text-muted-foreground">
                    <li>✓ Salary calculated based on actual attendance</li>
                    <li>✓ Paid leaves counted as working days</li>
                    <li>✓ Unpaid leaves and absences reduce salary</li>
                    <li>✓ Pro-rata calculation for partial month work</li>
                  </ul>
                </div>
                <Button onClick={handleCreatePayrun} className="w-full">
                  Generate Attendance-Based Payslips
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payslips</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.map((payslip) => {
                const employee = employees.find(e => e.id === payslip.employee_id);
                return (
                  <TableRow key={payslip.id}>
                    <TableCell>
                      {employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown'}
                    </TableCell>
                    <TableCell>{payslip.month}</TableCell>
                    <TableCell>{payslip.year}</TableCell>
                    <TableCell>{formatCurrency(payslip.gross_earnings)}</TableCell>
                    <TableCell>{formatCurrency(payslip.total_deductions)}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="font-bold">
                        {formatCurrency(payslip.net_salary)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPayslip(payslip)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrint(payslip)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Payslip Detail Dialog */}
      <Dialog open={!!selectedPayslip} onOpenChange={() => setSelectedPayslip(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payslip Details</DialogTitle>
          </DialogHeader>
          {selectedPayslip && (
            <div className="space-y-4">
              {/* Attendance Summary */}
              {selectedPayslip.payable_days !== undefined && (
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Attendance Summary</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Attendance Days:</span>
                      <span className="font-medium">{selectedPayslip.attendance_days || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Paid Leave Days:</span>
                      <span className="font-medium">{selectedPayslip.paid_leave_days || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payable Days:</span>
                      <span className="font-medium text-success">{selectedPayslip.payable_days}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Working Days:</span>
                      <span className="font-medium">{selectedPayslip.total_working_days || 30}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div>
                <h3 className="font-semibold mb-2">Earnings</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>Basic Salary:</span><span>{formatCurrency(selectedPayslip.basic)}</span></div>
                  <div className="flex justify-between"><span>HRA:</span><span>{formatCurrency(selectedPayslip.hra)}</span></div>
                  <div className="flex justify-between"><span>Standard Allowance:</span><span>{formatCurrency(selectedPayslip.standard_allowance)}</span></div>
                  <div className="flex justify-between"><span>Performance Bonus:</span><span>{formatCurrency(selectedPayslip.performance_bonus)}</span></div>
                  <div className="flex justify-between"><span>LTA:</span><span>{formatCurrency(selectedPayslip.lta)}</span></div>
                  <div className="flex justify-between"><span>Fixed Allowance:</span><span>{formatCurrency(selectedPayslip.fixed_allowance)}</span></div>
                  <div className="flex justify-between font-bold border-t pt-1">
                    <span>Gross Earnings:</span><span>{formatCurrency(selectedPayslip.gross_earnings)}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Deductions</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between"><span>PF Employee (12%):</span><span>{formatCurrency(selectedPayslip.pf_employee)}</span></div>
                  <div className="flex justify-between"><span>Professional Tax:</span><span>{formatCurrency(selectedPayslip.professional_tax)}</span></div>
                  <div className="flex justify-between font-bold border-t pt-1">
                    <span>Total Deductions:</span><span>{formatCurrency(selectedPayslip.total_deductions)}</span>
                  </div>
                </div>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Net Salary:</span>
                  <span className="text-2xl font-bold text-primary">{formatCurrency(selectedPayslip.net_salary)}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                * Employer PF contribution: {formatCurrency(selectedPayslip.pf_employer)}
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payroll;
