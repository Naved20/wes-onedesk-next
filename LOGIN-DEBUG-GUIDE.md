# Login Debug Guide - WES OneDesk

## Current Status
✅ Build is successful  
✅ Dev server runs on localhost:3000  
✅ Auth page loads  
❌ Login not working  

## What I've Fixed

### 1. Added Debug Logging
- Added console.log statements in `src/page-components/Auth.js`
- Added console.log statements in `src/hooks/useAuth.js`
- Added environment variable checks in `src/integrations/supabase/client.js`

### 2. Improved Supabase Client Configuration
- Added proper storage configuration for browser
- Added session detection in URL
- Added environment variable validation

### 3. Created Test Connection Page
- Visit: http://localhost:3000/test-connection
- This page will automatically test:
  - Environment variables
  - Supabase client initialization
  - Database connection
  - Admin user existence
  - Test login with default credentials

## How to Debug Login Issue

### Step 1: Run the Dev Server
```bash
npm run dev
```

### Step 2: Open Test Connection Page
1. Open browser and go to: http://localhost:3000/test-connection
2. This will run automatic tests and show you exactly what's wrong
3. Look for any red ✗ marks - those indicate failures

### Step 3: Check Browser Console
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Try to login at http://localhost:3000/auth
4. Look for these messages:
   - "signIn called with email: ..."
   - "Supabase signIn response: ..."
   - Any error messages in red

### Step 4: Common Issues and Solutions

#### Issue 1: "Invalid login credentials"
**Cause**: Admin user doesn't exist in Supabase  
**Solution**: Create admin user manually

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project (glijytescdhdtihzlhlg)
3. Go to Authentication > Users
4. Click "Add user" > "Create new user"
5. Enter:
   - Email: `info@wazireducationsocity.com`
   - Password: `WES@OneDesk786`
   - Auto Confirm User: YES (check this box)
6. Click "Create user"
7. Copy the User ID (UUID)
8. Go to SQL Editor
9. Run this SQL (replace USER_ID with the copied UUID):

```sql
-- Insert role
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID', 'admin');

-- Insert profile
INSERT INTO public.employee_profiles (user_id, email, first_name, last_name, designation, department)
VALUES ('USER_ID', 'info@wazireducationsocity.com', 'Admin', 'User', 'System Administrator', 'Administration');
```

#### Issue 2: "Missing Supabase environment variables"
**Cause**: .env file not loaded or incorrect  
**Solution**: 
1. Check if `.env` file exists in project root
2. Verify it contains:
```
NEXT_PUBLIC_SUPABASE_URL="https://glijytescdhdtihzlhlg.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
3. Restart dev server after changing .env

#### Issue 3: "Table 'user_roles' does not exist"
**Cause**: Database migrations not run  
**Solution**:
1. Go to Supabase Dashboard > SQL Editor
2. Run each migration file from `supabase/migrations/` folder in order
3. Start with the oldest file (check timestamps in filenames)

#### Issue 4: Network/CORS errors
**Cause**: Supabase project not accessible  
**Solution**:
1. Check if Supabase project is active
2. Verify the URL is correct: https://glijytescdhdtihzlhlg.supabase.co
3. Check if you have internet connection

## Default Login Credentials

After setting up the admin user:
- **Email**: info@wazireducationsocity.com
- **Password**: WES@OneDesk786

## Quick Test Commands

### Test 1: Check if .env is loaded
```bash
# In PowerShell
Get-Content .env
```

### Test 2: Verify build works
```bash
npm run build
```

### Test 3: Check Supabase connection
Visit: http://localhost:3000/test-connection

## Next Steps After Login Works

1. ✅ Login with admin credentials
2. ✅ Change the default password
3. ✅ Create additional users
4. ✅ Configure institutions
5. ✅ Set up departments and roles

## Need More Help?

If login still doesn't work after following this guide:

1. Share the output from http://localhost:3000/test-connection
2. Share the browser console errors (F12 > Console tab)
3. Confirm if admin user exists in Supabase Dashboard > Authentication > Users

## Files Modified in This Fix

1. `src/page-components/Auth.js` - Added debug logging
2. `src/hooks/useAuth.js` - Added debug logging
3. `src/integrations/supabase/client.js` - Improved configuration
4. `app/test-connection/page.js` - NEW: Connection test page
5. `SETUP.md` - NEW: Setup instructions
6. `LOGIN-DEBUG-GUIDE.md` - NEW: This file
