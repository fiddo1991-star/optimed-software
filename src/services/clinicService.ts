/**
 * clinicService.ts
 * Uses localStorage for persistence in web environments (e.g., Vercel).
 */

import type { ClinicInfo, ReportLayoutConfig } from '../types';

// ─── Clinic Info ──────────────────────────────────────────────────────────────
export async function getClinicInfo(): Promise<ClinicInfo | null> {
  const data = localStorage.getItem('clinicInfo');
  return data ? JSON.parse(data) : null;
}

export async function saveClinicInfo(_clinicId: string, info: ClinicInfo): Promise<void> {
  localStorage.setItem('clinicInfo', JSON.stringify(info));
}

// ─── Report Layout ────────────────────────────────────────────────────────────
export async function getReportLayout(): Promise<ReportLayoutConfig | null> {
  const data = localStorage.getItem('reportLayout');
  return data ? JSON.parse(data) : null;
}

export async function saveReportLayout(_clinicId: string, layout: ReportLayoutConfig): Promise<void> {
  localStorage.setItem('reportLayout', JSON.stringify(layout));
}


