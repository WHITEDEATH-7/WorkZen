# Changelog

All notable changes to WorkZen HRMS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-08

### Added
- Initial project scaffold with Vite + React + TypeScript
- Complete authentication system with role-based access control
- Auto-generated Login IDs (OI + initials + year + serial)
- Mock backend using json-server with seeded data
- Employee management module with CRUD operations
- Attendance tracking with check-in/check-out functionality
- Time-off management with approval workflows
- Payroll module with automated salary calculations
- Dashboard with analytics and warning cards
- Reports module for salary statements and attendance exports
- Settings page for company configuration
- Responsive sidebar navigation
- Mock email system for credential delivery
- Unit tests for salary calculation utilities
- Comprehensive documentation (README, API docs)
- Demo credentials for all roles
- MIT License

### Features by Module

#### Authentication
- Sign in with Login ID or Email
- Sign up for Admin/HR only
- Auto-generated secure passwords
- First-time login password change enforcement
- Session management with role persistence

#### Dashboard
- Employee count statistics
- Payrun tracking charts
- Attendance overview
- Warning cards for missing data (bank accounts, managers)
- Leave status indicators

#### Employee Management
- Employee card grid with status indicators
- Profile modal with tabs (Personal, Private, Bank, Salary)
- Create/Edit employee forms
- Role-based field restrictions
- Avatar display

#### Attendance
- Daily check-in/check-out for employees
- Attendance history table
- Work hours and extra hours calculation
- Admin/HR view for all employees

#### Time Off
- Apply for Paid/Sick/Unpaid leave
- Leave balance tracking
- Approval workflow for HR/Admin/Payroll
- Status tracking (pending, approved, rejected)

#### Payroll
- Automated payrun creation for a month
- Payslip generation with detailed breakdown
- Salary calculation rules:
  - Basic: 50% of wage
  - HRA: 50% of basic
  - Standard Allowance: ₹4167
  - Performance Bonus: 8.33% of basic
  - LTA: 8.33% of basic
  - PF: 12% employee + 12% employer
  - Professional Tax: ₹200
- Print/download payslips

#### Reports
- Salary statement by employee and year
- Attendance report exports (CSV)
- Customizable date ranges

#### Settings
- Company logo upload
- Working days configuration
- Break time settings
- Company short code management

### Technical Implementation
- Context API for global auth state
- Protected route wrapper
- Axios interceptors for API calls
- Utility functions for login ID and password generation
- Deterministic salary calculation algorithm
- Mock email logging system
- Seeded database with sample employees
- Parallel script execution for dev workflow

### Documentation
- Comprehensive README with quickstart guide
- Demo credentials document
- Supabase migration instructions
- Deployment guides for Vercel
- Troubleshooting section
- API documentation

### Development Experience
- Hot module replacement
- Development scripts for frontend and backend
- Seed script for database regeneration
- Environment variable examples
- ESLint configuration

## [Unreleased]

### Planned Features
- Real email integration with Resend
- Supabase backend integration
- Advanced reporting with filters
- Employee performance reviews
- Document management system
- Notification system
- Audit logs
- Multi-language support
- Dark mode toggle
- Mobile app (React Native)

---

**Note**: This is the initial release. Future versions will include additional features and improvements based on user feedback.
