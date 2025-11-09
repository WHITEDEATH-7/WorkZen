/**
 * Salary Calculation Utilities
 * 
 * Rules:
 * - Basic: 50% of monthly wage
 * - HRA: 50% of basic
 * - Standard Allowance: ₹4167 (fixed)
 * - Performance Bonus: 8.33% of basic
 * - LTA: 8.33% of basic
 * - Fixed Allowance: Wage - sum of above earnings
 * - PF Employee: 12% of basic
 * - PF Employer: 12% of basic
 * - Professional Tax: ₹200
 */

export interface SalaryBreakdown {
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
}

const STANDARD_ALLOWANCE = 4167;
const PROFESSIONAL_TAX = 200;
const PF_PERCENTAGE = 0.12;
const BONUS_PERCENTAGE = 0.0833;
const LTA_PERCENTAGE = 0.0833;

export const calculateSalary = (monthlyWage: number): SalaryBreakdown => {
  // Basic salary is 50% of wage
  const basic = Math.round(monthlyWage * 0.5);
  
  // HRA is 50% of basic
  const hra = Math.round(basic * 0.5);
  
  // Fixed allowances
  const standard_allowance = STANDARD_ALLOWANCE;
  
  // Performance bonus: 8.33% of basic
  const performance_bonus = Math.round(basic * BONUS_PERCENTAGE);
  
  // LTA: 8.33% of basic
  const lta = Math.round(basic * LTA_PERCENTAGE);
  
  // Fixed allowance: remaining amount to reach wage
  const sum_known_earnings = basic + hra + standard_allowance + performance_bonus + lta;
  const fixed_allowance = Math.max(0, monthlyWage - sum_known_earnings);
  
  // Gross earnings
  const gross_earnings = basic + hra + standard_allowance + performance_bonus + lta + fixed_allowance;
  
  // Deductions
  const pf_employee = Math.round(basic * PF_PERCENTAGE);
  const pf_employer = Math.round(basic * PF_PERCENTAGE);
  const professional_tax = PROFESSIONAL_TAX;
  
  const total_deductions = pf_employee + professional_tax;
  
  // Net salary
  const net_salary = gross_earnings - total_deductions;
  
  return {
    basic,
    hra,
    standard_allowance,
    performance_bonus,
    lta,
    fixed_allowance,
    gross_earnings,
    pf_employee,
    pf_employer,
    professional_tax,
    total_deductions,
    net_salary,
  };
};

/**
 * Format currency in INR
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate work hours between check-in and check-out
 */
export const calculateWorkHours = (checkIn: string, checkOut: string): number => {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return Math.max(0, Math.round(hours * 100) / 100);
};

/**
 * Calculate extra hours (assuming 8-hour workday)
 */
export const calculateExtraHours = (workHours: number): number => {
  const standardHours = 8;
  return Math.max(0, workHours - standardHours);
};

/**
 * Calculate payable days based on attendance and leaves
 * @param attendanceCount - Number of days employee was present
 * @param paidLeaveCount - Number of paid leave days taken
 * @param totalWorkingDays - Total working days in the month (default: 30)
 * @returns Number of payable days
 */
export const calculatePayableDays = (
  attendanceCount: number,
  paidLeaveCount: number = 0,
  totalWorkingDays: number = 30
): number => {
  const payableDays = attendanceCount + paidLeaveCount;
  return Math.min(payableDays, totalWorkingDays);
};

/**
 * Calculate salary based on attendance and leaves
 * @param monthlyWage - Base monthly wage
 * @param payableDays - Number of payable days
 * @param totalWorkingDays - Total working days in month (default: 30)
 * @returns Salary breakdown adjusted for actual days worked
 */
export const calculateSalaryWithAttendance = (
  monthlyWage: number,
  payableDays: number,
  totalWorkingDays: number = 30
): SalaryBreakdown => {
  // Calculate base salary first
  const baseSalary = calculateSalary(monthlyWage);
  
  // If full month attendance, return base salary
  if (payableDays >= totalWorkingDays) {
    return baseSalary;
  }
  
  // Calculate pro-rata factor
  const factor = payableDays / totalWorkingDays;
  
  // Adjust all components proportionally
  return {
    basic: Math.round(baseSalary.basic * factor),
    hra: Math.round(baseSalary.hra * factor),
    standard_allowance: Math.round(baseSalary.standard_allowance * factor),
    performance_bonus: Math.round(baseSalary.performance_bonus * factor),
    lta: Math.round(baseSalary.lta * factor),
    fixed_allowance: Math.round(baseSalary.fixed_allowance * factor),
    gross_earnings: Math.round(baseSalary.gross_earnings * factor),
    pf_employee: Math.round(baseSalary.pf_employee * factor),
    pf_employer: Math.round(baseSalary.pf_employer * factor),
    professional_tax: payableDays > 0 ? baseSalary.professional_tax : 0, // Full tax if any work
    total_deductions: Math.round(baseSalary.pf_employee * factor) + (payableDays > 0 ? baseSalary.professional_tax : 0),
    net_salary: Math.round(baseSalary.gross_earnings * factor) - (Math.round(baseSalary.pf_employee * factor) + (payableDays > 0 ? baseSalary.professional_tax : 0)),
  };
};
