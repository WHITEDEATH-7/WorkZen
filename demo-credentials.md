# Demo Credentials

Use these credentials to test different user roles in WorkZen HRMS.

## Test Accounts

| Role | Login ID | Email | Password | Permissions |
|------|----------|-------|----------|-------------|
| **Admin** | `OIJODO20220001` | admin@workzen.com | Admin@123 | Full access to all modules |
| **HR Officer** | `OIJODO20220002` | hr@workzen.com | Hr@123 | Employee management, attendance, time-off approval |
| **Payroll Officer** | `OIJODO20230003` | payroll@workzen.com | Payroll@123 | Payroll management, salary processing |
| **Employee** | `OIJODO20240004` | employee@workzen.com | Employee@123 | Limited access (attendance, time-off requests) |

## First Login Behavior

All users are required to change their password on first login for security purposes.

## Creating New Users

Only **Admin** and **HR Officer** roles can create new users through the Sign Up page.

### Auto-Generated Login ID Format
`OI` + First 2 letters of first name + First 2 letters of last name + Year of joining + 4-digit serial

**Example:**
- Name: John Doe
- Year: 2025
- Serial: 0005
- Login ID: `OIJODO20250005`

## Password Policy

When creating users:
- If no password is provided, system auto-generates a secure 8-10 character password
- Password must contain uppercase, lowercase, number, and special character
- Minimum length: 8 characters
- Credentials are sent via mock email system (logged to console and `mock_emails/` directory)

## Employee Test Cases

The seeded database includes specific test scenarios:

1. **Employee A (Jane Smith - OIJASM20230005)**
   - Missing bank account details
   - Triggers warning on dashboard
   - Email: jane@workzen.com

2. **Employee B (Bob Wilson - OIOBWI20240006)**
   - No manager assigned
   - Shows in "Missing Manager" warning
   - Email: bob@workzen.com

3. **Employee C (Alice Brown - OIALBR20240007)**
   - Currently on approved leave
   - Shows leave icon on employee card
   - Email: alice@workzen.com

## Testing Workflows

### Sign Up Flow
1. Log in as Admin or HR
2. Navigate to Sign Up page
3. Fill company and user details
4. Upload company logo (optional)
5. System generates Login ID and password
6. Check console for credentials email

### Attendance Flow
1. Log in as Employee
2. Go to Attendance module
3. Click "Check In" button
4. System records current time
5. Later, click "Check Out"
6. View work hours calculation

### Time Off Flow
1. Log in as Employee
2. Go to Time Off module
3. Apply for leave (select type and dates)
4. Log in as HR/Admin
5. Approve or reject the request

### Payroll Flow
1. Log in as Admin or Payroll Officer
2. Go to Payroll module
3. Click "Create Payrun" for a month
4. System generates payslips for all employees
5. View detailed salary breakdown
6. Print or download payslips

## Mock Backend

The system uses `json-server` running on port 4000. All data is stored in `mock/db.json`.

### Resetting Data
```bash
npm run seed:mock
```

This regenerates the database with fresh sample data.

## Notes

- All times are in local timezone
- Currency is INR (₹)
- Leave balances: Paid (24 days), Sick (7 days), Unpaid (unlimited)
- Payroll calculations are deterministic based on attendance and salary rules
- Mock emails are saved to `mock_emails/` directory

## Support

For issues or questions, please refer to the README.md or create an issue in the repository.
