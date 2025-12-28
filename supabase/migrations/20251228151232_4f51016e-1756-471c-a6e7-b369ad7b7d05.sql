
-- Create a function to prevent creating additional admin users
CREATE OR REPLACE FUNCTION public.prevent_additional_admins()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if trying to insert or update to admin role
  IF NEW.role = 'admin' THEN
    -- Check if an admin already exists (excluding current record on update)
    IF TG_OP = 'INSERT' THEN
      IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
        RAISE EXCEPTION 'Only one admin is allowed in the system';
      END IF;
    ELSIF TG_OP = 'UPDATE' THEN
      IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin' AND id != NEW.id) THEN
        RAISE EXCEPTION 'Only one admin is allowed in the system';
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to enforce single admin rule
DROP TRIGGER IF EXISTS enforce_single_admin ON public.user_roles;
CREATE TRIGGER enforce_single_admin
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_additional_admins();

-- Also prevent the admin role from being deleted
CREATE OR REPLACE FUNCTION public.prevent_admin_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.role = 'admin' THEN
    RAISE EXCEPTION 'The admin role cannot be deleted';
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS prevent_admin_role_deletion ON public.user_roles;
CREATE TRIGGER prevent_admin_role_deletion
  BEFORE DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_admin_deletion();
