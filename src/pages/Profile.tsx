import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Mail, Phone, Calendar, Briefcase, MapPin, DollarSign, KeyRound } from 'lucide-react';
import api from '@/lib/api';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchEmployeeData();
  }, [user]);

  const fetchEmployeeData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Fetch employee details
      const response = await api.get('/employees');
      const employees = response.data;
      const employeeRecord = employees.find((emp: any) => emp.user_id === user.id);
      
      if (employeeRecord) {
        setEmployeeData(employeeRecord);
      }
    } catch (error) {
      console.error('Error fetching employee data:', error);
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

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : 'NA';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => navigate('/change-password', { state: { from: 'profile' } })}
            className="gap-2"
          >
            <KeyRound className="h-4 w-4" />
            Change Password
          </Button>
          <Badge variant="secondary" className="capitalize">{user?.role}</Badge>
        </div>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">
                {user?.first_name} {user?.last_name}
              </h2>
              <p className="text-muted-foreground">{employeeData?.position || 'Employee'}</p>
              <p className="text-sm text-muted-foreground">{employeeData?.department || 'No department'}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{user?.email}</span>
                </div>
                {employeeData?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{employeeData.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Resume</TabsTrigger>
          <TabsTrigger value="private">Private Info</TabsTrigger>
          <TabsTrigger value="salary">Salary Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
        </TabsList>

        {/* Resume Tab */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Resume / Basic Information</CardTitle>
              <CardDescription>Your basic employee details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Job Position</label>
                  <p className="text-sm">{employeeData?.position || 'Not assigned'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-sm">{employeeData?.department || 'Not assigned'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Manager</label>
                  <p className="text-sm">{employeeData?.manager || 'Not assigned'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Coach</label>
                  <p className="text-sm">{employeeData?.coach || 'Not assigned'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Mobile</label>
                  <p className="text-sm">{employeeData?.phone || user?.phone || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Company</label>
                  <p className="text-sm">{user?.company_name || 'WorkZen'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Private Info Tab */}
        <TabsContent value="private">
          <Card>
            <CardHeader>
              <CardTitle>Private Information</CardTitle>
              <CardDescription>Personal and residential details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                  <p className="text-sm">{employeeData?.date_of_birth || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Gender</label>
                  <p className="text-sm capitalize">{employeeData?.gender || 'Not provided'}</p>
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Residing Address</label>
                  <p className="text-sm">{employeeData?.address || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Nationality</label>
                  <p className="text-sm">{employeeData?.nationality || employeeData?.country || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Personal Email</label>
                  <p className="text-sm">{employeeData?.personal_email || user?.email || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Marital Status</label>
                  <p className="text-sm capitalize">{employeeData?.marital_status || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Date of Joining</label>
                  <p className="text-sm">{employeeData?.hire_date || 'Not provided'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Employment Information Tab */}
        <TabsContent value="employment">
          <Card>
            <CardHeader>
              <CardTitle>Employment Information</CardTitle>
              <CardDescription>View your employment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Position
                  </label>
                  <p className="text-sm">{employeeData?.position || 'Not assigned'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Department</label>
                  <p className="text-sm">{employeeData?.department || 'Not assigned'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Hire Date
                  </label>
                  <p className="text-sm">{employeeData?.hire_date || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                  <p className="text-sm font-mono">{employeeData?.id || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">User Role</label>
                  <Badge variant="outline" className="capitalize">{user?.role}</Badge>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Account Created</label>
                  <p className="text-sm">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Salary Information Tab */}
        <TabsContent value="salary">
          <Card>
            <CardHeader>
              <CardTitle>Salary Information</CardTitle>
              <CardDescription>View your salary details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Monthly Wage
                  </label>
                  <p className="text-lg font-semibold">
                    {employeeData?.monthly_wage 
                      ? `₹${employeeData.monthly_wage.toLocaleString('en-IN')}` 
                      : 'Not set'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Annual Salary</label>
                  <p className="text-lg font-semibold">
                    {employeeData?.monthly_wage 
                      ? `₹${(employeeData.monthly_wage * 12).toLocaleString('en-IN')}` 
                      : 'Not set'}
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 For detailed salary breakdown and payslips, please contact your HR department or check the Payroll section (if you have access).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab - Bank Details */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Bank Details</CardTitle>
              <CardDescription>Your banking information for salary transfers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Account Number</label>
                  <p className="text-sm font-mono">{employeeData?.bank_account_number || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Bank Name</label>
                  <p className="text-sm">{employeeData?.bank_name || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">IFSC Code</label>
                  <p className="text-sm font-mono">{employeeData?.bank_ifsc_code || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">PAN No</label>
                  <p className="text-sm font-mono">{employeeData?.pan_number || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">UAN NO</label>
                  <p className="text-sm font-mono">{employeeData?.uan_number || 'Not provided'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">Emp Code</label>
                  <p className="text-sm font-mono">{user?.login_id || 'Not provided'}</p>
                </div>
              </div>
              {(!employeeData?.bank_account_number || !employeeData?.bank_name) && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                    ⚠️ Bank Details Missing
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                    Please contact your HR department to update your bank account details for salary transfers.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Info Notice */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <p className="font-medium">Read-Only Profile</p>
              <p className="text-sm text-muted-foreground mt-1">
                This is a read-only view of your profile. To update your information, please contact your HR department or system administrator.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
