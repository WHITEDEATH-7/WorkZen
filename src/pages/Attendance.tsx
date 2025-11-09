import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LogIn, LogOut as LogOutIcon, Calendar, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import api from '@/lib/api';
import { Attendance as AttendanceType } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addDays, subDays } from 'date-fns';
import { calculateWorkHours, calculateExtraHours } from '@/utils/salary';

const Attendance = () => {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceType[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<AttendanceType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthStats, setMonthStats] = useState({ present: 0, absent: 0, totalDays: 0 });
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    fetchEmployees();
    if (user?.role === 'employee') {
      fetchEmployeeId();
    } else {
      fetchAllAttendance();
    }
  }, [user, currentMonth, currentDate]);

  const fetchEmployeeId = async () => {
    try {
      // Get all employees and filter by user_id
      const response = await api.get('/employees');
      const employees = response.data;
      const employeeRecord = employees.find((emp: any) => emp.user_id === user?.id);
      
      if (employeeRecord) {
        const empId = employeeRecord.id;
        setEmployeeId(empId);
        fetchAttendance(empId);
      } else {
        toast.error('Employee record not found. Please contact administrator.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching employee ID:', error);
      toast.error('Error loading employee data');
      setIsLoading(false);
    }
  };

  const fetchAttendance = async (empId: string) => {
    try {
      // Get all attendance for this employee
      const response = await api.get('/attendance');
      const allAttendance = response.data;
      const employeeAttendance = allAttendance.filter((a: AttendanceType) => a.employee_id === empId);
      
      // Filter for current month
      const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
      const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
      const monthRecords = employeeAttendance.filter((a: AttendanceType) => 
        a.date >= monthStart && a.date <= monthEnd
      );
      
      // Sort by date descending
      monthRecords.sort((a, b) => b.date.localeCompare(a.date));
      setAttendanceRecords(monthRecords);
      
      // Calculate stats
      const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
      }).length;
      const presentDays = monthRecords.filter(r => r.status === 'present').length;
      setMonthStats({
        present: presentDays,
        absent: daysInMonth - presentDays,
        totalDays: daysInMonth
      });

      // Check today's attendance
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayRecord = employeeAttendance.find((a: AttendanceType) => a.date === today);
      setTodayAttendance(todayRecord || null);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllAttendance = async () => {
    try {
      // For admins: show selected date's attendance for all employees
      const selectedDate = format(currentDate, 'yyyy-MM-dd');
      
      // Get all employees
      const employeesResponse = await api.get('/employees');
      const allEmployees = employeesResponse.data;
      
      // Get attendance records for selected date
      const response = await api.get('/attendance');
      const allAttendance = response.data;
      const dateAttendance = allAttendance.filter((a: AttendanceType) => a.date === selectedDate);
      
      // Create attendance records for all employees
      const employeeAttendanceMap = new Map();
      dateAttendance.forEach((att: AttendanceType) => {
        employeeAttendanceMap.set(att.employee_id, att);
      });
      
      // Build complete list: show all active employees
      const completeRecords: AttendanceType[] = [];
      allEmployees.forEach((emp: any) => {
        if (emp.status === 'active') {
          const existingAttendance = employeeAttendanceMap.get(emp.id);
          if (existingAttendance) {
            completeRecords.push(existingAttendance);
          } else {
            // Employee hasn't checked in - show as absent
            completeRecords.push({
              id: `pending_${emp.id}`,
              employee_id: emp.id,
              date: selectedDate,
              status: 'absent',
            } as AttendanceType);
          }
        }
      });
      
      // Sort by employee name
      completeRecords.sort((a, b) => {
        const empA = getEmployeeName(a.employee_id);
        const empB = getEmployeeName(b.employee_id);
        return empA.localeCompare(empB);
      });
      
      setAttendanceRecords(completeRecords);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const now = new Date().toISOString();

      const newAttendance = {
        id: `att_${Date.now()}`,
        employee_id: employeeId,
        date: today,
        check_in: now,
        status: 'present',
      };

      await api.post('/attendance', newAttendance);
      toast.success('Checked in successfully!');
      fetchAttendance(employeeId);
    } catch (error) {
      toast.error('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance) return;

    try {
      const now = new Date().toISOString();
      const workHours = calculateWorkHours(todayAttendance.check_in!, now);
      const extraHours = calculateExtraHours(workHours);

      const updatedAttendance = {
        ...todayAttendance,
        check_out: now,
        work_hours: workHours,
        extra_hours: extraHours,
      };

      await api.patch(`/attendance/${todayAttendance.id}`, updatedAttendance);
      toast.success('Checked out successfully!');
      fetchAttendance(employeeId);
    } catch (error) {
      toast.error('Failed to check out');
    }
  };

  const getEmployeeName = (employeeId: string): string => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return 'Unknown';
    return `${employee.first_name} ${employee.last_name}`;
  };

  const handlePreviousDate = () => {
    setCurrentDate(subDays(currentDate, 1));
  };

  const handleNextDate = () => {
    setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (!searchQuery) return true;
    const employeeName = getEmployeeName(record.employee_id).toLowerCase();
    return employeeName.includes(searchQuery.toLowerCase());
  });

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
        <h1 className="text-2xl font-bold">Attendance</h1>
        {(user?.role === 'admin' || user?.role === 'hr') && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={handlePreviousDate}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-2 border rounded-md min-w-[150px] text-center">
                {format(currentDate, 'dd MMMM yyyy')}
              </div>
              <Button variant="outline" size="icon" onClick={handleNextDate}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {user?.role === 'employee' && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Today's Attendance</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              {!todayAttendance && (
                <Button onClick={handleCheckIn} className="bg-success hover:bg-success/90">
                  <LogIn className="w-4 h-4 mr-2" />
                  Check In
                </Button>
              )}
              {todayAttendance && !todayAttendance.check_out && (
                <>
                  <Badge variant="outline" className="text-success border-success">
                    Checked In: {format(new Date(todayAttendance.check_in!), 'HH:mm:ss')}
                  </Badge>
                  <Button onClick={handleCheckOut} variant="destructive">
                    <LogOutIcon className="w-4 h-4 mr-2" />
                    Check Out
                  </Button>
                </>
              )}
              {todayAttendance && todayAttendance.check_out && (
                <div className="flex gap-4">
                  <Badge variant="outline">
                    In: {format(new Date(todayAttendance.check_in!), 'HH:mm')}
                  </Badge>
                  <Badge variant="outline">
                    Out: {format(new Date(todayAttendance.check_out), 'HH:mm')}
                  </Badge>
                  <Badge variant="outline" className="text-success border-success">
                    Hours: {todayAttendance.work_hours?.toFixed(2)}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {format(currentMonth, 'MMMM yyyy')} - Attendance Summary
              </CardTitle>
              <CardDescription>
                Your attendance record for the ongoing month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-success/10 rounded-lg">
                  <div className="text-2xl font-bold text-success">{monthStats.present}</div>
                  <div className="text-sm text-muted-foreground">Present Days</div>
                </div>
                <div className="text-center p-4 bg-destructive/10 rounded-lg">
                  <div className="text-2xl font-bold text-destructive">{monthStats.absent}</div>
                  <div className="text-sm text-muted-foreground">Absent Days</div>
                </div>
                <div className="text-center p-4 bg-primary/10 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{monthStats.totalDays}</div>
                  <div className="text-sm text-muted-foreground">Total Days</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>
                {user?.role === 'employee' 
                  ? `${format(currentMonth, 'MMMM yyyy')} - Day-wise Attendance`
                  : `Attendance List - ${format(currentDate, 'dd MMMM yyyy')}`
                }
              </CardTitle>
              <CardDescription>
                {user?.role === 'employee'
                  ? 'Your daily attendance records with working hours and breaks'
                  : 'All employees attendance for the selected day'
                }
              </CardDescription>
            </div>
            {(user?.role === 'admin' || user?.role === 'hr') && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by employee name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {(user?.role === 'admin' || user?.role === 'hr') && <TableHead>Employee</TableHead>}
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Work Hours</TableHead>
                <TableHead>Extra Hours</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.role === 'employee' ? 6 : 7} className="text-center text-muted-foreground py-8">
                    {searchQuery ? 'No employees found matching your search' : 'No attendance records found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    {(user?.role === 'admin' || user?.role === 'hr') && (
                      <TableCell className="font-medium">{getEmployeeName(record.employee_id)}</TableCell>
                    )}
                    <TableCell>{format(new Date(record.date), 'dd MMM yyyy')}</TableCell>
                    <TableCell className="font-mono">
                      {record.check_in ? format(new Date(record.check_in), 'HH:mm') : '-'}
                    </TableCell>
                    <TableCell className="font-mono">
                      {record.check_out ? format(new Date(record.check_out), 'HH:mm') : (
                        record.check_in ? <Badge variant="outline" className="text-orange-500">In Progress</Badge> : '-'
                      )}
                    </TableCell>
                    <TableCell className="font-mono">
                      {record.work_hours ? `${record.work_hours.toFixed(2)}h` : '-'}
                    </TableCell>
                    <TableCell className="font-mono">
                      {record.extra_hours && record.extra_hours > 0 ? (
                        <Badge variant="outline" className="text-success border-success font-mono">
                          +{record.extra_hours.toFixed(2)}h
                        </Badge>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={record.status === 'present' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
