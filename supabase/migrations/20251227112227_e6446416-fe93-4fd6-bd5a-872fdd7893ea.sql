-- Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'employee');

-- Create enum for leave status
CREATE TYPE public.leave_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for attendance status
CREATE TYPE public.attendance_status AS ENUM ('pending', 'approved', 'rejected');

-- Create user_roles table (separate from auth.users for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'employee',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create employee_profiles table with 45+ fields
CREATE TABLE public.employee_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Personal Information
    employee_id TEXT UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    alternate_phone TEXT,
    date_of_birth DATE,
    gender TEXT,
    marital_status TEXT,
    blood_group TEXT,
    nationality TEXT DEFAULT 'Indian',
    religion TEXT,
    caste TEXT,
    
    -- Address Information
    current_address TEXT,
    current_city TEXT,
    current_state TEXT,
    current_pincode TEXT,
    permanent_address TEXT,
    permanent_city TEXT,
    permanent_state TEXT,
    permanent_pincode TEXT,
    
    -- Employment Information
    institution_assignment TEXT, -- Free text: DPS, CLAS, WESA, etc.
    department TEXT,
    designation TEXT,
    employment_type TEXT DEFAULT 'Full-time',
    date_of_joining DATE,
    probation_end_date DATE,
    confirmation_date DATE,
    
    -- Compensation
    base_salary DECIMAL(12,2) DEFAULT 0,
    bank_name TEXT,
    bank_account_number TEXT,
    bank_ifsc_code TEXT,
    pan_number TEXT,
    
    -- Identity Documents
    aadhar_number TEXT,
    passport_number TEXT,
    passport_expiry DATE,
    driving_license TEXT,
    
    -- Emergency Contact
    emergency_contact_name TEXT,
    emergency_contact_phone TEXT,
    emergency_contact_relation TEXT,
    
    -- Education
    highest_qualification TEXT,
    university TEXT,
    year_of_passing INTEGER,
    
    -- Additional
    skills TEXT[],
    profile_photo_url TEXT,
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create manager_institutions table (links managers to institutions)
CREATE TABLE public.manager_institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manager_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    institution_name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (institution_name) -- One manager per institution
);

-- Create holidays table
CREATE TABLE public.holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    is_national BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (date)
);

-- Create attendance table
CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    status attendance_status DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    admin_override BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, date)
);

-- Create leaves table
CREATE TABLE public.leaves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    is_emergency BOOLEAN DEFAULT false,
    status leave_status DEFAULT 'pending',
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create salaries table
CREATE TABLE public.salaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL,
    base_salary DECIMAL(12,2) NOT NULL,
    working_days INTEGER NOT NULL,
    present_days INTEGER DEFAULT 0,
    paid_leave_days INTEGER DEFAULT 0,
    absent_days INTEGER DEFAULT 0,
    per_day_salary DECIMAL(12,2),
    final_salary DECIMAL(12,2),
    is_locked BOOLEAN DEFAULT false,
    locked_at TIMESTAMP WITH TIME ZONE,
    locked_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, month, year)
);

-- Create announcements table
CREATE TABLE public.announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_org_wide BOOLEAN DEFAULT true,
    institution TEXT, -- NULL for org-wide, specific institution for team
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create documents table
CREATE TABLE public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    document_type TEXT NOT NULL, -- aadhar, pan, passport, etc.
    document_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id),
    verified_at TIMESTAMP WITH TIME ZONE
);

-- Create performance_reviews table
CREATE TABLE public.performance_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reviewer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    review_period TEXT NOT NULL, -- e.g., "Q1 2025", "Annual 2025"
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    strengths TEXT,
    areas_of_improvement TEXT,
    goals TEXT,
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- absence_alert, leave_status, salary_reminder, etc.
    is_read BOOLEAN DEFAULT false,
    related_id UUID, -- Optional reference to related entity
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create login_history table
CREATE TABLE public.login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address TEXT,
    user_agent TEXT
);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manager_institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaves ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's institution
CREATE OR REPLACE FUNCTION public.get_user_institution(_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT institution_assignment
  FROM public.employee_profiles
  WHERE user_id = _user_id
$$;

-- Function to check if user is manager of an institution
CREATE OR REPLACE FUNCTION public.is_manager_of_institution(_user_id UUID, _institution TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.manager_institutions
    WHERE manager_user_id = _user_id
      AND institution_name = _institution
  )
$$;

-- Function to check if user is manager of another user
CREATE OR REPLACE FUNCTION public.is_manager_of_user(_manager_id UUID, _employee_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.manager_institutions mi
    JOIN public.employee_profiles ep ON ep.institution_assignment = mi.institution_name
    WHERE mi.manager_user_id = _manager_id
      AND ep.user_id = _employee_id
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for employee_profiles
CREATE POLICY "Users can view their own profile"
ON public.employee_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.employee_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles"
ON public.employee_profiles FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view team profiles"
ON public.employee_profiles FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager') 
  AND public.is_manager_of_institution(auth.uid(), institution_assignment)
);

-- RLS Policies for manager_institutions
CREATE POLICY "Anyone can view manager assignments"
ON public.manager_institutions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage manager assignments"
ON public.manager_institutions FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for holidays
CREATE POLICY "Anyone can view holidays"
ON public.holidays FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage holidays"
ON public.holidays FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for attendance
CREATE POLICY "Users can view their own attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attendance"
ON public.attendance FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all attendance"
ON public.attendance FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view team attendance"
ON public.attendance FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager')
  AND public.is_manager_of_user(auth.uid(), user_id)
);

