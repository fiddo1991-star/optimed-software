/**
 * patientService.ts
 * Uses localStorage for persistence in web environments (e.g., Vercel).
 */

import type { SavedPatientRecord } from '../types';

const STORAGE_KEY = 'medassist_patients';

// ─── Get all patient records ──────────────────────────────────────────────────
export async function getPatients(): Promise<SavedPatientRecord[]> {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

// ─── Real-time listener (Uses polling for localStorage) ───────────────────────
export function subscribeToPatients(
  _clinicId: string,
  onChange: (records: SavedPatientRecord[]) => void
): () => void {
  // Initial load
  getPatients().then(onChange);

  // Poll for changes (since localStorage doesn't have a cross-tab listener by default without 'storage' event)
  const interval = setInterval(() => {
    getPatients().then(onChange);
  }, 2000);

  return () => clearInterval(interval);
}

// ─── Save / update a patient record ──────────────────────────────────────────
export async function savePatient(_clinicId: string, record: SavedPatientRecord): Promise<void> {
  const all = await getPatients();
  const index = all.findIndex(r => r.id === record.id);
  if (index >= 0) {
    all[index] = record;
  } else {
    all.unshift(record);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// ─── Delete a patient record ──────────────────────────────────────────────────
export async function deletePatient(_clinicId: string, patientId: string): Promise<void> {
  let all = await getPatients();
  all = all.filter(r => r.id !== patientId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

// ─── Delete all patient records ───────────────────────────────────────────────
export async function deleteAllPatients(_clinicId: string): Promise<void> {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Batch write ──────────────────────────────────────────────────────────────
export async function batchSavePatients(
  _clinicId: string,
  records: SavedPatientRecord[]
): Promise<void> {
  const all = await getPatients();
  const merged = [...records, ...all.filter(a => !records.some(r => r.id === a.id))];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}


