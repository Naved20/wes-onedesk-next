-- Update validate_leave_request trigger function to enforce single-day casual leaves
CREATE OR REPLACE FUNCTION public.validate_leave_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_eligibility JSON;
  v_working_days INTEGER;
BEGIN
  -- Calculate working days
  v_working_days := calculate_working_days(NEW.start_date, NEW.end_date);
  
  -- ENFORCE: Casual leaves must be exactly 1 day per application
  IF NEW.leave_type = 'casual' AND NEW.start_date != NEW.end_date THEN
    NEW.auto_rejected := true;
    NEW.auto_rejection_reason := 'Casual leaves are limited to exactly 1 day per application';
    NEW.status := 'rejected';
    NEW.working_days_count := v_working_days;
    RETURN NEW;
  END IF;
  
  -- Adjust for half day
  IF NEW.is_half_day THEN
    NEW.working_days_count := 0.5;
  ELSE
    NEW.working_days_count := v_working_days;
  END IF;
  
  -- Set salary deduction based on leave type
  IF NEW.leave_type = 'sick' THEN
    NEW.salary_deduction_percent := 50;
  ELSIF NEW.leave_type = 'unplanned' THEN
    NEW.salary_deduction_percent := 100;
  ELSIF NEW.leave_type = 'casual' OR NEW.leave_type = 'emergency' THEN
    NEW.salary_deduction_percent := 0;
  END IF;
  
  -- Check eligibility (skip for emergency or if already auto_rejected)
  IF NEW.leave_type != 'emergency' AND NOT NEW.auto_rejected THEN
    v_eligibility := check_leave_eligibility(
      NEW.user_id,
      NEW.start_date,
      NEW.end_date,
      NEW.leave_type,
      NEW.is_emergency
    );
    
    IF NOT (v_eligibility->>'eligible')::BOOLEAN THEN
      NEW.auto_rejected := true;
      NEW.auto_rejection_reason := v_eligibility->>'reason';
      NEW.status := 'rejected';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update check_leave_eligibility to also validate single-day casual
CREATE OR REPLACE FUNCTION public.check_leave_eligibility(p_user_id uuid, p_start_date date, p_end_date date, p_leave_type leave_type, p_is_emergency boolean DEFAULT false)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_month INTEGER := EXTRACT(MONTH FROM p_start_date);
  v_year INTEGER := EXTRACT(YEAR FROM p_start_date);
  v_casual_used NUMERIC;
  v_week_start DATE;
  v_week_leaves INTEGER;
  v_advance_days INTEGER;
  v_working_days INTEGER;
BEGIN
  -- Calculate advance notice days
  v_advance_days := p_start_date - CURRENT_DATE;
  
  -- Calculate working days for this request
  v_working_days := calculate_working_days(p_start_date, p_end_date);
  
  -- ENFORCE: Casual leaves must be exactly 1 day per application
  IF p_leave_type = 'casual' AND v_working_days > 1 THEN
    RETURN json_build_object(
      'eligible', false,
      'reason', 'Casual leaves are limited to exactly 1 day per application',
      'working_days', v_working_days
    );
  END IF;
  
  -- For casual leaves, check 3-day advance notice (unless emergency)
  IF p_leave_type = 'casual' AND NOT p_is_emergency AND v_advance_days < 3 THEN
    RETURN json_build_object(
      'eligible', false,
      'reason', 'Casual leaves require minimum 3 days advance notice',
      'working_days', v_working_days
    );
  END IF;
  
  -- Check casual leave limit (2 per month)
  IF p_leave_type = 'casual' THEN
    SELECT COALESCE(casual_leaves_used, 0)
    INTO v_casual_used
    FROM leave_balances
    WHERE user_id = p_user_id
      AND month = v_month
      AND year = v_year;
    
    IF v_casual_used IS NULL THEN
      v_casual_used := 0;
    END IF;
    
    IF v_casual_used >= 2 THEN
      RETURN json_build_object(
        'eligible', false,
        'reason', 'Monthly casual leave limit (2 days) reached. Used: ' || v_casual_used || '/2',
        'working_days', v_working_days
      );
    END IF;
  END IF;
  
  -- Check weekly limit (max 1 leave per week, unless emergency)
  IF NOT p_is_emergency THEN
    v_week_start := date_trunc('week', p_start_date)::DATE;
    SELECT COUNT(*)
    INTO v_week_leaves
    FROM leaves
    WHERE user_id = p_user_id
      AND status IN ('approved', 'pending')
      AND auto_rejected = false
      AND start_date >= v_week_start
      AND start_date < v_week_start + INTERVAL '7 days';
    
    IF v_week_leaves >= 1 THEN
      RETURN json_build_object(
        'eligible', false,
        'reason', 'Maximum 1 leave application per calendar week allowed',
        'working_days', v_working_days
      );
    END IF;
  END IF;
  
  RETURN json_build_object(
    'eligible', true,
    'reason', NULL,
    'working_days', v_working_days
  );
END;
$function$;

-- Create function to get casual leave count for a user in a month
CREATE OR REPLACE FUNCTION public.get_casual_leave_count(p_user_id uuid, p_year integer, p_month integer)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COUNT(*)::integer
  FROM public.leaves
  WHERE user_id = p_user_id
    AND leave_type = 'casual'
    AND status = 'approved'
    AND EXTRACT(YEAR FROM start_date) = p_year
    AND EXTRACT(MONTH FROM start_date) = p_month;
$function$;