import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, AlertCircle, Briefcase, Calendar } from 'lucide-react';
import api from '@/lib/api';
import { DashboardStats } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [employeesRes, timeOffRes, payrunsRes] = await Promise.all([
        api.get('/employees'),
        api.get('/time_offs'),
        api.get('/payruns'),
      ]);

      const employees = employeesRes.data;
      const timeOffs = timeOffRes.data;
      const payruns = payrunsRes.data;

      const activeEmployees = employees.filter((e: any) => e.status === 'active').length;
      const onLeave = employees.filter((e: any) => e.status === 'on_leave').length;
      const withoutBank = employees.filter((e: any) => !e.bank_account_number).length;
      const withoutManager = employees.filter((e: any) => !e.manager_id).length;

      const stats: DashboardStats = {
        total_employees: employees.length,
        active_employees: activeEmployees,
        on_leave: onLeave,
        employees_without_bank: withoutBank,
        employees_without_manager: withoutManager,
        payruns_this_year: payruns.length,
        attendance_today: {
          present: activeEmployees,
          absent: 0,
          on_leave: onLeave,
        },
      };

      setStats(stats);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const chartData = [
    { month: 'Jan', payruns: 1 },
    { month: 'Feb', payruns: 1 },
    { month: 'Mar', payruns: 1 },
    { month: 'Apr', payruns: 1 },
    { month: 'May', payruns: 1 },
    { month: 'Jun', payruns: 1 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_employees}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.active_employees} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">On Leave Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.on_leave}</div>
            <p className="text-xs text-muted-foreground">
              employees on leave
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payruns This Year</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.payruns_this_year}</div>
            <p className="text-xs text-muted-foreground">
              completed payruns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.attendance_today.present}</div>
            <p className="text-xs text-muted-foreground">
              present today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Warning Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats && stats.employees_without_bank > 0 && (
          <Card className="border-warning">
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <CardTitle className="text-sm">Missing Bank Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{stats.employees_without_bank}</p>
              <p className="text-xs text-muted-foreground">
                employee(s) without bank account details
              </p>
            </CardContent>
          </Card>
        )}

        {stats && stats.employees_without_manager > 0 && (
          <Card className="border-warning">
            <CardHeader className="flex flex-row items-center gap-2">
              <AlertCircle className="h-5 w-5 text-warning" />
              <CardTitle className="text-sm">Missing Manager Assignment</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-warning">{stats.employees_without_manager}</p>
              <p className="text-xs text-muted-foreground">
                employee(s) without assigned manager
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payruns Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Payruns</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="payruns" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