CREATE POLICY "Managers can update team attendance"
ON public.attendance FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager')
  AND public.is_manager_of_user(auth.uid(), user_id)
);

-- RLS Policies for leaves
CREATE POLICY "Users can view their own leaves"
ON public.leaves FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own leaves"
ON public.leaves FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their pending leaves"
ON public.leaves FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND status = 'pending');

CREATE POLICY "Admins can manage all leaves"
ON public.leaves FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view team leaves"
ON public.leaves FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager')
  AND public.is_manager_of_user(auth.uid(), user_id)
);

CREATE POLICY "Managers can update team leaves"
ON public.leaves FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager')
  AND public.is_manager_of_user(auth.uid(), user_id)
);

-- RLS Policies for salaries
CREATE POLICY "Users can view their own locked salary"
ON public.salaries FOR SELECT
TO authenticated
USING (auth.uid() = user_id AND is_locked = true);

CREATE POLICY "Admins can manage all salaries"
ON public.salaries FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view team locked salaries"
ON public.salaries FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager')
  AND public.is_manager_of_user(auth.uid(), user_id)
  AND is_locked = true
);

-- RLS Policies for announcements
CREATE POLICY "Users can view active announcements"
ON public.announcements FOR SELECT
TO authenticated
USING (
  is_active = true
  AND (
    is_org_wide = true
    OR institution = public.get_user_institution(auth.uid())
  )
);

CREATE POLICY "Admins can manage all announcements"
ON public.announcements FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can create team announcements"
ON public.announcements FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'manager')
  AND is_org_wide = false
  AND public.is_manager_of_institution(auth.uid(), institution)
);

-- RLS Policies for documents
CREATE POLICY "Users can view their own documents"
ON public.documents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own documents"
ON public.documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all documents"
ON public.documents FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all documents"
ON public.documents FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for performance_reviews
CREATE POLICY "Users can view their own reviews"
ON public.performance_reviews FOR SELECT
TO authenticated
USING (auth.uid() = employee_user_id);

CREATE POLICY "Admins can manage all reviews"
ON public.performance_reviews FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can manage team reviews"
ON public.performance_reviews FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager')
  AND public.is_manager_of_user(auth.uid(), employee_user_id)
);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notifications"
ON public.notifications FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for login_history
CREATE POLICY "Users can view their own login history"
ON public.login_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert login history"
ON public.login_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all login history"
ON public.login_history FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Managers can view team login history"
ON public.login_history FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'manager')
  AND public.is_manager_of_user(auth.uid(), user_id)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER update_employee_profiles_updated_at
    BEFORE UPDATE ON public.employee_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manager_institutions_updated_at
    BEFORE UPDATE ON public.manager_institutions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at
    BEFORE UPDATE ON public.attendance
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leaves_updated_at
    BEFORE UPDATE ON public.leaves
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_salaries_updated_at
    BEFORE UPDATE ON public.salaries
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
    BEFORE UPDATE ON public.announcements
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_reviews_updated_at
    BEFORE UPDATE ON public.performance_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert 2025 Indian National Holidays
INSERT INTO public.holidays (name, date, is_national, description) VALUES
('Republic Day', '2025-01-26', true, 'National holiday celebrating the adoption of the Constitution'),
('Maha Shivaratri', '2025-02-26', true, 'Hindu festival'),
('Holi', '2025-03-14', true, 'Festival of colors'),
('Good Friday', '2025-04-18', true, 'Christian holiday'),
('Eid ul-Fitr', '2025-03-31', true, 'Islamic festival marking end of Ramadan'),
('Buddha Purnima', '2025-05-12', true, 'Buddhist festival'),
('Eid ul-Adha', '2025-06-07', true, 'Islamic festival of sacrifice'),
('Independence Day', '2025-08-15', true, 'National holiday celebrating independence'),
('Janmashtami', '2025-08-16', true, 'Hindu festival celebrating birth of Krishna'),
('Milad un-Nabi', '2025-09-05', true, 'Islamic holiday celebrating Prophet Muhammad birthday'),
('Mahatma Gandhi Jayanti', '2025-10-02', true, 'National holiday celebrating Gandhi birthday'),
('Dussehra', '2025-10-02', true, 'Hindu festival'),
('Diwali', '2025-10-20', true, 'Festival of lights'),
('Guru Nanak Jayanti', '2025-11-05', true, 'Sikh festival'),
('Christmas', '2025-12-25', true, 'Christian holiday')
ON CONFLICT (date) DO NOTHING;

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('employee-documents', 'employee-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for employee documents
CREATE POLICY "Users can upload their own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'employee-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'employee-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Admins can view all documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'employee-documents' AND public.has_role(auth.uid(), 'admin'));