#!/usr/bin/env node

/**
 * Seed script for WorkZen HRMS mock database
 * Generates db.json with sample data and mock email files
 */

const fs = require('fs');
const path = require('path');

// Helper to hash password (simple btoa for mock)
const hashPassword = (password) => Buffer.from(password).toString('base64');

// Generate seed data
const seedData = {
  users: [
    {
      id: 'user_1',
      login_id: 'OIJODO20220001',
      email: 'admin@workzen.com',
      first_name: 'John',
      last_name: 'Doe',
      role: 'admin',
      phone: '+91-9876543210',
      company_name: 'WorkZen',
      password_hash: hashPassword('Admin@123'),
      force_password_change: false,
      created_at: new Date('2022-01-15').toISOString(),
    },
    {
      id: 'user_2',
      login_id: 'OIJODO20220002',
      email: 'hr@workzen.com',
      first_name: 'Jane',
      last_name: 'Smith',
      role: 'hr',
      phone: '+91-9876543211',
      company_name: 'WorkZen',
      password_hash: hashPassword('Hr@123'),
      force_password_change: false,
      created_at: new Date('2022-01-15').toISOString(),
    },
    {
      id: 'user_3',
      login_id: 'OIJODO20230003',
      email: 'payroll@workzen.com',
      first_name: 'Mike',
      last_name: 'Johnson',
      role: 'payroll',
      phone: '+91-9876543212',
      company_name: 'WorkZen',
      password_hash: hashPassword('Payroll@123'),
      force_password_change: false,
      created_at: new Date('2023-01-10').toISOString(),
    },
    {
      id: 'user_4',
      login_id: 'OIJODO20240004',
      email: 'employee@workzen.com',
      first_name: 'Sarah',
      last_name: 'Williams',
      role: 'employee',
      phone: '+91-9876543213',
      company_name: 'WorkZen',
      password_hash: hashPassword('Employee@123'),
      force_password_change: false,
      created_at: new Date('2024-01-05').toISOString(),
    },
  ],
  employees: [
    {
      id: 'emp_1',
      user_id: 'user_4',
      first_name: 'Sarah',
      last_name: 'Williams',
      email: 'employee@workzen.com',
      phone: '+91-9876543213',
      date_of_birth: '1995-05-15',
      gender: 'Female',
      address: '123 Main Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400001',
      country: 'India',
      hire_date: '2024-01-05',
      department: 'Engineering',
      position: 'Software Developer',
      manager_id: 'emp_2',
      bank_account_number: '1234567890',
      bank_name: 'HDFC Bank',
      bank_ifsc: 'HDFC0001234',
      monthly_wage: 50000,
      status: 'active',
    },
    {
      id: 'emp_2',
      user_id: 'user_2',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'hr@workzen.com',
      phone: '+91-9876543211',
      date_of_birth: '1990-03-20',
      gender: 'Female',
      address: '456 Park Avenue',
      city: 'Mumbai',
      state: 'Maharashtra',
      postal_code: '400002',
      country: 'India',
      hire_date: '2022-01-15',
      department: 'Human Resources',
      position: 'HR Manager',
      bank_account_number: '9876543210',
      bank_name: 'ICICI Bank',
      bank_ifsc: 'ICIC0001234',
      monthly_wage: 75000,
      status: 'active',
    },
    {
      id: 'emp_5',
      user_id: '',
      first_name: 'Jane',
      last_name: 'Smith',
      email: 'jane@workzen.com',
      phone: '+91-9876543220',
      date_of_birth: '1992-08-10',
      gender: 'Female',
      address: '789 Oak Lane',
      city: 'Delhi',
      state: 'Delhi',
      postal_code: '110001',
      country: 'India',
      hire_date: '2023-06-01',
      department: 'Marketing',
      position: 'Marketing Manager',
      // Missing manager_id - test case
      // Missing bank details - test case
      monthly_wage: 60000,
      status: 'active',
    },
    {
      id: 'emp_6',
      user_id: '',
      first_name: 'Bob',
      last_name: 'Wilson',
      email: 'bob@workzen.com',
      phone: '+91-9876543221',
      date_of_birth: '1988-11-25',
      gender: 'Male',
      address: '321 Elm Street',
      city: 'Bangalore',
      state: 'Karnataka',
      postal_code: '560001',
      country: 'India',
      hire_date: '2024-03-15',
      department: 'Sales',
      position: 'Sales Executive',
      bank_account_number: '5555666677',
      bank_name: 'SBI',
      bank_ifsc: 'SBIN0001234',
      monthly_wage: 45000,
      status: 'active',
    },
    {
      id: 'emp_7',
      user_id: '',
      first_name: 'Alice',
      last_name: 'Brown',
      email: 'alice@workzen.com',
      phone: '+91-9876543222',
      date_of_birth: '1994-02-14',
      gender: 'Female',
      address: '555 Pine Road',
      city: 'Pune',
      state: 'Maharashtra',
      postal_code: '411001',
      country: 'India',
      hire_date: '2024-07-01',
      department: 'Engineering',
      position: 'Frontend Developer',
      manager_id: 'emp_2',
      bank_account_number: '7777888899',
      bank_name: 'Axis Bank',
      bank_ifsc: 'UTIB0001234',
      monthly_wage: 48000,
      status: 'on_leave', // Test case: on leave
    },
  ],
  attendance: [
    {
      id: 'att_1',
      employee_id: 'emp_1',
      date: '2025-01-06',
      check_in: '2025-01-06T09:00:00Z',
      check_out: '2025-01-06T18:00:00Z',
      work_hours: 9,
      extra_hours: 1,
      status: 'present',
    },
    {
      id: 'att_2',
      employee_id: 'emp_1',
      date: '2025-01-07',
      check_in: '2025-01-07T09:15:00Z',
      check_out: '2025-01-07T17:30:00Z',
      work_hours: 8.25,
      extra_hours: 0.25,
      status: 'present',
    },
  ],
  time_offs: [
    {
      id: 'to_1',
      employee_id: 'emp_7',
      type: 'paid',
      start_date: '2025-01-08',
      end_date: '2025-01-10',
      days: 3,
      reason: 'Personal work',
      status: 'approved',
      approved_by: 'user_2',
      created_at: '2025-01-05T10:00:00Z',
    },
  ],
  leave_balances: [
    {
      employee_id: 'emp_1',
      paid_days_remaining: 24,
      sick_days_remaining: 7,
    },
    {
      employee_id: 'emp_2',
      paid_days_remaining: 24,
      sick_days_remaining: 7,
    },
    {
      employee_id: 'emp_7',
      paid_days_remaining: 21,
      sick_days_remaining: 7,
    },
  ],
  payslips: [],
  payruns: [],
  company_settings: [
    {
      id: 'settings_1',
      company_name: 'WorkZen',
      company_short_code: 'OI',
      working_days_per_week: 5,
      break_time_minutes: 60,
      standard_allowance: 4167,
    },
  ],
};

