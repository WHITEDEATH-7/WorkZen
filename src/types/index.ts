export type UserRole = 'admin' | 'hr' | 'payroll' | 'employee';

export type LeaveType = 'paid' | 'sick' | 'unpaid';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  login_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  company_name?: string;
  company_logo?: string;
  password_hash: string;
  force_password_change: boolean;
  created_at: string;
}

export interface Employee {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  nationality?: string;
  personal_email?: string;
  marital_status?: string;
  hire_date: string;
  department: string;
  position: string;
  manager?: string;
  coach?: string;
  manager_id?: string;
  bank_account_number?: string;
  bank_name?: string;
  bank_ifsc_code?: string;
  bank_ifsc?: string;
  pan_number?: string;
  uan_number?: string;
  monthly_wage: number;
  avatar_url?: string;
  status: 'active' | 'on_leave' | 'inactive';
}

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in?: string;
  check_out?: string;
  work_hours?: number;
  extra_hours?: number;
  status: 'present' | 'absent' | 'leave';
}

export interface TimeOff {
  id: string;
  employee_id: string;
  type: LeaveType;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: LeaveStatus;
  approved_by?: string;
  created_at: string;
}

export interface LeaveBalance {
  employee_id: string;
  paid_days_remaining: number;
  sick_days_remaining: number;
}

export interface Payslip {
  id: string;
  employee_id: string;
  month: string;
  year: number;
  basic: number;
  hra: number;
  standard_allowance: number;
  performance_bonus: number;
  lta: number;
  fixed_allowance: number;
  gross_earnings: number;
  pf_employee: number;
  pf_employer: number;
  professional_tax: number;
  total_deductions: number;
  net_salary: number;
  payable_days?: number;
  attendance_days?: number;
  paid_leave_days?: number;
  total_working_days?: number;
  created_at: string;
}

export interface Payrun {
  id: string;
  month: string;
  year: number;
  created_by: string;
  created_at: string;
  total_employees: number;
  total_amount: number;
}

export interface DashboardStats {
  total_employees: number;
  active_employees: number;
  on_leave: number;
  employees_without_bank: number;
  employees_without_manager: number;
  payruns_this_year: number;
  attendance_today: {
    present: number;
    absent: number;
    on_leave: number;
  };
}

export interface CompanySettings {
  id: string;
  company_name: string;
  company_short_code: string;
  logo_url?: string;
  working_days_per_week: number;
  break_time_minutes: number;
  standard_allowance: number;
}
