import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import api from '@/lib/api';
import { CompanySettings, User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const Settings = () => {
  const { user: currentUser } = useAuth();
  const [settings, setSettings] = useState<CompanySettings>({
    id: 'settings_1',
    company_name: 'WorkZen',
    company_short_code: 'OI',
    working_days_per_week: 5,
    break_time_minutes: 60,
    standard_allowance: 4167,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  useEffect(() => {
    fetchSettings();
    fetchUsers();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/company_settings');
      if (response.data.length > 0) {
        setSettings(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      toast.success('User role updated successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleSave = async () => {
    try {
      // Update settings
      await api.put(`/company_settings/${settings.id}`, settings);
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
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
      <h1 className="text-2xl font-bold">Settings</h1>

      <Tabs defaultValue="company" className="w-full">
        <TabsList>
          <TabsTrigger value="company">Company Settings</TabsTrigger>
          {currentUser?.role === 'admin' && (
            <TabsTrigger value="users">User Settings</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="company" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={settings.company_name}
                    onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Company Short Code (for Login IDs)</Label>
                  <Input
                    value={settings.company_short_code}
                    onChange={(e) => setSettings({ ...settings, company_short_code: e.target.value })}
                    maxLength={4}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used in login ID generation (e.g., OI = organization initials)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <Input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Work Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Working Days Per Week</Label>
                  <Input
                    type="number"
                    min="1"
                    max="7"
                    value={settings.working_days_per_week}
                    onChange={(e) => setSettings({ ...settings, working_days_per_week: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Break Time (minutes)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.break_time_minutes}
                    onChange={(e) => setSettings({ ...settings, break_time_minutes: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Standard Allowance (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.standard_allowance}
                    onChange={(e) => setSettings({ ...settings, standard_allowance: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Fixed allowance amount included in salary calculation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Salary Calculation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><strong>Basic:</strong> 50% of monthly wage</p>
                <p><strong>HRA:</strong> 50% of basic</p>
                <p><strong>Standard Allowance:</strong> ₹{settings.standard_allowance.toLocaleString('en-IN')} (configurable above)</p>
                <p><strong>Performance Bonus:</strong> 8.33% of basic</p>
                <p><strong>LTA:</strong> 8.33% of basic</p>
                <p><strong>Fixed Allowance:</strong> Wage minus sum of above earnings</p>
                <p><strong>PF Employee:</strong> 12% of basic</p>
                <p><strong>PF Employer:</strong> 12% of basic</p>
                <p><strong>Professional Tax:</strong> ₹200/month</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="bg-primary hover:bg-primary-dark">
              Save Settings
            </Button>
          </div>
        </TabsContent>

        {currentUser?.role === 'admin' && (
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Settings</CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Assign user access rights based on each user's role. Access rights define what modules users can access.
                </p>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User Name</TableHead>
                      <TableHead>Login ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.first_name} {user.last_name}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{user.login_id}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => handleRoleChange(user.id, newRole)}
                            disabled={user.id === currentUser?.id}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="employee">Employee</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="hr">HR Officer</SelectItem>
                              <SelectItem value="payroll">Payroll Officer</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Role-Based Access Rights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Employee</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>✓ View own profile</li>
                        <li>✓ Check-in/Check-out attendance</li>
                        <li>✓ Request time-off</li>
                        <li>✓ View own payslips</li>
                        <li>✓ Change password</li>
                        <li>✗ Cannot access employee management</li>
                        <li>✗ Cannot approve time-off</li>
                        <li>✗ Cannot generate payroll</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Admin</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>✓ Full system access</li>
                        <li>✓ Manage employees</li>
                        <li>✓ View all attendance</li>
                        <li>✓ Approve/reject time-off</li>
                        <li>✓ Generate payroll</li>
                        <li>✓ View reports</li>
                        <li>✓ Configure settings</li>
                        <li>✓ Manage user roles</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">HR Officer</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>✓ Manage employees</li>
                        <li>✓ View all attendance</li>
                        <li>✓ Approve/reject time-off</li>
                        <li>✓ View payslips</li>
                        <li>✓ View reports</li>
                        <li>✗ Cannot generate payroll</li>
                        <li>✗ Cannot configure settings</li>
                        <li>✗ Cannot manage user roles</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Payroll Officer</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>✓ View employees</li>
                        <li>✓ View all attendance</li>
                        <li>✓ Approve/reject time-off</li>
                        <li>✓ Generate payroll</li>
                        <li>✓ View payslips</li>
                        <li>✓ View reports</li>
                        <li>✗ Cannot manage employees</li>
                        <li>✗ Cannot configure settings</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default Settings;
