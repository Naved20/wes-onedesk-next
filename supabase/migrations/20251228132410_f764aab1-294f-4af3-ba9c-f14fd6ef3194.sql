-- Add salary management enhancements

-- Create salary audit table
CREATE TABLE IF NOT EXISTS public.salary_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  salary_id uuid NOT NULL,
  action text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid NOT NULL,
  change_reason text,
  created_at timestamp with time zone DEFAULT now()
);

-- Add new columns to salaries table for comprehensive salary management
ALTER TABLE public.salaries
ADD COLUMN IF NOT EXISTS hra_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS travel_allowance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS special_bonus numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS pf_deduction numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS tds_deduction numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS professional_tax numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_deductions numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS gross_salary numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_salary_calculated numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_salary_manual numeric,
ADD COLUMN IF NOT EXISTS manager_proposed_salary numeric,
ADD COLUMN IF NOT EXISTS manager_proposed_by uuid,
ADD COLUMN IF NOT EXISTS manager_proposed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS manager_justification text,
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS approved_by uuid,
ADD COLUMN IF NOT EXISTS approved_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS approval_notes text;

-- Enable RLS on salary_audit
ALTER TABLE public.salary_audit ENABLE ROW LEVEL SECURITY;

-- RLS policies for salary_audit
CREATE POLICY "Admins can manage all salary audits"
ON public.salary_audit
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Managers can view team salary audits"
ON public.salary_audit
FOR SELECT
USING (
  has_role(auth.uid(), 'manager'::app_role) AND
  EXISTS (
    SELECT 1 FROM salaries s
    WHERE s.id = salary_audit.salary_id
    AND is_manager_of_user(auth.uid(), s.user_id)
  )
);

CREATE POLICY "Users can view their own salary audits"
ON public.salary_audit
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM salaries s
    WHERE s.id = salary_audit.salary_id
    AND s.user_id = auth.uid()
    AND s.is_locked = true
  )
);

-- Update salaries RLS to allow managers to insert/update
CREATE POLICY "Managers can insert team salaries"
ON public.salaries
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'manager'::app_role) AND
  is_manager_of_user(auth.uid(), user_id)
);

CREATE POLICY "Managers can update team unlocked salaries"
ON public.salaries
FOR UPDATE
USING (
  has_role(auth.uid(), 'manager'::app_role) AND
  is_manager_of_user(auth.uid(), user_id) AND
  is_locked = false
);

-- Function to calculate salary automatically
CREATE OR REPLACE FUNCTION public.calculate_salary_breakdown(
  p_base_salary numeric,
  p_working_days integer,
  p_present_days integer,
  p_paid_leave_days integer DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_per_day_salary numeric;
  v_effective_days integer;
  v_basic_earned numeric;
  v_hra numeric;
  v_travel numeric;
  v_gross numeric;
  v_pf numeric;
  v_tds numeric;
  v_pt numeric;
  v_net numeric;
BEGIN
  IF p_working_days <= 0 THEN
    RETURN json_build_object(
      'per_day_salary', 0,
      'basic_earned', 0,
      'hra', 0,
      'travel_allowance', 0,
      'gross_salary', 0,
      'pf_deduction', 0,
      'tds_deduction', 0,
      'professional_tax', 0,
      'net_salary', 0
    );
  END IF;

  -- Calculate per day salary
  v_per_day_salary := p_base_salary / p_working_days;
  
  -- Effective days = present days + paid leave days
  v_effective_days := COALESCE(p_present_days, 0) + COALESCE(p_paid_leave_days, 0);
  
  -- Basic earned salary
  v_basic_earned := v_per_day_salary * v_effective_days;
  
  -- Standard allowances (configurable percentages)
  v_hra := v_basic_earned * 0.40; -- 40% HRA
  v_travel := 1600; -- Fixed travel allowance
  
  -- Gross salary
  v_gross := v_basic_earned + v_hra + v_travel;
  
  -- Deductions
  v_pf := v_basic_earned * 0.12; -- 12% PF
  v_tds := CASE WHEN v_gross > 50000 THEN v_gross * 0.10 ELSE 0 END; -- 10% TDS if above 50k
  v_pt := 200; -- Fixed professional tax
  
  -- Net salary
  v_net := v_gross - v_pf - v_tds - v_pt;
  
  RETURN json_build_object(
    'per_day_salary', ROUND(v_per_day_salary, 2),
    'basic_earned', ROUND(v_basic_earned, 2),
    'hra', ROUND(v_hra, 2),
    'travel_allowance', ROUND(v_travel, 2),
    'gross_salary', ROUND(v_gross, 2),
    'pf_deduction', ROUND(v_pf, 2),
    'tds_deduction', ROUND(v_tds, 2),
    'professional_tax', ROUND(v_pt, 2),
    'net_salary', ROUND(v_net, 2)
  );
END;
$$;

-- Trigger to audit salary changes
CREATE OR REPLACE FUNCTION public.audit_salary_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.final_salary IS DISTINCT FROM NEW.final_salary OR
       OLD.net_salary_manual IS DISTINCT FROM NEW.net_salary_manual OR
       OLD.approval_status IS DISTINCT FROM NEW.approval_status OR
       OLD.is_locked IS DISTINCT FROM NEW.is_locked THEN
      INSERT INTO salary_audit (
        salary_id, action, old_data, new_data, changed_by, change_reason
      ) VALUES (
        NEW.id,
        CASE
          WHEN NEW.is_locked AND NOT COALESCE(OLD.is_locked, false) THEN 'locked'
          WHEN NEW.approval_status = 'approved' AND OLD.approval_status != 'approved' THEN 'approved'
          WHEN NEW.manager_proposed_salary IS NOT NULL AND OLD.manager_proposed_salary IS NULL THEN 'proposed'
          ELSE 'modified'
        END,
        to_jsonb(OLD),
        to_jsonb(NEW),
        COALESCE(NEW.locked_by, NEW.approved_by, NEW.manager_proposed_by, auth.uid()),
        NEW.approval_notes
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for salary audit
DROP TRIGGER IF EXISTS audit_salary_trigger ON public.salaries;
CREATE TRIGGER audit_salary_trigger
BEFORE UPDATE ON public.salaries
FOR EACH ROW
EXECUTE FUNCTION public.audit_salary_changes();