-- SECURITY POLICIES (RLS)
-- This script grants permissions so your app can actually talk to the database.

-- Function to safely get user's clinic ID without causing infinite recursion in RLS
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT clinicid FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop all existing policies before recreating them to prevent conflicts
DROP POLICY IF EXISTS "Allow authenticated clinic creation" ON public.clinics;
DROP POLICY IF EXISTS "Users can see their own clinic" ON public.clinics;
DROP POLICY IF EXISTS "Users can update their own clinic" ON public.clinics;
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can see clinic profiles" ON public.profiles;
DROP POLICY IF EXISTS "Clinic data access - Patients" ON public.patients;
DROP POLICY IF EXISTS "Clinic data access - Libraries" ON public.libraries;

-- 1. CLINICS POLICIES
-- Allow any authenticated user to create a clinic during setup
CREATE POLICY "Allow authenticated clinic creation" 
ON public.clinics FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow users to see their own clinic
CREATE POLICY "Users can see their own clinic" 
ON public.clinics FOR SELECT 
TO authenticated 
USING (
  id = get_user_clinic_id()
);
CREATE POLICY "Users can update their own clinic" 
ON public.clinics FOR UPDATE 
TO authenticated 
USING (
  id = get_user_clinic_id()
);

-- 2. PROFILES POLICIES
-- Allow users to create their own profile
CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE
TO authenticated 
USING (auth.uid() = id);

-- Allow users to see their own profile and profiles in their clinic
CREATE POLICY "Users can see clinic profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
  id = auth.uid() OR clinicid = get_user_clinic_id()
);

-- 3. PATIENTS & LIBRARIES POLICIES
-- Only allow access to data belonging to the user's clinic
CREATE POLICY "Clinic data access - Patients" 
ON public.patients FOR ALL 
TO authenticated 
USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Clinic data access - Libraries" 
ON public.libraries FOR ALL 
TO authenticated 
USING (clinic_id = get_user_clinic_id());
