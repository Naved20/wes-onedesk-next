// Supabase Database Types
// This file contains type definitions for the Supabase database schema

export const AppRole = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee"
};

export const AttendanceStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
};

export const LeaveStatus = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected"
};

export const LeaveType = {
  CASUAL: "casual",
  SICK: "sick",
  UNPLANNED: "unplanned",
  EMERGENCY: "emergency"
};

// Database function names for reference
export const DatabaseFunctions = {
  CALCULATE_LEAVE_BALANCE: "calculate_leave_balance",
  CALCULATE_MONTHLY_WORKING_DAYS: "calculate_monthly_working_days",
  CALCULATE_SALARY_BREAKDOWN: "calculate_salary_breakdown",
  CALCULATE_WORKING_DAYS: "calculate_working_days",
  CHECK_LEAVE_ELIGIBILITY: "check_leave_eligibility",
  GENERATE_MONTHLY_SALARIES: "generate_monthly_salaries",
  GET_CASUAL_LEAVE_COUNT: "get_casual_leave_count",
  GET_OR_CREATE_LEAVE_BALANCE: "get_or_create_leave_balance",
  GET_USER_INSTITUTION: "get_user_institution",
  HAS_ROLE: "has_role",
  IS_LATE_CHECKIN: "is_late_checkin",
  IS_MANAGER_OF_INSTITUTION: "is_manager_of_institution",
  IS_MANAGER_OF_USER: "is_manager_of_user",
  IS_WITHIN_CHECKIN_WINDOW: "is_within_checkin_window"
};
