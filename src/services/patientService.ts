/**
 * patientService.ts
 * Uses Supabase for persistence.
 */

import { supabase } from '../lib/supabaseClient';
import type { SavedPatientRecord } from '../types';

const TABLE_NAME = 'patients';

// ─── Mappings ────────────────────────────────────────────────────────────
function mapFromDB(row: any): SavedPatientRecord {
  return {
    id: row.id,
    clinicId: row.clinic_id,
    doctorId: row.doctor_id,
    savedAt: row.updated_at || row.created_at || new Date().toISOString(),
    patientData: row.patient_data || {},
    recommendations: row.recommendations?.core || row.recommendations || {},
    prescriptions: row.recommendations?.prescriptions || [],
    selectedLabs: row.recommendations?.selectedLabs || [],
    selectedImaging: row.recommendations?.selectedImaging || [],
    customLabs: row.recommendations?.customLabs || [],
    customImaging: row.recommendations?.customImaging || [],
  };
}

function mapToDB(record: SavedPatientRecord) {
  return {
    id: record.id,
    clinic_id: record.clinicId,
    doctor_id: record.doctorId,
    patient_id_label: record.patientData?.patientId || '',
    patient_name: record.patientData?.patientName || 'Unknown',
    phone_number: record.patientData?.phoneNumber || '',
    age: record.patientData?.age || '',
    gender: record.patientData?.gender || '',
    patient_data: record.patientData,
    recommendations: {
      core: record.recommendations,
      prescriptions: record.prescriptions,
      selectedLabs: record.selectedLabs,
      selectedImaging: record.selectedImaging,
      customLabs: record.customLabs,
      customImaging: record.customImaging,
    },
    updated_at: record.savedAt || new Date().toISOString(),
  };
}

// ─── Get all patient records ──────────────────────────────────────────────────
export async function getPatients(clinicId?: string): Promise<SavedPatientRecord[]> {
  let query = supabase.from(TABLE_NAME).select('*').order('updated_at', { ascending: false });
  
  if (clinicId) {
    query = query.eq('clinic_id', clinicId);
  }

  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
  
  return (data || []).map(mapFromDB);
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
        filter: `clinic_id=eq.${clinicId}`
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
    .upsert(mapToDB(record));

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
    .eq('clinic_id', clinicId);

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
    .upsert(records.map(mapToDB));

  if (error) {
    console.error('Error batch saving patients:', error);
    throw error;
  }
}