// Write db.json
const dbPath = path.join(__dirname, '..', 'mock', 'db.json');
fs.writeFileSync(dbPath, JSON.stringify(seedData, null, 2));
console.log('✅ Generated mock/db.json');

// Create mock_emails directory and write sample emails
const emailsDir = path.join(__dirname, '..', 'mock_emails');
if (!fs.existsSync(emailsDir)) {
  fs.mkdirSync(emailsDir, { recursive: true });
}

// Sample credential emails
const sampleEmails = [
  {
    filename: 'welcome_admin.json',
    data: {
      to: 'admin@workzen.com',
      subject: 'Your WorkZen HRMS Account Credentials',
      body: `Dear John,

Welcome to WorkZen HRMS! Your account has been created successfully.

Login Credentials:
- Login ID: OIJODO20220001
- Email: admin@workzen.com
- Temporary Password: Admin@123

Please log in at: http://localhost:8080/signin

For security reasons, you will be required to change your password on first login.

Best regards,
WorkZen HRMS Team`,
    },
  },
  {
    filename: 'welcome_employee.json',
    data: {
      to: 'employee@workzen.com',
      subject: 'Your WorkZen HRMS Account Credentials',
      body: `Dear Sarah,

Welcome to WorkZen HRMS! Your account has been created successfully.

Login Credentials:
- Login ID: OIJODO20240004
- Email: employee@workzen.com
- Temporary Password: Employee@123

Please log in at: http://localhost:8080/signin

For security reasons, you will be required to change your password on first login.

Best regards,
WorkZen HRMS Team`,
    },
  },
];

sampleEmails.forEach(({ filename, data }) => {
  const emailPath = path.join(emailsDir, filename);
  fs.writeFileSync(emailPath, JSON.stringify(data, null, 2));
});

console.log(`✅ Generated ${sampleEmails.length} mock email files in mock_emails/`);
console.log('\n🎉 Database seeding completed successfully!');
console.log('\nNext steps:');
console.log('1. Run: npm run start:mock');
console.log('2. Run: npm run dev');
console.log('3. Visit: http://localhost:8080');
