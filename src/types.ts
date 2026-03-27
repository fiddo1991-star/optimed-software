export interface DoctorProfile {
  id: string;
  doctorName: string;
  doctorTitle: string;
  specialization: string;
  currentDesignation?: string;
  licenseNumber: string;
}

export interface ClinicInfo {
  clinicName: string;
  address: string;
  phone: string;
  email: string;
  logoDataUrl: string;
  headerSubtitle: string;
  footerText: string;
  doctors: DoctorProfile[];
  activeDoctorId: string;
  reportTemplates?: { id: string; name: string; config: ReportLayoutConfig }[];
  splashSettings?: {
    title: string;
    subtitle: string;
    loadingText: string;
    showSplash: boolean;
  };
}

export interface PatientData {
  patientName: string;
  patientId: string;
  phoneNumber: string;
  age: string;
  gender: string;
  chiefComplaint: string;
  symptoms: string[];
  customSymptoms: string;
  medicalHistory: string[];
  customPMH: string;
  currentMedications: string;
  allergies: string;
  vitalSigns: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    oxygenSaturation: string;
    respiratoryRate: string;
    weight: string;
    heightInches?: string;
    printHeightInches?: boolean;
  };
  previousLabs: string;
  diagnosticFindings: string;
}

export interface Diagnosis {
  name: string;
  icdCode: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  notes: string;
}

export interface LabTest {
  name: string;
  reason: string;
  priority: string;
}

export interface ImagingStudy {
  name: string;
  reason: string;
  priority: string;
}

export interface PrescriptionItem {
  medicineName: string;
  dosage: string;
  morning: string;
  noon: string;
  evening: string;
  night: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionTemplate {
  id: string;
  name: string;
  prescriptions: PrescriptionItem[];
}

export interface Recommendations {
  diagnoses: Diagnosis[];
  medications: Medication[];
  labTests: LabTest[];
  imagingStudies: ImagingStudy[];
  clinicalNotes: string[];
  instructions: string;
  warnings: string[];
  followUpDate?: string;
}

export interface TextStyleConfig {
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right' | 'justify';
}

export interface ReportLayoutConfig {
  templateStyle?: 'solid-basic' | 'solid-dark' | 'solid-boxed';
  logoTemplate?: 'hospital' | 'cross' | 'heart';
  layoutStyle: 'compact' | 'standard' | 'detailed';
  fontSize: number;
  fontFamily?: string;
  lineSpacing?: string;
  colorTheme: string;
  showLogo: boolean;
  showBorder: boolean;
  showWatermark?: boolean;
  watermarkOpacity?: number;
  watermarkSize?: number;
  prescriptionStyle?: 'table' | 'list';
  pageSize?: 'A4' | 'A5' | 'Letter';
  orientation?: 'portrait' | 'landscape';
  margins?: { top: string; bottom: string; left: string; right: string };
  sections: { id: string; label: string; visible: boolean; locked?: boolean }[];
  textStyles?: {
    globalFont?: string;
    globalFontSize?: number;
    globalColor?: string;

    headerFontSize?: number;
    headerColor?: string;
    headerBold?: boolean;
    headerBgColor?: string;

    tableHeaderFontSize?: number;
    tableHeaderColor?: string;
    tableHeaderBold?: boolean;
    tableBorderColor?: string;

    labelFont?: string;
    labelFontSize?: number;
    labelColor?: string;
    labelBold?: boolean;

    sections?: Record<string, TextStyleConfig>;
  };
}

export interface SavedPatientRecord {
  id: string;
  savedAt: string;
  doctorId: string;
  patientData: PatientData;
  recommendations: Recommendations;
  prescriptions: PrescriptionItem[];
  selectedLabs: string[];
  selectedImaging: string[];
  customLabs: string[];
  customImaging: string[];
  clinicId: string; // Added clinic_id for data isolation
}

export type UserRole = 'admin' | 'doctor' | 'receptionist';

export interface User {
  id: string;
  clinicId: string;
  full_name: string;
  username?: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  pin_code?: string; // 4-digit PIN for quick login
  isTestUser?: boolean;
  createdAt: string;
}

export type UserProfile = User;


export interface LoginResponse {
  success: boolean;
  user?: User;
  clinic?: Clinic;
  error?: string;
}

export interface Clinic {
  id: string;
  clinicName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  sessionUser?: any | null;
  clinic: Clinic | null;
  loading: boolean;
  error: string | null;
}

