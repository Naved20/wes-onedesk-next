-- WES OneDesk - Create Admin User
-- Run this SQL in Supabase Dashboard > SQL Editor

-- Step 1: Check if admin user exists in auth.users
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'info@wazireducationsocity.com';

-- If user doesn't exist, you need to create it via Supabase Dashboard:
-- Go to Authentication > Users > Add User
-- Email: info@wazireducationsocity.com
-- Password: WES@OneDesk786
-- Check "Auto Confirm User"

-- Step 2: After creating user, get the user_id and run these:
-- (Replace 'USER_ID_HERE' with the actual UUID from Step 1)

-- Insert admin role
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin')
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- Insert employee profile
INSERT INTO public.employee_profiles (
  user_id, 
  email, 
  first_name, 
  last_name, 
  designation, 
  department
)
VALUES (
  'USER_ID_HERE',
  'info@wazireducationsocity.com',
  'Admin',
  'User',
  'System Administrator',
  'Administration'
)
ON CONFLICT (user_id) DO UPDATE SET
  email = 'info@wazireducationsocity.com',
  first_name = 'Admin',
  last_name = 'User',
  designation = 'System Administrator',
  department = 'Administration';

-- Step 3: Verify the setup
SELECT 
  u.id,
  u.email,
  ur.role,
  ep.first_name,
  ep.last_name
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.employee_profiles ep ON u.id = ep.user_id
WHERE u.email = 'info@wazireducationsocity.com';

-- Expected result:
-- id: (some UUID)
-- email: info@wazireducationsocity.com
-- role: admin
-- first_name: Admin
-- last_name: User
