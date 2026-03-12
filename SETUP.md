# WES OneDesk - Setup Instructions

## Prerequisites
- Node.js installed
- Supabase account and project created

## Environment Setup

1. Ensure your `.env` file has the correct Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_PROJECT_ID="glijytescdhdtihzlhlg"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_SUPABASE_URL="https://glijytescdhdtihzlhlg.supabase.co"
```

## Database Setup

### Option 1: Run Migrations (Recommended)
If you have Supabase CLI installed:
```bash
supabase db push
```

### Option 2: Manual Setup
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files in order from `supabase/migrations/`

## Create Admin User

### Method 1: Using Supabase Edge Function
1. Deploy the setup-admin function:
```bash
supabase functions deploy setup-admin
```

2. Call the function:
```bash
curl -X POST https://glijytescdhdtihzlhlg.supabase.co/functions/v1/setup-admin
```

### Method 2: Manual Creation via Supabase Dashboard
1. Go to Authentication > Users in Supabase dashboard
2. Click "Add user" > "Create new user"
3. Enter:
   - Email: `info@wazireducationsocity.com`
   - Password: `WES@OneDesk786`
   - Confirm email: Yes
4. Go to SQL Editor and run:
```sql
-- Get the user_id from auth.users
SELECT id FROM auth.users WHERE email = 'info@wazireducationsocity.com';

-- Insert into user_roles (replace USER_ID with the actual ID)
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID', 'admin');

-- Insert into employee_profiles (replace USER_ID with the actual ID)
INSERT INTO public.employee_profiles (user_id, email, first_name, last_name, designation, department)
VALUES ('USER_ID', 'info@wazireducationsocity.com', 'Admin', 'User', 'System Administrator', 'Administration');
```

## Default Admin Credentials

After setup, login with:
- **Email**: `info@wazireducationsocity.com`
- **Password**: `WES@OneDesk786`

## Running the Application

### Development
```bash
npm run dev
```
Visit: http://localhost:3000

### Production Build
```bash
npm run build
npm start
```

## Troubleshooting Login Issues

If login is not working, check the following:

1. **Open Browser Console** (F12) and check for errors
2. **Verify Supabase Connection**:
   - Check if the Supabase URL is correct
   - Verify the anon key is valid
   - Ensure your Supabase project is active

3. **Check if Admin User Exists**:
   - Go to Supabase Dashboard > Authentication > Users
   - Look for `info@wazireducationsocity.com`
   - If not found, create it using Method 2 above

4. **Verify Database Tables**:
   - Go to Supabase Dashboard > Table Editor
   - Ensure these tables exist:
     - `user_roles`
     - `employee_profiles`
   - If not, run the migrations

5. **Check Console Logs**:
   - The app now has debug logging enabled
   - Check browser console for detailed error messages
   - Look for "signIn called with email:" and "Supabase signIn response:"

6. **Common Errors**:
   - "Invalid login credentials" → User doesn't exist or wrong password
   - "Network error" → Supabase URL or key is incorrect
   - "User not found" → Admin user not created in database

## Next Steps After Login

1. Change the default admin password
2. Create additional users via the Employees page
3. Configure institutions and departments
4. Set up manager assignments
