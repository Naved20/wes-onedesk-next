-- Create function to generate monthly salary records for all employees
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
BEGIN
  -- Calculate working days for the month
  v_working_days := calculate_monthly_working_days(p_year, p_month);
  
  -- Loop through all active employees
  FOR v_employee IN 
    SELECT user_id, base_salary, first_name, last_name
    FROM employee_profiles
    WHERE is_active = true AND base_salary > 0
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
      v_employee.base_salary,
      v_working_days,
      v_present_days,
      v_paid_leave_days,
      GREATEST(0, v_working_days - v_present_days - v_paid_leave_days),
      ROUND(v_employee.base_salary / NULLIF(v_working_days, 0), 2),
      ROUND(v_employee.base_salary * 0.40, 2),  -- 40% HRA
      1600,  -- Fixed travel allowance
      0,     -- No bonus by default
      ROUND(v_employee.base_salary * 0.12, 2),  -- 12% PF
      0,     -- TDS calculated later if needed
      200,   -- Fixed professional tax
      0,     -- No other deductions
      ROUND(v_employee.base_salary + (v_employee.base_salary * 0.40) + 1600, 2),  -- Gross
      ROUND(v_employee.base_salary - (v_employee.base_salary * 0.12) - 200, 2),   -- Net (simplified)
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.generate_monthly_salaries(integer, integer) TO authenticated;

-- Update RLS policies for salaries table to allow admin to manage locked salaries
-- First drop existing admin policy
DROP POLICY IF EXISTS "Admins can manage all salaries" ON public.salaries;

-- Create new admin policy that allows full access including locked salaries
CREATE POLICY "Admins can manage all salaries including locked"
ON public.salaries FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Allow managers to view ALL their team's unlocked salaries (not just locked ones)
DROP POLICY IF EXISTS "Managers can view team locked salaries" ON public.salaries;

CREATE POLICY "Managers can view team salaries"
ON public.salaries FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'manager') 
  AND is_manager_of_user(auth.uid(), user_id)
);