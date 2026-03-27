-- SECURITY POLICIES (RLS)
-- This script grants permissions so your app can actually talk to the database.

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
  id IN (SELECT clinicId FROM public.profiles WHERE id = auth.uid())
);

-- Allow users to update their own clinic
CREATE POLICY "Users can update their own clinic" 
ON public.clinics FOR UPDATE 
TO authenticated 
USING (
  id IN (SELECT clinicId FROM public.profiles WHERE id = auth.uid())
);

-- 2. PROFILES POLICIES
-- Allow users to create their own profile
CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Allow users to see profiles in the same clinic
CREATE POLICY "Users can see clinic profiles" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (
  clinicId IN (SELECT clinicId FROM public.profiles WHERE id = auth.uid())
);

-- 3. PATIENTS & LIBRARIES POLICIES
-- Only allow access to data belonging to the user's clinic
CREATE POLICY "Clinic data access - Patients" 
ON public.patients FOR ALL 
TO authenticated 
USING (clinic_id IN (SELECT clinicId FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Clinic data access - Libraries" 
ON public.libraries FOR ALL 
TO authenticated 
USING (clinic_id IN (SELECT clinicId FROM public.profiles WHERE id = auth.uid()));
