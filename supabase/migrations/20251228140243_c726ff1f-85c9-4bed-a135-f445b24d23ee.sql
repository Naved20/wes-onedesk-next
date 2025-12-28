-- Update the generate function to include employees with base_salary = 0 or NULL
CREATE OR REPLACE FUNCTION public.generate_monthly_salaries(p_year integer, p_month integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_working_days INTEGER;
  v_created_count INTEGER := 0;
  v_skipped_count INTEGER := 0;
  v_employee RECORD;
  v_attendance_stats JSON;
  v_present_days NUMERIC;
  v_paid_leave_days NUMERIC;
  v_base_salary NUMERIC;
BEGIN
  -- Calculate working days for the month
  v_working_days := calculate_monthly_working_days(p_year, p_month);
  
  -- Loop through all active employees (include those with 0 or NULL base salary)
  FOR v_employee IN 
    SELECT user_id, COALESCE(base_salary, 0) as base_salary, first_name, last_name
    FROM employee_profiles
    WHERE is_active = true
  LOOP
    -- Check if salary record already exists
    IF EXISTS (
      SELECT 1 FROM salaries 
      WHERE user_id = v_employee.user_id 
        AND month = p_month 
        AND year = p_year
    ) THEN
      v_skipped_count := v_skipped_count + 1;
      CONTINUE;
    END IF;
    
    v_base_salary := v_employee.base_salary;
    
    -- Get attendance stats
    v_attendance_stats := calculate_attendance_stats(v_employee.user_id, p_year, p_month);
    v_present_days := COALESCE((v_attendance_stats->>'present_days')::NUMERIC, 0) + 
                      COALESCE((v_attendance_stats->>'half_days')::NUMERIC, 0) * 0.5;
    v_paid_leave_days := COALESCE((v_attendance_stats->>'casual_leaves')::NUMERIC, 0);
    
    -- Create salary record
    INSERT INTO salaries (
      user_id,
      month,
      year,
      base_salary,
      working_days,
      present_days,
      paid_leave_days,
      absent_days,
      per_day_salary,
      hra_amount,
      travel_allowance,
      special_bonus,
      pf_deduction,
      tds_deduction,
      professional_tax,
      other_deductions,
      gross_salary,
      net_salary_calculated,
      approval_status,
      is_locked
    ) VALUES (
      v_employee.user_id,
      p_month,
      p_year,
      v_base_salary,
      v_working_days,
      v_present_days,
      v_paid_leave_days,
      GREATEST(0, v_working_days - v_present_days - v_paid_leave_days),
      CASE WHEN v_working_days > 0 THEN ROUND(v_base_salary / v_working_days, 2) ELSE 0 END,
      ROUND(v_base_salary * 0.40, 2),  -- 40% HRA
      1600,  -- Fixed travel allowance
      0,     -- No bonus by default
      ROUND(v_base_salary * 0.12, 2),  -- 12% PF
      0,     -- TDS calculated later if needed
      200,   -- Fixed professional tax
      0,     -- No other deductions
      ROUND(v_base_salary + (v_base_salary * 0.40) + 1600, 2),  -- Gross
      ROUND(v_base_salary - (v_base_salary * 0.12) - 200, 2),   -- Net (simplified)
      'draft',
      false
    );
    
    v_created_count := v_created_count + 1;
  END LOOP;
  
  RETURN json_build_object(
    'success', true,
    'created', v_created_count,
    'skipped', v_skipped_count,
    'working_days', v_working_days
  );
END;
$$;