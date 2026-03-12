# Quick Fix - Login Stuck at "Logging in..."

## Problem
Login button shows "Logging in..." but never completes. This means the admin user exists but doesn't have a role in the database.

## Solution (5 minutes)

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project: `glijytescdhdtihzlhlg`

### Step 2: Check if User Exists
1. Go to **Authentication** > **Users**
2. Look for: `info@wazireducationsocity.com`

**If user DOES NOT exist:**
- Click **"Add user"** > **"Create new user"**
- Email: `info@wazireducationsocity.com`
- Password: `WES@OneDesk786`
- **Check "Auto Confirm User"** ✓
- Click **"Create user"**
- **Copy the User ID (UUID)** - you'll need it in Step 3

**If user EXISTS:**
- **Copy the User ID (UUID)** - you'll need it in Step 3

### Step 3: Add Role to Database
1. Go to **SQL Editor** in Supabase Dashboard
2. Click **"New query"**
3. Paste this SQL (replace `USER_ID_HERE` with the UUID you copied):

```sql
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
```

4. Click **"Run"**
5. You should see: "Success. No rows returned"

### Step 4: Verify Setup
Run this query in SQL Editor:

```sql
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
```

**Expected result:**
- email: info@wazireducationsocity.com
- role: admin
- first_name: Admin
- last_name: User

### Step 5: Try Login Again
1. Go back to: http://localhost:3000/auth
2. Refresh the page (Ctrl+R or F5)
3. Login with:
   - Email: `info@wazireducationsocity.com`
   - Password: `WES@OneDesk786`
4. Should redirect to dashboard immediately!

## Alternative: Use Test Connection Page

Visit: http://localhost:3000/test-connection

This page will:
- Show you exactly what's missing
- Test the database connection
- Try to login automatically
- Tell you the exact error

## Still Not Working?

If login still hangs:

1. Open browser console (F12)
2. Go to Console tab
3. Try login again
4. Look for these messages:
   - "fetchUserRole response: ..."
   - Any red error messages
5. Share the console output

## Common Errors

### "relation 'public.user_roles' does not exist"
**Fix**: Run database migrations
1. Go to SQL Editor
2. Run migration files from `supabase/migrations/` folder
3. Start with oldest file (check timestamps)

### "permission denied for table user_roles"
**Fix**: Check RLS policies
1. Go to Table Editor > user_roles
2. Check if RLS is enabled
3. Verify policies allow authenticated users to read their own roles

### "Invalid login credentials"
**Fix**: User doesn't exist
1. Create user in Authentication > Users
2. Follow Step 2 above
