-- OPTIMED SOFTWARE: SUPABASE DATABASE SCHEMA
-- This script sets up the tables for clinic management, user profiles, and clinical libraries.

-- 1. CLINICS TABLE
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_name TEXT NOT NULL,
    owner_name TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    report_layout JSONB DEFAULT '{}'::jsonb, -- Stores header/footer/styles
    clinic_info JSONB DEFAULT '{}'::jsonb          -- Stores other metadata
);


-- 2. STAFF PROFILES TABLE
-- Maps Supabase Auth users to their specific roles and clinics
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    clinicId UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'doctor', 'receptionist')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    pin_code TEXT, -- 4-digit PIN for quick login
    is_test_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 3. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS public.patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES public.profiles(id),
    patient_id_label TEXT, -- Your internal ID format
    patient_name TEXT NOT NULL,
    phone_number TEXT,
    age TEXT,
    gender TEXT,
    patient_data JSONB NOT NULL,    -- Stores chief complaint, symptoms, vital signs, etc.
    recommendations JSONB NOT NULL, -- Stores diagnoses, meds, lab tests
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CLINICAL LIBRARIES TABLE
-- Stores shared presets for medicines, symptoms, instructions, etc.
CREATE TABLE IF NOT EXISTS public.libraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'medicines', 'symptoms', 'labs', 'instructions'
    title TEXT NOT NULL,
    content JSONB NOT NULL, -- Specific details of the library item
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(clinic_id, category, title)
);

-- 5. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_profiles_clinic ON public.profiles(clinicId);
CREATE INDEX IF NOT EXISTS idx_patients_clinic ON public.patients(clinic_id);
CREATE INDEX IF NOT EXISTS idx_libraries_clinic_category ON public.libraries(clinic_id, category);

-- 6. RLS (Row Level Security) - Basic Setup
-- Enable RLS on all tables
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.libraries ENABLE ROW LEVEL SECURITY;

-- Note: You should add specific policies to ensure clinics only see their own data.
-- For now, this script ensures the tables exist so the app can connect.
