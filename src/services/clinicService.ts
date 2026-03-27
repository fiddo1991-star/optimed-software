/**
 * clinicService.ts
 * Uses Supabase for persistence.
 */

import { supabase } from '../lib/supabaseClient';
import type { ClinicInfo, ReportLayoutConfig } from '../types';

const CLINIC_TABLE = 'clinics';

// ─── Clinic Record ────────────────────────────────────────────────────────────
export async function getClinic(clinicId: string): Promise<any | null> {
  const { data, error } = await supabase
    .from(CLINIC_TABLE)
    .select('*')
    .eq('id', clinicId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching clinic:', error);
    return null;
  }

  return data;
}

// ─── Clinic Info ──────────────────────────────────────────────────────────────
export async function getClinicInfo(clinicId: string): Promise<ClinicInfo | null> {
  const { data, error } = await supabase
    .from(CLINIC_TABLE)
    .select('clinic_info')
    .eq('id', clinicId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching clinic info:', error);
    return null;
  }

  return data?.clinic_info as ClinicInfo | null;
}


export async function saveClinicInfo(clinicId: string, info: ClinicInfo): Promise<void> {
  const { error } = await supabase
    .from(CLINIC_TABLE)
    .update({ clinic_info: info })
    .eq('id', clinicId);

  if (error) {
    console.error('Error saving clinic info:', error);
    throw error;
  }
}

// ─── Report Layout ────────────────────────────────────────────────────────────
export async function getReportLayout(clinicId: string): Promise<ReportLayoutConfig | null> {
  const { data, error } = await supabase
    .from(CLINIC_TABLE)
    .select('report_layout')
    .eq('id', clinicId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching report layout:', error);
    return null;
  }

  return data?.report_layout as ReportLayoutConfig | null;
}

export async function saveReportLayout(clinicId: string, layout: ReportLayoutConfig): Promise<void> {
  const { error } = await supabase
    .from(CLINIC_TABLE)
    .update({ report_layout: layout })
    .eq('id', clinicId);

  if (error) {
    console.error('Error saving report layout:', error);
    throw error;
  }
}



