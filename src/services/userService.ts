/**
 * userService.ts
 * Supabase integration for staff/user profile management.
 */

import { supabase } from '../lib/supabaseClient';
import type { User } from '../types';

const PROFILE_TABLE = 'profiles';

export async function getUserProfile(uid: string): Promise<User | null> {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select('*')
    .eq('id', uid)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  if (data) {
    (data as any).isTestUser = (data.is_test_user === true);
    (data as any).clinicId = data.clinicid;
  }
  return data as User | null;
}

export async function getProfilesByClinic(clinicId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select('*')
    .eq('clinicid', clinicId);

  if (error) {
    console.error('Error fetching clinic users:', error);
    return [];
  }

  return (data || []).map(row => ({
    ...row,
    isTestUser: row.is_test_user === true,
    clinicId: row.clinicid
  })) as User[];
}


/**
 * Creates a profile for an existing Supabase Auth user.
 */
export async function createProfile(
  profile: Omit<User, 'createdAt'>
): Promise<void> {
  const { error } = await supabase
    .from(PROFILE_TABLE)
    .upsert({
      id: profile.id,
      clinicid: profile.clinicId,
      full_name: profile.full_name,
      role: profile.role,
      status: profile.status || 'active',
      pin_code: profile.pin_code,
      is_test_user: profile.isTestUser || false,
      created_at: new Date().toISOString()
    });

  if (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<User>
): Promise<void> {
  const { error } = await supabase
    .from(PROFILE_TABLE)
    .update(updates)
    .eq('id', uid);

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
}

export async function deleteClinicUser(uid: string): Promise<void> {
  // Note: This only deletes the profile. To delete the user completely, 
  // you must also delete them from Supabase Auth (usually via Edge Functions or Admin API).
  const { error } = await supabase
    .from(PROFILE_TABLE)
    .delete()
    .eq('id', uid);

  if (error) {
    console.error('Error deleting profile:', error);
    throw error;
  }
}

export interface StoredUser extends User {
  password?: string;
}

export async function getClinicUsers(clinicId: string): Promise<StoredUser[]> {
  const profiles = await getProfilesByClinic(clinicId);
  return profiles.map(p => ({ ...p, email: p.email || (p.username ? `${p.username}@clinic.local` : '') }));
}

export async function createClinicUser(emailOrUser: string, password: string, profile: Omit<User, 'id' | 'createdAt'>): Promise<void> {
  const email = emailOrUser.includes('@') ? emailOrUser : `${emailOrUser}@optimed.clinic`;
  
  // Create auth user
  const { data, error: authError } = await supabase.auth.signUp({ 
    email, 
    password,
    options: { data: { full_name: profile.full_name, clinic_id: profile.clinicId } }
  });

  if (authError) throw authError;
  if (!data.user) throw new Error('Failed to create auth user');

  // Create profile
  await createProfile({ ...profile, id: data.user.id });
}

export async function getUserByPin(
  clinicId: string,
  pin: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select('*')
    .eq('clinicid', clinicId)
    .eq('pin_code', pin)
    .eq('status', 'active')
    .maybeSingle();


  if (error) {
    console.error('Error fetching user by PIN:', error);
    return null;
  }

  if (data) {
    (data as any).isTestUser = (data.is_test_user === true);
    (data as any).clinicId = data.clinicid;
  }
  return data as User | null;
}

export async function ensureTestUser(): Promise<void> {
  // Logic usually handled in seed scripts or Supabase dashboard
}


