import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, Check, X, Eye, Paperclip } from 'lucide-react';
import api from '@/lib/api';
import { TimeOff as TimeOffType, LeaveType, LeaveStatus, Employee } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';

const TimeOff = () => {
  const { user } = useAuth();
  const [timeOffs, setTimeOffs] = useState<TimeOffType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [leaveBalance, setLeaveBalance] = useState({ paid: 24, sick: 7 });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedTimeOff, setSelectedTimeOff] = useState<TimeOffType | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'paid' as LeaveType,
    start_date: '',
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    fetchEmployees();
    if (user?.role === 'employee') {
      fetchEmployeeId();
    } else {
      fetchAllTimeOffs();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return 'Unknown';
    return `${employee.first_name} ${employee.last_name}`;
  };

  const fetchEmployeeId = async () => {
    try {
      // Get all employees and filter by user_id
      const response = await api.get('/employees');
      const employees = response.data;
      const employeeRecord = employees.find((emp: any) => emp.user_id === user?.id);
      
      if (employeeRecord) {
        const empId = employeeRecord.id;
        setEmployeeId(empId);
        fetchTimeOffs(empId);
        fetchLeaveBalance(empId);
      } else {
        // No employee record found, show error
        toast.error('Employee record not found. Please contact your administrator.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching employee ID:', error);
      toast.error('Error loading employee data');
      setIsLoading(false);
    }
  };

  const fetchTimeOffs = async (empId: string) => {
    try {
      const response = await api.get('/time_offs', {
        params: { employee_id: empId, _sort: 'created_at', _order: 'desc' },
      });
      setTimeOffs(response.data);
    } catch (error) {
      console.error('Error fetching time offs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllTimeOffs = async () => {
    try {
      const response = await api.get('/time_offs', {
        params: { _sort: 'created_at', _order: 'desc' },
      });
      setTimeOffs(response.data);
    } catch (error) {
      console.error('Error fetching time offs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaveBalance = async (empId: string) => {
    try {
      const response = await api.get('/leave_balances', {
        params: { employee_id: empId },
      });
      if (response.data.length > 0) {
        const balance = response.data[0];
        setLeaveBalance({
          paid: balance.paid_days_remaining,
          sick: balance.sick_days_remaining,
        });
      }
    } catch (error) {
      console.error('Error fetching leave balance:', error);
    }
  };

  const calculateDays = (start: string, end: string): number => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeId) {
      toast.error('Employee ID not found. Please contact administrator.');
      return;
    }

    if (!formData.start_date || !formData.end_date || !formData.reason) {
      toast.error('Please fill in all fields');
      return;
    }

    const days = calculateDays(formData.start_date, formData.end_date);

    try {
      const newTimeOff = {
        id: `to_${Date.now()}`,
        employee_id: employeeId,
        type: formData.type,
        start_date: formData.start_date,
        end_date: formData.end_date,
        days,
        reason: formData.reason,
        status: 'pending' as LeaveStatus,
        created_at: new Date().toISOString(),
      };

      await api.post('/time_offs', newTimeOff);
      toast.success('Time off request submitted successfully!');
      setIsDialogOpen(false);
      setFormData({ type: 'paid', start_date: '', end_date: '', reason: '' });
      fetchTimeOffs(employeeId);
    } catch (error) {
      console.error('Error submitting time off:', error);
      toast.error('Failed to submit time off request');
    }
  };

  const handleApprove = async (timeOffId: string) => {
    try {
      const timeOff = timeOffs.find(t => t.id === timeOffId);
      
      await api.patch(`/time_offs/${timeOffId}`, {
        status: 'approved',
        approved_by: user?.id,
      });
      
      // Send email notification
      if (timeOff) {
        const employeeResponse = await api.get(`/employees/${timeOff.employee_id}`);
        const employee = employeeResponse.data;
        
        const emailData = {
          to: employee.email,
          subject: '✅ Leave Request Approved - WorkZen HRMS',
          body: `
Dear ${employee.first_name},

Great news! Your leave request has been APPROVED.

Leave Details:
- Type: ${timeOff.type.toUpperCase()} Leave
- Start Date: ${format(new Date(timeOff.start_date), 'MMM dd, yyyy')}
- End Date: ${format(new Date(timeOff.end_date), 'MMM dd, yyyy')}
- Duration: ${timeOff.days} days

Enjoy your time off!

Best regards,
WorkZen HRMS Team
          `.trim(),
          timestamp: new Date().toISOString(),
        };
        
        console.log('📧 ===== LEAVE APPROVED EMAIL ===== 📧');
        console.log('To:', emailData.to);
        console.log('Subject:', emailData.subject);
        console.log('Employee:', employee.first_name, employee.last_name);
        console.log('=================================');
        localStorage.setItem(`mock_email_${Date.now()}`, JSON.stringify(emailData));
      }
      
      toast.success('✅ Leave approved! Employee notified via email.');
      console.log('📧 Email sent! Check "Mock Emails" button to view.');
      if (user?.role === 'employee') {
        fetchTimeOffs(employeeId);
      } else {
        fetchAllTimeOffs();
      }
    } catch (error) {
      toast.error('Failed to approve time off');
    }
  };

  const handleReject = async (timeOffId: string) => {
    try {
      const timeOff = timeOffs.find(t => t.id === timeOffId);
      
      await api.patch(`/time_offs/${timeOffId}`, {
        status: 'rejected',
        approved_by: user?.id,
      });
      
      // Send email notification
      if (timeOff) {
        const employeeResponse = await api.get(`/employees/${timeOff.employee_id}`);
        const employee = employeeResponse.data;
        
        const emailData = {
          to: employee.email,
          subject: '❌ Leave Request Rejected - WorkZen HRMS',
          body: `
Dear ${employee.first_name},

We regret to inform you that your leave request has been REJECTED.

Leave Details:
- Type: ${timeOff.type.toUpperCase()} Leave
- Start Date: ${format(new Date(timeOff.start_date), 'MMM dd, yyyy')}
- End Date: ${format(new Date(timeOff.end_date), 'MMM dd, yyyy')}
- Duration: ${timeOff.days} days

Please contact HR if you have any questions or need clarification.

Best regards,
WorkZen HRMS Team
          `.trim(),
          timestamp: new Date().toISOString(),
        };
        
        console.log('📧 ===== LEAVE REJECTED EMAIL ===== 📧');
        console.log('To:', emailData.to);
        console.log('Subject:', emailData.subject);
        console.log('Employee:', employee.first_name, employee.last_name);
        console.log('==================================');
        localStorage.setItem(`mock_email_${Date.now()}`, JSON.stringify(emailData));
      }
      
      toast.success('❌ Leave rejected. Employee notified via email.');
      console.log('📧 Email sent! Check "Mock Emails" button to view.');
      if (user?.role === 'employee') {
        fetchTimeOffs(employeeId);
      } else {
        fetchAllTimeOffs();
      }
    } catch (error) {
      toast.error('Failed to reject time off');
    }
  };

  const getStatusBadge = (status: LeaveStatus) => {
    const variants: Record<LeaveStatus, any> = {
      pending: 'secondary',
      approved: 'default',
      rejected: 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
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
        <h1 className="text-2xl font-bold">Time Off</h1>
        {user?.role === 'employee' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary-dark">
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Time Off Type Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Input value={user?.first_name + ' ' + user?.last_name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Time off Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as LeaveType })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid time off</SelectItem>
                      <SelectItem value="sick">Sick time off</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leaves</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Validity Period</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                      required
                    />
                    <Input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Allocation</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={formData.start_date && formData.end_date ? calculateDays(formData.start_date, formData.end_date) : 0}
                      disabled
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">Days</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Note</Label>
                  <Textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Enter reason for time off"
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Attachment</Label>
                  <div className="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm">
                      <Paperclip className="w-4 h-4 mr-2" />
                      Attach File
                    </Button>
                    <span className="text-xs text-muted-foreground">(For sick leave certificate)</span>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Discard
                  </Button>
                  <Button type="submit">Submit</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {user?.role === 'employee' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Paid Time Off</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{leaveBalance.paid} Days Available</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sick time off</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{leaveBalance.sick} Days Available</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Time Off Records</CardTitle>
        </CardHeader>
        <CardContent>
          {(user?.role === 'admin' || user?.role === 'hr') ? (
            <Tabs defaultValue="paid" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="paid">Paid time Off</TabsTrigger>
                <TabsTrigger value="sick">Sick time off</TabsTrigger>
              </TabsList>
              
              <TabsContent value="paid">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Time off Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeOffs.filter(t => t.type === 'paid').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          24 Days Available
                        </TableCell>
                      </TableRow>
                    ) : (
                      timeOffs.filter(t => t.type === 'paid').map((timeOff) => (
                        <TableRow key={timeOff.id}>
                          <TableCell className="font-medium">{getEmployeeName(timeOff.employee_id)}</TableCell>
                          <TableCell>{format(new Date(timeOff.start_date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{format(new Date(timeOff.end_date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {timeOff.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(timeOff.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {timeOff.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleApprove(timeOff.id)}
                                    className="bg-success hover:bg-success/90 h-8 w-8 p-0"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(timeOff.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
              
              <TabsContent value="sick">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Time off Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeOffs.filter(t => t.type === 'sick').length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                          07 Days Available
                        </TableCell>
                      </TableRow>
                    ) : (
                      timeOffs.filter(t => t.type === 'sick').map((timeOff) => (
                        <TableRow key={timeOff.id}>
                          <TableCell className="font-medium">{getEmployeeName(timeOff.employee_id)}</TableCell>
                          <TableCell>{format(new Date(timeOff.start_date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>{format(new Date(timeOff.end_date), 'dd/MM/yyyy')}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {timeOff.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(timeOff.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {timeOff.status === 'pending' && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => handleApprove(timeOff.id)}
                                    className="bg-success hover:bg-success/90 h-8 w-8 p-0"
                                  >
                                    <Check className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(timeOff.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Time off Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeOffs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No time off requests yet
                    </TableCell>
                  </TableRow>
                ) : (
                  timeOffs.map((timeOff) => (
                    <TableRow key={timeOff.id}>
                      <TableCell className="font-medium">{user?.first_name} {user?.last_name}</TableCell>
                      <TableCell>{format(new Date(timeOff.start_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>{format(new Date(timeOff.end_date), 'dd/MM/yyyy')}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {timeOff.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(timeOff.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeOff;
