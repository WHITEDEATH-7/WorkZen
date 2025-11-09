import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Circle, Plane, Clock, Pencil, Save, X, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { Employee } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { generateLoginId, generatePassword, hashPassword, sendCredentialsEmail } from '@/utils/auth';

const Employees = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Employee>>({});
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    hire_date: new Date().toISOString().split('T')[0],
    monthly_wage: 0,
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = async () => {
    // Trim all inputs
    const trimmedData = {
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      department: formData.department.trim(),
      position: formData.position.trim(),
      hire_date: formData.hire_date,
      monthly_wage: formData.monthly_wage,
    };

    if (!trimmedData.first_name || !trimmedData.last_name || !trimmedData.email) {
      toast.error('Please fill in all required fields (Name and Email)');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      // Get current year
      const year = new Date().getFullYear();
      
      // Get all users to determine next serial
      const usersResponse = await api.get('/users');
      const users = usersResponse.data;
      
      // Check if email already exists (case-insensitive)
      const emailExists = users.some((u: any) => 
        u.email && u.email.toLowerCase() === trimmedData.email
      );
      if (emailExists) {
        toast.error('Email already registered');
        return;
      }
      
      // Find max serial for this year
      const currentYearUsers = users.filter((u: any) => 
        u.login_id && u.login_id.includes(year.toString())
      );
      const maxSerial = currentYearUsers.length > 0 
        ? Math.max(...currentYearUsers.map((u: any) => {
            const match = u.login_id.match(/\d{4}$/);
            return match ? parseInt(match[0]) : 0;
          }))
        : 0;
      
      const serial = maxSerial + 1;
      
      // Generate login ID and password
      const loginId = generateLoginId(trimmedData.first_name, trimmedData.last_name, year, serial);
      const password = generatePassword();
      const passwordHash = hashPassword(password);
      
      // Create user object
      const newUser = {
        id: `user_${Date.now()}`,
        login_id: loginId,
        email: trimmedData.email,
        first_name: trimmedData.first_name,
        last_name: trimmedData.last_name,
        role: 'employee',
        phone: trimmedData.phone,
        password_hash: passwordHash,
        force_password_change: true,
        created_at: new Date().toISOString(),
      };
      
      // Save user
      await api.post('/users', newUser);
      
      // Create employee record
      const newEmployee = {
        id: `emp_${Date.now()}`,
        user_id: newUser.id,
        first_name: trimmedData.first_name,
        last_name: trimmedData.last_name,
        email: trimmedData.email,
        phone: trimmedData.phone,
        date_of_birth: '',
        gender: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'India',
        hire_date: trimmedData.hire_date,
        department: trimmedData.department,
        position: trimmedData.position,
        monthly_wage: trimmedData.monthly_wage,
        status: 'active',
      };
      
      await api.post('/employees', newEmployee);
      
      // Send credentials email (async now)
      await sendCredentialsEmail(trimmedData.email, loginId, password, trimmedData.first_name);
      
      // Show success with email confirmation
      toast.success(
        'Employee added successfully!',
        {
          description: `📧 Credentials sent to ${trimmedData.email}\nLogin ID: ${loginId} | Password: ${password}`,
          duration: 15000,
        }
      );
      
      console.log('👤 New Employee Created:');
      console.log('Name:', `${trimmedData.first_name} ${trimmedData.last_name}`);
      console.log('Email:', trimmedData.email);
      console.log('Login ID:', loginId);
      console.log('Password:', password);
      console.log('📧 Check "Mock Emails" button to view the email!');
      setIsAddDialogOpen(false);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        hire_date: new Date().toISOString().split('T')[0],
        monthly_wage: 0,
      });
      fetchEmployees();
    } catch (error: any) {
      console.error('Error adding employee:', error);
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to add employee';
      toast.error(errorMsg);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Circle className="w-4 h-4 text-success fill-success" />;
      case 'on_leave':
        return <Plane className="w-4 h-4 text-info" />;
      default:
        return <Clock className="w-4 h-4 text-warning" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'on_leave':
        return 'On Leave';
      default:
        return 'Inactive';
    }
  };

  const handleEditClick = () => {
    if (selectedEmployee) {
      setEditFormData({ ...selectedEmployee });
      setIsEditMode(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditFormData({});
  };

  const handleSaveEdit = async () => {
    if (!selectedEmployee || !editFormData) return;

    try {
      // Update employee data
      await api.patch(`/employees/${selectedEmployee.id}`, editFormData);
      
      toast.success('Employee updated successfully!');
      setIsEditMode(false);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    }
  };

  const handleEditFieldChange = (field: string, value: any) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDeleteClick = (employee: Employee) => {
    setEmployeeToDelete(employee);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!employeeToDelete) return;

    try {
      // Delete employee record
      await api.delete(`/employees/${employeeToDelete.id}`);
      
      // Delete associated user account
      if (employeeToDelete.user_id) {
        await api.delete(`/users/${employeeToDelete.user_id}`);
      }
      
      // Delete associated attendance records
      const attendanceResponse = await api.get('/attendance', {
        params: { employee_id: employeeToDelete.id }
      });
      for (const record of attendanceResponse.data) {
        await api.delete(`/attendance/${record.id}`);
      }
      
      // Delete associated time-off records
      const timeOffResponse = await api.get('/time_offs', {
        params: { employee_id: employeeToDelete.id }
      });
      for (const record of timeOffResponse.data) {
        await api.delete(`/time_offs/${record.id}`);
      }
      
      // Delete associated leave balance
      const leaveBalanceResponse = await api.get('/leave_balances', {
        params: { employee_id: employeeToDelete.id }
      });
      for (const record of leaveBalanceResponse.data) {
        await api.delete(`/leave_balances/${record.id}`);
      }
      
      // Delete associated payslips
      const payslipsResponse = await api.get('/payslips', {
        params: { employee_id: employeeToDelete.id }
      });
      for (const record of payslipsResponse.data) {
        await api.delete(`/payslips/${record.id}`);
      }
      
      toast.success(`Employee ${employeeToDelete.first_name} ${employeeToDelete.last_name} deleted successfully!`);
      setDeleteConfirmOpen(false);
      setEmployeeToDelete(null);
      setSelectedEmployee(null);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Employees</h1>
        {(user?.role === 'admin' || user?.role === 'hr') && (
          <Button 
            className="bg-primary hover:bg-primary-dark"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {employees.map((employee) => {
          // Safe handling of employee data
          const firstName = employee.first_name || 'N';
          const lastName = employee.last_name || 'A';
          const initials = `${firstName[0]}${lastName[0]}`.toUpperCase();
          
          return (
            <Card
              key={employee.id}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedEmployee(employee)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {firstName} {lastName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">{employee.position || 'No position'}</p>
                    <p className="text-xs text-muted-foreground truncate">{employee.department || 'No department'}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(employee.status)}
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {employee.email || 'No email'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Employee Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name *</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="space-y-2">
                <Label>Last Name *</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Enter department"
                />
              </div>
              <div className="space-y-2">
                <Label>Position</Label>
                <Input
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Enter position"
                />
              </div>
              <div className="space-y-2">
                <Label>Hire Date</Label>
                <Input
                  type="date"
                  value={formData.hire_date}
                  onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Monthly Wage (₹)</Label>
                <Input
                  type="number"
                  value={formData.monthly_wage}
                  onChange={(e) => setFormData({ ...formData, monthly_wage: parseInt(e.target.value) || 0 })}
                  placeholder="Enter monthly wage"
                />
              </div>
            </div>
            <div className="bg-muted p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">Note:</p>
              <p>Login credentials will be auto-generated and displayed after creation. The employee will be required to change their password on first login.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddEmployee}>
                Add Employee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Employee Detail Modal */}
      <Dialog open={!!selectedEmployee} onOpenChange={() => {
        setSelectedEmployee(null);
        setIsEditMode(false);
        setEditFormData({});
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>
                {selectedEmployee?.first_name} {selectedEmployee?.last_name}
              </DialogTitle>
              <div className="flex gap-2">
                {!isEditMode ? (
                  <>
                    <Button size="sm" variant="outline" onClick={handleEditClick}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => selectedEmployee && handleDeleteClick(selectedEmployee)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogHeader>
          
          {selectedEmployee && (
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="personal">Resume</TabsTrigger>
                <TabsTrigger value="private">Private Info</TabsTrigger>
                <TabsTrigger value="salary">Salary Info</TabsTrigger>
                <TabsTrigger value="bank">Security</TabsTrigger>
                <TabsTrigger value="employment">Employment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Job Position</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.position || ''}
                        onChange={(e) => handleEditFieldChange('position', e.target.value)}
                        placeholder="Enter position"
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedEmployee.position || 'Not assigned'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.department || ''}
                        onChange={(e) => handleEditFieldChange('department', e.target.value)}
                        placeholder="Enter department"
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedEmployee.department || 'Not assigned'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Manager</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.manager || ''}
                        onChange={(e) => handleEditFieldChange('manager', e.target.value)}
                        placeholder="Enter manager name"
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedEmployee.manager || 'Not assigned'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Coach</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.coach || ''}
                        onChange={(e) => handleEditFieldChange('coach', e.target.value)}
                        placeholder="Enter coach name"
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedEmployee.coach || 'Not assigned'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Mobile</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.phone || ''}
                        onChange={(e) => handleEditFieldChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedEmployee.phone || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                    <p className="text-sm mt-1">{selectedEmployee.email}</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="private" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                    {isEditMode ? (
                      <Input
                        type="date"
                        value={editFormData.date_of_birth || ''}
                        onChange={(e) => handleEditFieldChange('date_of_birth', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedEmployee.date_of_birth || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                    {isEditMode ? (
                      <Select
                        value={editFormData.gender || ''}
                        onValueChange={(value) => handleEditFieldChange('gender', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm mt-1 capitalize">{selectedEmployee.gender || 'Not specified'}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <Label className="text-sm font-medium text-muted-foreground">Residing Address</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.address || ''}
                        onChange={(e) => handleEditFieldChange('address', e.target.value)}
                        placeholder="Enter full address"
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedEmployee.address || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.nationality || ''}
                        onChange={(e) => handleEditFieldChange('nationality', e.target.value)}
                        placeholder="Enter nationality"
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedEmployee.nationality || selectedEmployee.country || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Personal Email</Label>
                    {isEditMode ? (
                      <Input
                        type="email"
                        value={editFormData.personal_email || ''}
                        onChange={(e) => handleEditFieldChange('personal_email', e.target.value)}
                        placeholder="Enter personal email"
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedEmployee.personal_email || selectedEmployee.email}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Marital Status</Label>
                    {isEditMode ? (
                      <Select
                        value={editFormData.marital_status || ''}
                        onValueChange={(value) => handleEditFieldChange('marital_status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm mt-1 capitalize">{selectedEmployee.marital_status || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Date of Joining</Label>
                    {isEditMode ? (
                      <Input
                        type="date"
                        value={editFormData.hire_date || ''}
                        onChange={(e) => handleEditFieldChange('hire_date', e.target.value)}
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedEmployee.hire_date || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="bank" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Account Number</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.bank_account_number || ''}
                        onChange={(e) => handleEditFieldChange('bank_account_number', e.target.value)}
                        placeholder="Enter account number"
                      />
                    ) : (
                      <p className="text-sm font-mono mt-1">{selectedEmployee.bank_account_number || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Bank Name</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.bank_name || ''}
                        onChange={(e) => handleEditFieldChange('bank_name', e.target.value)}
                        placeholder="Enter bank name"
                      />
                    ) : (
                      <p className="text-sm mt-1">{selectedEmployee.bank_name || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">IFSC Code</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.bank_ifsc_code || editFormData.bank_ifsc || ''}
                        onChange={(e) => {
                          handleEditFieldChange('bank_ifsc_code', e.target.value);
                          handleEditFieldChange('bank_ifsc', e.target.value);
                        }}
                        placeholder="Enter IFSC code"
                      />
                    ) : (
                      <p className="text-sm font-mono mt-1">{selectedEmployee.bank_ifsc_code || selectedEmployee.bank_ifsc || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">PAN No</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.pan_number || ''}
                        onChange={(e) => handleEditFieldChange('pan_number', e.target.value.toUpperCase())}
                        placeholder="Enter PAN number"
                      />
                    ) : (
                      <p className="text-sm font-mono mt-1">{selectedEmployee.pan_number || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">UAN NO</Label>
                    {isEditMode ? (
                      <Input
                        value={editFormData.uan_number || ''}
                        onChange={(e) => handleEditFieldChange('uan_number', e.target.value)}
                        placeholder="Enter UAN number"
                      />
                    ) : (
                      <p className="text-sm font-mono mt-1">{selectedEmployee.uan_number || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Emp Code</Label>
                    <p className="text-sm font-mono mt-1">{selectedEmployee.id}</p>
                  </div>
                </div>
              </TabsContent>

              {/* Employment Tab */}
              <TabsContent value="employment" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Position</Label>
                    <p className="text-sm mt-1">{selectedEmployee.position || 'Not assigned'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Department</Label>
                    <p className="text-sm mt-1">{selectedEmployee.department || 'Not assigned'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Hire Date</Label>
                    <p className="text-sm mt-1">{selectedEmployee.hire_date || 'Not provided'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Employee ID</Label>
                    <p className="text-sm font-mono mt-1">{selectedEmployee.id}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    {isEditMode ? (
                      <Select
                        value={editFormData.status || selectedEmployee.status}
                        onValueChange={(value) => handleEditFieldChange('status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="on_leave">On Leave</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusIcon(selectedEmployee.status)}
                        <span className="text-sm">{getStatusLabel(selectedEmployee.status)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="salary" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Monthly Wage</Label>
                    {isEditMode ? (
                      <Input
                        type="number"
                        value={editFormData.monthly_wage || 0}
                        onChange={(e) => handleEditFieldChange('monthly_wage', parseFloat(e.target.value) || 0)}
                        placeholder="Enter monthly wage"
                      />
                    ) : (
                      <p className="text-sm font-bold mt-1">₹{selectedEmployee.monthly_wage?.toLocaleString('en-IN') || '0'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Annual Salary</Label>
                    <p className="text-sm font-bold mt-1">
                      ₹{(((isEditMode ? editFormData.monthly_wage : selectedEmployee.monthly_wage) || 0) * 12).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Delete Employee</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete employee <span className="font-semibold text-foreground">{employeeToDelete?.first_name} {employeeToDelete?.last_name}</span>?
            </p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-medium">⚠️ Warning: This action cannot be undone!</p>
              <p className="text-xs text-destructive/80 mt-1">
                This will permanently delete:
              </p>
              <ul className="text-xs text-destructive/80 mt-1 ml-4 list-disc">
                <li>Employee profile and personal information</li>
                <li>User account and login credentials</li>
                <li>All attendance records</li>
                <li>All time-off requests</li>
                <li>Leave balances</li>
                <li>All payslips</li>
              </ul>
            </div>
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setEmployeeToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleConfirmDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Employee
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Employees;
