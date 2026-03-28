import type { SavedPatientRecord } from "../types";

/**
 * Returns 5 richly detailed demo patient records with Pakistani demographics.
 */
export function generateDummyPatients(
  doctorIds: string[],
  clinicId: string
): SavedPatientRecord[] {
  const doctorId = doctorIds[0] || 'doc-test-1';

  const patients: SavedPatientRecord[] = [
    // 1. Chronic DM/HTN (Ahmed Khan)
    {
      id: 'demo-001',
      savedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      doctorId,
      clinicId,
      patientData: {
        patientName: 'Muhammad Ahmed Khan',
        patientId: 'PT-KHI-101',
        phoneNumber: '+92 300 1234567',
        age: '52',
        gender: 'Male',
        chiefComplaint: 'Frequent urination and blurred vision for 2 weeks. History of Hypertension.',
        symptoms: ['Frequent Urination', 'Excessive Thirst', 'Blurred Vision', 'Fatigue', 'Weight Loss'],
        customSymptoms: 'Burning sensation in feet (bilateral), polyuria especially at night.',
        medicalHistory: ['Hypertension', 'Diabetes Mellitus Type 2'],
        customPMH: 'Smoker (1 pack/day for 20 years). Father had early MI at age 45. Sedentary lifestyle.',
        currentMedications: 'Tab. Amlodipine 5mg OD, Tab. Lowplat 75mg OD.',
        allergies: 'Sulfa Drugs (Skin Rash)',
        previousLabs: 'HbA1c: 8.4% (3 months ago). Cholesterol: 220 mg/dL. Creatinine: 1.1 mg/dL.',
        vitalSigns: { bloodPressure: '155/95', heartRate: '82', temperature: '98.4', oxygenSaturation: '96', respiratoryRate: '18', weight: '88', heightInches: '69', printHeightInches: true },
        diagnosticFindings: 'Mild pedal edema noted. Decreased sensation in lower extremities (Symmetric). Fundoscopy shows early signs of background retinopathy.'
      },
      recommendations: {
        diagnoses: [{ name: 'Uncontrolled Type 2 Diabetes', icdCode: 'E11.9' }, { name: 'Grade II Hypertension', icdCode: 'I10' }],
        medications: [],
        labTests: [
          { name: 'HbA1c', reason: 'Assess control', priority: 'High' }, 
          { name: 'Fasting Lipid Profile', reason: 'Baseline', priority: 'Routine' },
          { name: 'Urine albumin-to-creatinine ratio (UACR)', reason: 'Kidney screen', priority: 'High' }
        ],
        imagingStudies: [],
        clinicalNotes: ['Advised smoking cessation immediately.', 'Dietary plan for Diabetics provided (Low carb/Low salt).', 'Foot care education provided.'],
        instructions: 'نمک اور چینی سے مکمل پرہیز کریں۔ روزانہ 30 منٹ پیدل چلیں۔',
        warnings: ['Hypoglycemia symptoms education provided.', 'Call if vision worsens.'],
        followUpDate: '2 Weeks'
      },
      prescriptions: [
        { medicineName: 'Metformin 500mg', dosage: '500mg', morning: '1', noon: '0', evening: '1', night: '0', duration: '1 Month', instructions: 'After meals' },
        { medicineName: 'Enalapril 5mg', dosage: '5mg', morning: '0', noon: '0', evening: '0', night: '1', duration: '1 Month', instructions: 'Before sleep' },
        { medicineName: 'Gliclazide 30mg', dosage: '30mg', morning: '1', noon: '0', evening: '0', night: '0', duration: '1 Month', instructions: '30 mins before breakfast' }
      ],
      selectedLabs: ['HbA1c', 'Fasting Lipid Profile', 'Urine albumin-to-creatinine ratio (UACR)'],
      selectedImaging: [],
      customLabs: [],
      customImaging: []
    },
    // 2. Acute Respiratory Infection (Zainab Bibi)
    {
      id: 'demo-002',
      savedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      doctorId,
      clinicId,
      patientData: {
        patientName: 'Zainab Bibi',
        patientId: 'PT-LHR-202',
        phoneNumber: '+92 321 9876543',
        age: '28',
        gender: 'Female',
        chiefComplaint: 'High grade fever with productive cough and chest pain for 3 days.',
        symptoms: ['Fever', 'Cough', 'Productive Cough', 'Chest Pain', 'Difficulty Breathing', 'Chills'],
        customSymptoms: 'Pus-like sputum (yellowish), sharp pain on deep inspiration.',
        medicalHistory: ['Asthma'],
        customPMH: 'Occasional seasonal asthma in childhood. Last attack 2 years ago. No history of pneumonia.',
        currentMedications: 'None current. Occasional Salbutamol inhaler.',
        allergies: 'Penicillin (Skin Rash/Hives)',
        previousLabs: 'None recent.',
        vitalSigns: { bloodPressure: '110/70', heartRate: '105', temperature: '102.3', oxygenSaturation: '94', respiratoryRate: '24', weight: '55', heightInches: '64', printHeightInches: true },
        diagnosticFindings: 'Crepitations noted in right lower base. Increased tactile fremitus. Bronchial breathing in Right Lower Zone. No cyanosis.'
      },
      recommendations: {
        diagnoses: [{ name: 'Community Acquired Pneumonia', icdCode: 'J18.9' }],
        medications: [],
        labTests: [
          { name: 'Complete Blood Count (CBC)', reason: 'Infection check', priority: 'High' },
          { name: 'Sputum C/S', reason: 'Sensitivity list', priority: 'Routine' }
        ],
        imagingStudies: [{ name: 'Chest X-Ray PA View', reason: 'Consolidation check', priority: 'High' }],
        clinicalNotes: ['Increase fluid intake (3L/day).', 'Steam inhalation 3 times a day.', 'Rest at home for 1 week.'],
        instructions: 'اینٹی بائیوٹک کا کورس مکمل کریں اور بھاپ لیں۔ روزانہ زیادہ پانی پئیں۔',
        warnings: ['Strict follow-up if breathing worsens or oxygen drops.', 'Watch for bluish discoloration.'],
        followUpDate: '3 Days'
      },
      prescriptions: [
        { medicineName: 'Levaquin 500mg', dosage: '500mg', morning: '1', noon: '0', evening: '0', night: '0', duration: '5 Days', instructions: 'Once Daily for 5 days' },
        { medicineName: 'Panadol Forte', dosage: '650mg', morning: '1', noon: '1', evening: '1', night: '0', duration: '3 Days', instructions: 'If Temp > 99 F' },
        { medicineName: 'Ascoryl Syrup', dosage: '10ml', morning: '1', noon: '1', evening: '1', night: '0', duration: '5 Days', instructions: 'For cough' }
      ],
      selectedLabs: ['Complete Blood Count (CBC)'],
      selectedImaging: ['Chest X-Ray PA View'],
      customLabs: ['Sputum C/S'],
      customImaging: []
    },
    // 3. Pediatric Gastroenteritis (Baby Ali)
    {
      id: 'demo-003',
      savedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      doctorId,
      clinicId,
      patientData: {
        patientName: 'Ali Raza',
        patientId: 'PT-MUL-303',
        phoneNumber: '+92 345 5551122',
        age: '4',
        gender: 'Male',
        chiefComplaint: 'Vomiting and watery diarrhea for 24 hours. Decreased activity.',
        symptoms: ['Nausea', 'Vomiting', 'Diarrhea', 'Abdominal Pain', 'Fatigue'],
        customSymptoms: 'Sunken eyes, decreased urine output (last passed 8 hours ago).',
        medicalHistory: [],
        customPMH: 'Previously healthy child. Fully immunized as per EPI.',
        currentMedications: 'None.',
        allergies: 'None.',
        previousLabs: 'None.',
        vitalSigns: { bloodPressure: '90/60', heartRate: '120', temperature: '99.2', oxygenSaturation: '98', respiratoryRate: '28', weight: '16', heightInches: '40', printHeightInches: true },
        diagnosticFindings: 'Mildly dehydrated. Sunken eyes. Skin pinch goes back slightly slow. Abdomen soft but tender.'
      },
      recommendations: {
        diagnoses: [{ name: 'Acute Viral Gastroenteritis with Mild Dehydration', icdCode: 'A09' }],
        medications: [],
        labTests: [{ name: 'Serum Electrolytes', reason: 'Dehydration severity', priority: 'High' }],
        imagingStudies: [],
        clinicalNotes: ['Encouraged Oral Rehydration Solution (ORS).', 'Continue soft diet (Banana, Rice, Apple sauce, Yogurt).', 'Strict hygiene advised.'],
        instructions: 'او آر ایس بار بار پلائیں (50 ملی لیٹر ہر موشن کے بعد)۔ نرم غذا دیں۔',
        warnings: ['Bring to ER if vomiting persists, child becomes lethargic, or no urine for 12 hours.'],
        followUpDate: 'Tomorrow (Telephonic)'
      },
      prescriptions: [
        { medicineName: 'Pedialyte (ORS)', dosage: 'As needed', morning: '1', noon: '1', evening: '1', night: '1', duration: '3 Days', instructions: 'Slow sips after each episode' },
        { medicineName: 'Zincat Syrup', dosage: '5ml', morning: '1', noon: '0', evening: '0', night: '0', duration: '14 Days', instructions: 'Once Daily for 14 days' },
        { medicineName: 'Flagyl Syrup 200mg', dosage: '5ml', morning: '1', noon: '1', evening: '1', night: '0', duration: '5 Days', instructions: 'After food' }
      ],
      selectedLabs: ['Serum Electrolytes'],
      selectedImaging: [],
      customLabs: [],
      customImaging: []
    },
    // 4. Cardiac Patient (Fatima Zahra)
    {
      id: 'demo-004',
      savedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      doctorId,
      clinicId,
      patientData: {
        patientName: 'Fatima Zahra',
        patientId: 'PT-RWP-404',
        phoneNumber: '+92 333 4445566',
        age: '65',
        gender: 'Female',
        chiefComplaint: 'Shortness of breath on exertion and night-time coughing for 1 month.',
        symptoms: ['Shortness of Breath', 'Cough', 'Night Sweats', 'Leg Swelling', 'Palpitations', 'Fatigue'],
        customSymptoms: 'Orthopnea (needs 3 pillows to sleep), paroxysmal nocturnal dyspnea.',
        medicalHistory: ['Coronary Artery Disease', 'Heart Failure', 'Hypertension'],
        customPMH: 'Post-MI condition (5 years ago). Undergone Stenting (PCI) to LAD.',
        currentMedications: 'Tab. Aspirin 75mg, Tab. Bisoprolol 5mg, Tab. Ramipril 5mg.',
        allergies: 'None.',
        previousLabs: 'NT-proBNP elevated (2 weeks ago: 1200 pg/mL).',
        vitalSigns: { bloodPressure: '130/80', heartRate: '92', temperature: '98.0', oxygenSaturation: '93', respiratoryRate: '22', weight: '72', heightInches: '62', printHeightInches: true },
        diagnosticFindings: 'Bilateral basal crackles. JVP elevated 4cm. Bipedal pitting edema (Grade 2).'
      },
      recommendations: {
        diagnoses: [{ name: 'Congestive Heart Failure (NYHA Class III)', icdCode: 'I50.9' }, { name: 'Ischemic Heart Disease', icdCode: 'I25.1' }],
        medications: [],
        labTests: [{ name: 'NT-proBNP', reason: 'Monitor HF', priority: 'High' }, { name: 'Serum Creatinine/K+', reason: 'Monitor ACE-I/Diuretic', priority: 'High' }],
        imagingStudies: [{ name: 'Echocardiography', reason: 'Assess EF', priority: 'High' }],
        clinicalNotes: ['Strict Fluid Restriction (<1.5L/day).', 'Salt-reduced diet.', 'Daily weight monitoring at home.'],
        instructions: 'پانی اور نمک کا استعمال کم کریں۔ روزانہ اپنا وزن چیک کریں اور اگر وزن اچانک بڑھے تو رابطہ کریں۔',
        warnings: ['ER if severe chest pain or sudden gasping for air.'],
        followUpDate: '1 Month'
      },
      prescriptions: [
        { medicineName: 'Lasix 40mg (Furosemide)', dosage: '40mg', morning: '1', noon: '0', evening: '1', night: '0', duration: '2 Weeks', instructions: 'Empty stomach in morning' },
        { medicineName: 'Spironolactone 25mg', dosage: '25mg', morning: '1', noon: '0', evening: '0', night: '0', duration: '1 Month', instructions: 'Monitor potassium' },
        { medicineName: 'Entresto 50mg', dosage: '50mg', morning: '1', noon: '0', evening: '1', night: '0', duration: '2 Weeks', instructions: 'Titrate slowly' }
      ],
      selectedLabs: ['NT-proBNP'],
      selectedImaging: [],
      customLabs: ['Serum Creatinine/K+'],
      customImaging: ['Echocardiography']
    },
    // 5. Orthopedic Case (Mansoor Ahmed)
    {
      id: 'demo-005',
      savedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      doctorId,
      clinicId,
      patientData: {
        patientName: 'Mansoor Ahmed',
        patientId: 'PT-PES-505',
        phoneNumber: '+92 312 8889900',
        age: '42',
        gender: 'Male',
        chiefComplaint: 'Severe lower back pain radiating to left leg for 3 days after lifting heavy weight.',
        symptoms: ['Back Pain', 'Numbness/Tingling', 'Muscle Weakness', 'Limited Range of Motion'],
        customSymptoms: 'Sciatic pain, shooting down to left calf. Tingling in left first toe.',
        medicalHistory: [],
        customPMH: 'Regular gym trainee. No prior back injuries. Desk job (long sitting hours).',
        currentMedications: 'Tab. Diclofenac (as needed).',
        allergies: 'Aspirin (Stomach irritation).',
        previousLabs: 'None.',
        vitalSigns: { bloodPressure: '125/85', heartRate: '76', temperature: '98.5', oxygenSaturation: '99', respiratoryRate: '16', weight: '82', heightInches: '70', printHeightInches: true },
        diagnosticFindings: 'Straight Leg Raise (SLR) test positive on Left at 30 degrees. Weakness in EHL (left). Tenderness over L4-L5 spine.'
      },
      recommendations: {
        diagnoses: [{ name: 'Lumbar Disc Prolapse (L4-L5)', icdCode: 'M51.2' }],
        medications: [],
        labTests: [],
        imagingStudies: [{ name: 'MRI Lumbar Spine', reason: 'Determine nerve compression', priority: 'High' }],
        clinicalNotes: ['Strict bed rest on hard mattress for 3 days.', 'Avoid forward bending and heavy lifting.', 'Physiotherapy once acute phase over.'],
        instructions: 'مکمل آرام کریں اور جھکنے سے پرہیز کریں۔ سخت بستر کا استعمال کریں۔',
        warnings: ['Immediate ER visit if bladder or bowel control is lost (Saddle anesthesia).'],
        followUpDate: '1 Week with MRI result'
      },
      prescriptions: [
        { medicineName: 'Arcoxia 90mg', dosage: '90mg', morning: '0', noon: '0', evening: '0', night: '1', duration: '5 Days', instructions: 'After dinner' },
        { medicineName: 'Nuberol Forte', dosage: 'As needed', morning: '1', noon: '0', evening: '1', night: '0', duration: '5 Days', instructions: 'For muscle spasm' },
        { medicineName: 'Tab. Pregabalin 75mg', dosage: '75mg', morning: '0', noon: '0', evening: '0', night: '1', duration: '10 Days', instructions: 'For nerve pain' }
      ],
      selectedLabs: [],
      selectedImaging: ['MRI Lumbar Spine'],
      customLabs: [],
      customImaging: []
    }
  ];

  return patients;
}
