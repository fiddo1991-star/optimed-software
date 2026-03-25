import type { SavedPatientRecord, PrescriptionItem, PatientData, Recommendations } from "../types";

/**
 * Returns exactly ONE richly detailed demo patient record for the test account.
 * Patient: Ahmed Khan, 45M — Hypertension + Diabetes Mellitus (complex case).
 */
export function generateDummyPatients(
  doctorIds: string[],
): SavedPatientRecord[] {
  const doctorId = doctorIds[0] || 'doc-test-1';

  const patientData: PatientData = {
    patientName: 'Ahmed Khan',
    patientId: 'PT-2024-0001',
    phoneNumber: '+92 300 1234567',
    age: '45',
    gender: 'Male',
    chiefComplaint: 'Persistent headaches, elevated blood pressure readings at home, and increased thirst with frequent urination for the past 3 weeks.',
    symptoms: ['Headache', 'Dizziness', 'Frequent Urination', 'Excessive Thirst', 'Fatigue', 'Blurred Vision'],
    customSymptoms: 'occasional palpitations, tingling in feet, mild swelling in ankles',
    medicalHistory: ['Hypertension', 'Diabetes Mellitus'],
    customPMH: 'Father: HTN, DM2. Mother: Stroke at age 62.',
    currentMedications: 'Amlodipine 5mg OD (self-discontinued 2 weeks ago)',
    allergies: 'Penicillin (rash), Sulfonamides',
    vitalSigns: {
      bloodPressure: '148/92',
      heartRate: '84',
      temperature: '37.1',
      oxygenSaturation: '97',
      respiratoryRate: '18',
      weight: '82',
    },
    previousLabs: 'HbA1c: 8.4% (3 months ago). Lipid Panel: Total Cholesterol 242 mg/dL, LDL 164 mg/dL, HDL 38 mg/dL. Creatinine 1.1 mg/dL. eGFR 72. Urine microalbumin: 42 mg/g (mildly elevated).',
    diagnosticFindings: 'Fundoscopy: early background diabetic retinopathy. Peripheral neuropathy signs on monofilament testing. Ankle pitting oedema (+1) bilateral.',
  };

  const recommendations: Recommendations = {
    diagnoses: [
      { name: 'Essential Hypertension — Uncontrolled', icdCode: 'I10', confidence: 'High' },
      { name: 'Type 2 Diabetes Mellitus — Poorly Controlled', icdCode: 'E11.9', confidence: 'High' },
      { name: 'Hypertensive Heart Disease', icdCode: 'I11.9', confidence: 'Medium' },
      { name: 'Early Diabetic Nephropathy', icdCode: 'E11.65', confidence: 'Medium' },
      { name: 'Dyslipidaemia (Mixed)', icdCode: 'E78.5', confidence: 'High' },
    ],
    medications: [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily (morning)', route: 'Oral', duration: 'Ongoing', notes: 'CCB — resume immediately, do not discontinue' },
      { name: 'Losartan', dosage: '50mg', frequency: 'Once daily (evening)', route: 'Oral', duration: 'Ongoing', notes: 'ARB — nephroprotective in DM, also lowers BP' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily with meals', route: 'Oral', duration: 'Ongoing', notes: 'Take with breakfast and dinner to reduce GI upset' },
      { name: 'Glimepiride', dosage: '2mg', frequency: 'Once daily before breakfast', route: 'Oral', duration: 'Ongoing', notes: 'Sulfonylurea — monitor for hypoglycemia' },
      { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily at night', route: 'Oral', duration: 'Ongoing', notes: 'Statin — take at bedtime for best efficacy' },
      { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily after breakfast', route: 'Oral', duration: 'Ongoing', notes: 'Antiplatelet — cardiovascular risk reduction' },
    ],
    labTests: [
      { name: 'HbA1c', reason: 'Monitor glycaemic control', priority: 'urgent' },
      { name: 'Fasting Blood Glucose', reason: 'Baseline glucose assessment', priority: 'urgent' },
      { name: 'Renal Function Panel (Urea, Creatinine, eGFR)', reason: 'Monitor nephropathy progression', priority: 'urgent' },
      { name: 'Urine Microalbumin / Creatinine Ratio', reason: 'Early nephropathy detection', priority: 'routine' },
      { name: 'Lipid Panel (Total, LDL, HDL, TG)', reason: 'Cardiovascular risk assessment', priority: 'routine' },
      { name: 'Serum Electrolytes (Na, K, Cl)', reason: 'Monitor with ARB therapy', priority: 'routine' },
      { name: 'Liver Function Tests (LFTs)', reason: 'Statin safety monitoring', priority: 'routine' },
      { name: 'TSH (Thyroid Stimulating Hormone)', reason: 'Rule out thyroid cause of fatigue', priority: 'routine' },
      { name: 'Complete Blood Count (CBC)', reason: 'Baseline haematology', priority: 'routine' },
    ],
    imagingStudies: [
      { name: 'ECG (12-lead)', reason: 'Cardiac assessment for HTN + chest symptoms', priority: 'urgent' },
      { name: 'Echocardiography (TTE)', reason: 'Assess for hypertensive heart disease', priority: 'routine' },
      { name: 'Fundoscopy (Retinal examination)', reason: 'Diabetic retinopathy screening', priority: 'routine' },
      { name: 'Renal Ultrasound', reason: 'Morphological renal assessment', priority: 'routine' },
    ],
    clinicalNotes: [
      'Patient self-discontinued antihypertensive — counselled on importance of medication adherence.',
      'Target BP: <130/80 mmHg (ADA guidelines for coexisting DM + HTN).',
      'Target HbA1c: <7.0% for this patient profile.',
      'Annual urine microalbumin screening initiated for early nephropathy detection.',
      'Foot examination performed — mild peripheral neuropathy signs noted bilaterally.',
      'Refer to ophthalmology for annual diabetic retinopathy screening.',
      'Dietary counseling provided — low sodium, low glycaemic index diet.',
      'BMI 27.7 — weight management advice given, target BMI <25 kg/m².',
      'Social history: sedentary office worker — advised minimum 30 min brisk walking daily.',
    ],
    warnings: [
      '⚠️ BP 148/92 mmHg — significantly elevated, immediate medication resumption required.',
      '⚠️ Blood glucose likely elevated — fasting labs ordered urgently.',
      '⚠️ Patient non-adherent to medications — compliance counseling essential.',
      '⚠️ Early diabetic nephropathy signs — avoid NSAIDs, maintain hydration.',
    ],
    instructions: 'اپنا بلڈ پریشر اور بلڈ شوگر روزانہ گھر پر چیک کریں اور ریکارڈ رکھیں۔ تمام دوائیں بغیر ڈاکٹر کی اجازت کے بند نہ کریں۔ نمک اور چینی کا استعمال بالکل کم کریں۔ تلی ہوئی اور چکنائی والی غذاؤں سے پرہیز کریں۔ سفید آٹا، چاول اور میٹھے مشروبات سے پرہیز کریں۔ سبزیاں، دالیں اور گندم کی روٹی استعمال کریں۔ روزانہ 30 منٹ چہل قدمی کریں۔ وزن کم کرنے کی کوشش کریں۔ آنکھوں اور گردوں کا معائنہ وقت پر کروائیں۔ پاؤں کی صفائی اور معائنہ روزانہ کریں۔ 2 ہفتوں بعد فالو اپ کے لیے آئیں۔',
    followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };

  const prescriptions: PrescriptionItem[] = [
    { medicineName: 'Amlodipine', dosage: '5mg', morning: '1', noon: '0', evening: '0', night: '0', duration: 'Ongoing', instructions: 'CCB — do not stop without doctor advice' },
    { medicineName: 'Losartan', dosage: '50mg', morning: '0', noon: '0', evening: '1', night: '0', duration: 'Ongoing', instructions: 'ARB — nephroprotective, take in evening' },
    { medicineName: 'Metformin', dosage: '500mg', morning: '1', noon: '0', evening: '1', night: '0', duration: 'Ongoing', instructions: 'Take with meals to reduce nausea' },
    { medicineName: 'Glimepiride', dosage: '2mg', morning: '1', noon: '0', evening: '0', night: '0', duration: 'Ongoing', instructions: 'Before breakfast — watch for low blood sugar' },
    { medicineName: 'Atorvastatin', dosage: '40mg', morning: '0', noon: '0', evening: '0', night: '1', duration: 'Ongoing', instructions: 'Statin — take at bedtime for best effect' },
    { medicineName: 'Aspirin', dosage: '75mg', morning: '1', noon: '0', evening: '0', night: '0', duration: 'Ongoing', instructions: 'After breakfast — do not take on empty stomach' },
  ];

  const record: SavedPatientRecord = {
    id: 'demo-001',
    savedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    doctorId,
    clinicId: 'clinic-test',
    patientData,
    recommendations,
    prescriptions,
    selectedLabs: [
      'HbA1c',
      'Fasting Blood Glucose',
      'Renal Function Panel (Urea, Creatinine, eGFR)',
      'Urine Microalbumin / Creatinine Ratio',
      'Lipid Panel (Total, LDL, HDL, TG)',
      'Serum Electrolytes (Na, K, Cl)',
      'Liver Function Tests (LFTs)',
      'TSH (Thyroid Stimulating Hormone)',
      'Complete Blood Count (CBC)',
    ],
    selectedImaging: [
      'ECG (12-lead)',
      'Echocardiography (TTE)',
      'Fundoscopy (Retinal examination)',
      'Renal Ultrasound',
    ],
    customLabs: [],
    customImaging: [],
  };

  return [record];
}
