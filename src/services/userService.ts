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

  return data as User | null;
}

export async function getProfilesByClinic(clinicId: string): Promise<User[]> {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select('*')
    .eq('clinicId', clinicId);

  if (error) {
    console.error('Error fetching clinic users:', error);
    return [];
  }

  return (data || []) as User[];
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
      ...profile,
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

export async function getUserByPin(
  clinicId: string,
  pin: string
): Promise<User | null> {
  const { data, error } = await supabase
    .from(PROFILE_TABLE)
    .select('*')
    .eq('clinicId', clinicId)
    .eq('pin_code', pin)
    .eq('status', 'active')
    .maybeSingle();


  if (error) {
    console.error('Error fetching user by PIN:', error);
    return null;
  }

  return data as User | null;
}

export async function ensureTestUser(): Promise<void> {
  // Logic usually handled in seed scripts or Supabase dashboard
}


