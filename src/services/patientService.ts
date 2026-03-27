/**
 * patientService.ts
 * Uses Supabase for persistence.
 */

import { supabase } from '../lib/supabaseClient';
import type { SavedPatientRecord } from '../types';

const TABLE_NAME = 'patients';

// ─── Get all patient records ──────────────────────────────────────────────────
export async function getPatients(clinicId?: string): Promise<SavedPatientRecord[]> {
  let query = supabase.from(TABLE_NAME).select('*').order('savedAt', { ascending: false });
  
  if (clinicId) {
    query = query.eq('clinicId', clinicId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
  
  return (data || []) as SavedPatientRecord[];
}

// ─── Real-time listener ──────────────────────────────────────────────────────
export function subscribeToPatients(
  clinicId: string,
  onChange: (records: SavedPatientRecord[]) => void
): () => void {
  // Initial load
  getPatients(clinicId).then(onChange);

  // Subscribe to changes
  const channel = supabase
    .channel('patients_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: TABLE_NAME,
        filter: `clinicId=eq.${clinicId}`
      },
      () => {
        getPatients(clinicId).then(onChange);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ─── Save / update a patient record ──────────────────────────────────────────
export async function savePatient(_clinicId: string, record: SavedPatientRecord): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(record);

  if (error) {
    console.error('Error saving patient:', error);
    throw error;
  }
}

// ─── Delete a patient record ──────────────────────────────────────────────────
export async function deletePatient(_clinicId: string, patientId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', patientId);

  if (error) {
    console.error('Error deleting patient:', error);
    throw error;
  }
}

// ─── Delete all patient records ───────────────────────────────────────────────
export async function deleteAllPatients(clinicId: string): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('clinicId', clinicId);

  if (error) {
    console.error('Error deleting all patients:', error);
    throw error;
  }
}

// ─── Batch write ──────────────────────────────────────────────────────────────
export async function batchSavePatients(
  _clinicId: string,
  records: SavedPatientRecord[]
): Promise<void> {
  const { error } = await supabase
    .from(TABLE_NAME)
    .upsert(records);

  if (error) {
    console.error('Error batch saving patients:', error);
    throw error;
  }
}



