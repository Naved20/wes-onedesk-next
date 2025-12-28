-- Remove the unique constraint on institution_name to allow multiple managers per institution
ALTER TABLE public.manager_institutions 
DROP CONSTRAINT IF EXISTS manager_institutions_institution_name_key;

-- Add a composite unique constraint (one manager can only be assigned to an institution once)
ALTER TABLE public.manager_institutions 
ADD CONSTRAINT manager_institutions_unique_assignment 
UNIQUE (manager_user_id, institution_name);

-- Add missing manager_institutions entries for all existing managers
INSERT INTO public.manager_institutions (manager_user_id, institution_name)
SELECT ur.user_id, ep.institution_assignment
FROM public.user_roles ur
JOIN public.employee_profiles ep ON ur.user_id = ep.user_id
WHERE ur.role = 'manager'
  AND ep.institution_assignment IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.manager_institutions mi 
    WHERE mi.manager_user_id = ur.user_id 
      AND mi.institution_name = ep.institution_assignment
  );