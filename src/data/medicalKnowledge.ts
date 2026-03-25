import type { PatientData, Recommendations, Diagnosis, Medication, LabTest, ImagingStudy } from '../types';

interface ConditionRule {
  keywords: string[];
  symptoms: string[];
  diagnoses: Diagnosis[];
  medications: Medication[];
  labTests: LabTest[];
  imaging: ImagingStudy[];
  notes: string[];
}

const CONDITIONS: ConditionRule[] = [
  {
    keywords: ['cough', 'cold', 'sore throat', 'runny nose', 'congestion', 'sneezing'],
    symptoms: ['Cough', 'Sore Throat', 'Runny Nose', 'Sneezing', 'Nasal Congestion', 'Fever'],
    diagnoses: [
      { name: 'Acute Upper Respiratory Infection', icdCode: 'J06.9', confidence: 'High' },
      { name: 'Acute Pharyngitis', icdCode: 'J02.9', confidence: 'Medium' },
      { name: 'Allergic Rhinitis', icdCode: 'J30.9', confidence: 'Low' }
    ],
    medications: [
      { name: 'Acetaminophen', dosage: '500-1000mg', frequency: 'Every 6-8 hours', route: 'Oral', duration: '5-7 days', notes: 'For fever and pain' },
      { name: 'Dextromethorphan', dosage: '10-20mg', frequency: 'Every 4-6 hours', route: 'Oral', duration: '5 days', notes: 'For dry cough' },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', route: 'Oral', duration: '7 days', notes: 'For runny nose/sneezing' },
      { name: 'Ambroxol', dosage: '30mg', frequency: 'Three times daily', route: 'Oral', duration: '5 days', notes: 'Mucolytic for productive cough' }
    ],
    labTests: [
      { name: 'Complete Blood Count', reason: 'Rule out bacterial infection', priority: 'Routine' },
      { name: 'C-Reactive Protein', reason: 'Assess inflammation', priority: 'Routine' }
    ],
    imaging: [
      { name: 'Chest X-Ray PA', reason: 'Rule out pneumonia if symptoms persist', priority: 'If indicated' }
    ],
    notes: ['Advise rest, hydration, and warm fluids', 'Follow up if symptoms worsen or persist beyond 7 days', 'Consider antibiotics only if bacterial infection confirmed']
  },
  {
    keywords: ['high blood pressure', 'hypertension', 'headache', 'dizziness'],
    symptoms: ['Headache', 'Dizziness', 'Blurred Vision', 'Chest Pain', 'Shortness of Breath'],
    diagnoses: [
      { name: 'Essential Hypertension', icdCode: 'I10', confidence: 'High' },
      { name: 'Hypertensive Heart Disease', icdCode: 'I11.9', confidence: 'Medium' },
      { name: 'Secondary Hypertension', icdCode: 'I15.9', confidence: 'Low' }
    ],
    medications: [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', route: 'Oral', duration: 'Ongoing', notes: 'Calcium channel blocker' },
      { name: 'Losartan', dosage: '50mg', frequency: 'Once daily', route: 'Oral', duration: 'Ongoing', notes: 'ARB - monitor potassium' },
      { name: 'Hydrochlorothiazide', dosage: '12.5mg', frequency: 'Once daily', route: 'Oral', duration: 'Ongoing', notes: 'Thiazide diuretic' }
    ],
    labTests: [
      { name: 'Renal Function Panel', reason: 'Baseline kidney function', priority: 'Urgent' },
      { name: 'Serum Electrolytes', reason: 'Baseline before diuretic', priority: 'Urgent' },
      { name: 'Lipid Panel', reason: 'Cardiovascular risk assessment', priority: 'Routine' },
      { name: 'HbA1c', reason: 'Screen for diabetes', priority: 'Routine' },
      { name: 'Urinalysis', reason: 'Check for proteinuria', priority: 'Routine' }
    ],
    imaging: [
      { name: 'ECG', reason: 'Baseline cardiac assessment', priority: 'Urgent' },
      { name: 'Echocardiography', reason: 'Assess cardiac structure and function', priority: 'Routine' }
    ],
    notes: ['Lifestyle modifications: low sodium diet, regular exercise', 'Target BP <130/80 mmHg', 'Monitor BP at home, keep log', 'Follow up in 2-4 weeks']
  },
  {
    keywords: ['diabetes', 'high sugar', 'frequent urination', 'thirst', 'polyuria'],
    symptoms: ['Frequent Urination', 'Excessive Thirst', 'Fatigue', 'Weight Loss', 'Blurred Vision', 'Numbness/Tingling'],
    diagnoses: [
      { name: 'Type 2 Diabetes Mellitus', icdCode: 'E11.9', confidence: 'High' },
      { name: 'Prediabetes / Impaired Glucose Tolerance', icdCode: 'R73.03', confidence: 'Medium' },
      { name: 'Diabetic Neuropathy', icdCode: 'E11.40', confidence: 'Low' }
    ],
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', route: 'Oral', duration: 'Ongoing', notes: 'First-line; take with meals' },
      { name: 'Glimepiride', dosage: '1mg', frequency: 'Once daily', route: 'Oral', duration: 'Ongoing', notes: 'Sulfonylurea - risk of hypoglycemia' },
      { name: 'Empagliflozin', dosage: '10mg', frequency: 'Once daily', route: 'Oral', duration: 'Ongoing', notes: 'SGLT2 inhibitor - cardiovascular benefit' }
    ],
    labTests: [
      { name: 'HbA1c', reason: 'Glycemic control assessment', priority: 'Urgent' },
      { name: 'Fasting Blood Glucose', reason: 'Current glucose level', priority: 'Urgent' },
      { name: 'Renal Function Panel', reason: 'Kidney function baseline', priority: 'Urgent' },
      { name: 'Lipid Panel', reason: 'Cardiovascular risk', priority: 'Routine' },
      { name: 'Urine Microalbumin', reason: 'Early nephropathy screening', priority: 'Routine' },
      { name: 'Liver Function Tests', reason: 'Pre-metformin baseline', priority: 'Routine' }
    ],
    imaging: [
      { name: 'Fundoscopy / Retinal Imaging', reason: 'Diabetic retinopathy screening', priority: 'Routine' },
      { name: 'Ankle-Brachial Index', reason: 'Peripheral vascular assessment', priority: 'If indicated' }
    ],
    notes: ['Diabetic diet counseling referral', 'Target HbA1c <7%', 'Annual eye and foot examination', 'Self-monitor blood glucose', 'Follow up in 3 months with HbA1c']
  },
  {
    keywords: ['stomach', 'vomiting', 'diarrhea', 'nausea', 'abdominal pain', 'gastro'],
    symptoms: ['Nausea', 'Vomiting', 'Diarrhea', 'Abdominal Pain', 'Fever', 'Loss of Appetite'],
    diagnoses: [
      { name: 'Acute Gastroenteritis', icdCode: 'K52.9', confidence: 'High' },
      { name: 'Food Poisoning', icdCode: 'A05.9', confidence: 'Medium' },
      { name: 'Irritable Bowel Syndrome', icdCode: 'K58.9', confidence: 'Low' }
    ],
    medications: [
      { name: 'Ondansetron', dosage: '4mg', frequency: 'Every 8 hours', route: 'Oral', duration: '3 days', notes: 'Antiemetic' },
      { name: 'ORS (Oral Rehydration Salts)', dosage: '1 sachet in 1L water', frequency: 'As needed', route: 'Oral', duration: '3-5 days', notes: 'Prevent dehydration' },
      { name: 'Racecadotril', dosage: '100mg', frequency: 'Three times daily', route: 'Oral', duration: '3 days', notes: 'Antisecretory antidiarrheal' },
      { name: 'Pantoprazole', dosage: '40mg', frequency: 'Once daily', route: 'Oral', duration: '7 days', notes: 'Proton pump inhibitor' }
    ],
    labTests: [
      { name: 'Complete Blood Count', reason: 'Assess infection/dehydration', priority: 'Urgent' },
      { name: 'Serum Electrolytes', reason: 'Electrolyte imbalance from fluid loss', priority: 'Urgent' },
      { name: 'Stool Examination', reason: 'Identify pathogen', priority: 'Routine' },
      { name: 'Renal Function Panel', reason: 'Assess dehydration impact', priority: 'Routine' }
    ],
    imaging: [
      { name: 'Abdominal Ultrasound', reason: 'Rule out other abdominal pathology', priority: 'If indicated' }
    ],
    notes: ['Encourage oral hydration', 'BRAT diet (bananas, rice, applesauce, toast)', 'Seek emergency care if blood in stool or severe dehydration', 'Follow up in 48-72 hours if no improvement']
  },
  {
    keywords: ['depression', 'sad', 'anxiety', 'insomnia', 'mood', 'stress', 'sleep'],
    symptoms: ['Fatigue', 'Insomnia', 'Loss of Appetite', 'Weight Loss', 'Headache'],
    diagnoses: [
      { name: 'Major Depressive Disorder', icdCode: 'F32.9', confidence: 'High' },
      { name: 'Generalized Anxiety Disorder', icdCode: 'F41.1', confidence: 'Medium' },
      { name: 'Adjustment Disorder', icdCode: 'F43.20', confidence: 'Low' }
    ],
    medications: [
      { name: 'Sertraline', dosage: '50mg', frequency: 'Once daily', route: 'Oral', duration: 'Ongoing', notes: 'SSRI - takes 2-4 weeks for full effect' },
      { name: 'Melatonin', dosage: '3mg', frequency: 'At bedtime', route: 'Oral', duration: '4 weeks', notes: 'For sleep regulation' },
      { name: 'Vitamin B Complex', dosage: '1 tablet', frequency: 'Once daily', route: 'Oral', duration: '3 months', notes: 'Neurological support' }
    ],
    labTests: [
      { name: 'Thyroid Panel (TSH, FT3, FT4)', reason: 'Rule out thyroid dysfunction', priority: 'Urgent' },
      { name: 'Complete Blood Count', reason: 'Rule out anemia', priority: 'Routine' },
      { name: 'Vitamin B12 Level', reason: 'Deficiency can mimic depression', priority: 'Routine' },
      { name: 'Vitamin D Level', reason: 'Low levels associated with depression', priority: 'Routine' }
    ],
    imaging: [],
    notes: ['Refer to psychiatry/psychology for counseling', 'PHQ-9 score assessment recommended', 'Monitor for suicidal ideation', 'Avoid alcohol', 'Regular exercise recommended', 'Follow up in 2 weeks']
  },
  {
    keywords: ['chest pain', 'chest tightness', 'heart', 'palpitation', 'cardiac'],
    symptoms: ['Chest Pain', 'Shortness of Breath', 'Palpitations', 'Dizziness', 'Fatigue', 'Sweating'],
    diagnoses: [
      { name: 'Coronary Artery Disease', icdCode: 'I25.10', confidence: 'High' },
      { name: 'Unstable Angina', icdCode: 'I20.0', confidence: 'Medium' },
      { name: 'Costochondritis', icdCode: 'M94.0', confidence: 'Low' }
    ],
    medications: [
      { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily', route: 'Oral', duration: 'Ongoing', notes: 'Antiplatelet - take with food' },
      { name: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily at bedtime', route: 'Oral', duration: 'Ongoing', notes: 'Statin therapy' },
      { name: 'Metoprolol', dosage: '25mg', frequency: 'Twice daily', route: 'Oral', duration: 'Ongoing', notes: 'Beta-blocker - do not stop abruptly' },
      { name: 'Nitroglycerin SL', dosage: '0.4mg', frequency: 'As needed for chest pain', route: 'Sublingual', duration: 'PRN', notes: 'Max 3 doses, 5 min apart; call 911 if no relief' }
    ],
    labTests: [
      { name: 'Troponin I', reason: 'Rule out acute MI', priority: 'Urgent' },
      { name: 'Complete Blood Count', reason: 'Baseline assessment', priority: 'Urgent' },
      { name: 'Lipid Panel', reason: 'Cardiovascular risk stratification', priority: 'Urgent' },
      { name: 'BNP / NT-proBNP', reason: 'Assess heart failure', priority: 'Urgent' },
      { name: 'Renal Function Panel', reason: 'Pre-medication baseline', priority: 'Routine' },
      { name: 'Coagulation Profile', reason: 'Pre-anticoagulation', priority: 'Routine' }
    ],
    imaging: [
      { name: 'ECG (12-lead)', reason: 'Ischemic changes assessment', priority: 'Urgent' },
      { name: 'Chest X-Ray PA', reason: 'Cardiac silhouette and lung fields', priority: 'Urgent' },
      { name: 'Echocardiography', reason: 'Wall motion abnormalities, EF', priority: 'Urgent' },
      { name: 'CT Coronary Angiography', reason: 'Non-invasive coronary assessment', priority: 'If indicated' }
    ],
    notes: ['IMMEDIATE CARDIOLOGY CONSULT if acute', 'Lifestyle: smoking cessation, diet, exercise', 'Strict BP and glucose control', 'Cardiac rehabilitation referral']
  },
  {
    keywords: ['asthma', 'wheeze', 'breathing', 'inhaler', 'bronchospasm'],
    symptoms: ['Shortness of Breath', 'Cough', 'Wheezing', 'Chest Pain'],
    diagnoses: [
      { name: 'Bronchial Asthma', icdCode: 'J45.9', confidence: 'High' },
      { name: 'Acute Bronchitis', icdCode: 'J20.9', confidence: 'Medium' },
      { name: 'COPD', icdCode: 'J44.1', confidence: 'Low' }
    ],
    medications: [
      { name: 'Salbutamol Inhaler', dosage: '100mcg/puff, 2 puffs', frequency: 'Every 4-6 hours PRN', route: 'Inhalation', duration: 'Ongoing', notes: 'Rescue inhaler' },
      { name: 'Fluticasone/Salmeterol', dosage: '250/50mcg', frequency: 'Twice daily', route: 'Inhalation', duration: 'Ongoing', notes: 'Controller inhaler - rinse mouth after use' },
      { name: 'Montelukast', dosage: '10mg', frequency: 'Once daily at bedtime', route: 'Oral', duration: 'Ongoing', notes: 'Leukotriene receptor antagonist' },
      { name: 'Prednisolone', dosage: '40mg', frequency: 'Once daily', route: 'Oral', duration: '5 days', notes: 'For acute exacerbation only' }
    ],
    labTests: [
      { name: 'Complete Blood Count', reason: 'Eosinophilia assessment', priority: 'Routine' },
      { name: 'IgE Level', reason: 'Allergic component assessment', priority: 'Routine' },
      { name: 'Arterial Blood Gas', reason: 'Oxygenation status if severe', priority: 'If indicated' }
    ],
    imaging: [
      { name: 'Chest X-Ray PA', reason: 'Rule out pneumonia/pneumothorax', priority: 'Routine' },
      { name: 'Pulmonary Function Test', reason: 'Asthma severity grading', priority: 'Routine' }
    ],
    notes: ['Inhaler technique education', 'Identify and avoid triggers', 'Asthma action plan provided', 'Peak flow monitoring at home', 'Follow up in 4 weeks']
  },
  {
    keywords: ['urinary', 'burning urination', 'uti', 'frequency', 'dysuria'],
    symptoms: ['Frequent Urination', 'Abdominal Pain', 'Fever', 'Back Pain'],
    diagnoses: [
      { name: 'Urinary Tract Infection', icdCode: 'N39.0', confidence: 'High' },
      { name: 'Acute Cystitis', icdCode: 'N30.00', confidence: 'Medium' },
      { name: 'Acute Pyelonephritis', icdCode: 'N10', confidence: 'Low' }
    ],
    medications: [
      { name: 'Nitrofurantoin', dosage: '100mg', frequency: 'Twice daily', route: 'Oral', duration: '5 days', notes: 'Take with food' },
      { name: 'Phenazopyridine', dosage: '200mg', frequency: 'Three times daily', route: 'Oral', duration: '2 days', notes: 'Urinary analgesic - colors urine orange' },
      { name: 'Ibuprofen', dosage: '400mg', frequency: 'Every 8 hours', route: 'Oral', duration: '3 days', notes: 'For pain and inflammation' }
    ],
    labTests: [
      { name: 'Urinalysis', reason: 'Pyuria, nitrites, leukocyte esterase', priority: 'Urgent' },
      { name: 'Urine Culture & Sensitivity', reason: 'Identify organism and antibiotic sensitivity', priority: 'Urgent' },
      { name: 'Complete Blood Count', reason: 'Assess infection severity', priority: 'Routine' },
      { name: 'Renal Function Panel', reason: 'Kidney function assessment', priority: 'Routine' }
    ],
    imaging: [
      { name: 'Renal Ultrasound', reason: 'Rule out obstruction or abscess', priority: 'If indicated' }
    ],
    notes: ['Increase fluid intake to 2-3L/day', 'Complete full antibiotic course', 'Follow up if symptoms not improving in 48h', 'Reconsider antibiotics based on culture results']
  },
  {
    keywords: ['migraine', 'headache', 'head pain', 'aura', 'photophobia'],
    symptoms: ['Headache', 'Nausea', 'Vomiting', 'Blurred Vision', 'Dizziness'],
    diagnoses: [
      { name: 'Migraine without Aura', icdCode: 'G43.009', confidence: 'High' },
      { name: 'Tension-type Headache', icdCode: 'G44.209', confidence: 'Medium' },
      { name: 'Cluster Headache', icdCode: 'G44.009', confidence: 'Low' }
    ],
    medications: [
      { name: 'Sumatriptan', dosage: '50mg', frequency: 'At onset, may repeat in 2h', route: 'Oral', duration: 'PRN', notes: 'Max 200mg/day - triptan' },
      { name: 'Propranolol', dosage: '40mg', frequency: 'Twice daily', route: 'Oral', duration: 'Ongoing', notes: 'Prophylaxis if >4 attacks/month' },
      { name: 'Metoclopramide', dosage: '10mg', frequency: 'As needed', route: 'Oral', duration: 'PRN', notes: 'For nausea; enhances triptan absorption' },
      { name: 'Magnesium Glycinate', dosage: '400mg', frequency: 'Once daily', route: 'Oral', duration: '3 months', notes: 'Preventive supplement' }
    ],
    labTests: [
      { name: 'Complete Blood Count', reason: 'Rule out secondary causes', priority: 'Routine' },
      { name: 'Thyroid Panel', reason: 'Thyroid dysfunction screening', priority: 'Routine' },
      { name: 'ESR / CRP', reason: 'Rule out temporal arteritis if age >50', priority: 'If indicated' }
    ],
    imaging: [
      { name: 'MRI Brain', reason: 'Rule out structural pathology', priority: 'If indicated' },
      { name: 'CT Head', reason: 'Urgent if thunderclap headache', priority: 'If indicated' }
    ],
    notes: ['Headache diary recommended', 'Identify triggers: stress, foods, sleep', 'Dark quiet room during attacks', 'Avoid medication overuse (>10 days/month)', 'Follow up in 4 weeks']
  },
  {
    keywords: ['joint pain', 'arthritis', 'knee pain', 'back pain', 'stiffness'],
    symptoms: ['Joint Pain', 'Back Pain', 'Swelling', 'Fatigue', 'Numbness/Tingling'],
    diagnoses: [
      { name: 'Osteoarthritis', icdCode: 'M19.90', confidence: 'High' },
      { name: 'Rheumatoid Arthritis', icdCode: 'M06.9', confidence: 'Medium' },
      { name: 'Lumbar Spondylosis', icdCode: 'M47.816', confidence: 'Low' }
    ],
    medications: [
      { name: 'Acetaminophen', dosage: '500mg', frequency: 'Every 6 hours', route: 'Oral', duration: 'As needed', notes: 'First-line analgesic' },
      { name: 'Diclofenac Gel 1%', dosage: 'Apply thin layer', frequency: 'Three times daily', route: 'Topical', duration: '2-4 weeks', notes: 'Topical NSAID - less GI risk' },
      { name: 'Glucosamine + Chondroitin', dosage: '1500mg/1200mg', frequency: 'Once daily', route: 'Oral', duration: '3 months', notes: 'Joint supplement - variable evidence' },
      { name: 'Pregabalin', dosage: '75mg', frequency: 'Twice daily', route: 'Oral', duration: 'Ongoing', notes: 'For neuropathic component if present' }
    ],
    labTests: [
      { name: 'ESR', reason: 'Inflammatory marker', priority: 'Routine' },
      { name: 'CRP', reason: 'Inflammation assessment', priority: 'Routine' },
      { name: 'Rheumatoid Factor', reason: 'Screen for RA', priority: 'Routine' },
      { name: 'Anti-CCP Antibodies', reason: 'Specific for RA', priority: 'Routine' },
      { name: 'Uric Acid', reason: 'Rule out gout', priority: 'Routine' },
      { name: 'Vitamin D Level', reason: 'Bone health assessment', priority: 'Routine' }
    ],
    imaging: [
      { name: 'X-Ray of affected joint', reason: 'Joint space narrowing, osteophytes', priority: 'Routine' },
      { name: 'MRI of affected area', reason: 'Soft tissue and cartilage assessment', priority: 'If indicated' }
    ],
    notes: ['Weight management if overweight', 'Physical therapy referral', 'Low-impact exercise: swimming, cycling', 'Hot/cold therapy for symptom relief', 'Follow up in 4-6 weeks']
  },
  {
    keywords: ['allergy', 'allergic', 'rash', 'itching', 'hives', 'rhinitis'],
    symptoms: ['Sneezing', 'Runny Nose', 'Nasal Congestion', 'Skin Rash', 'Itching'],
    diagnoses: [
      { name: 'Allergic Rhinitis', icdCode: 'J30.9', confidence: 'High' },
      { name: 'Allergic Dermatitis', icdCode: 'L23.9', confidence: 'Medium' },
      { name: 'Urticaria', icdCode: 'L50.9', confidence: 'Low' }
    ],
    medications: [
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', route: 'Oral', duration: '2-4 weeks', notes: 'Second-generation antihistamine' },
      { name: 'Fluticasone Nasal Spray', dosage: '50mcg/spray, 2 sprays', frequency: 'Once daily each nostril', route: 'Intranasal', duration: '4 weeks', notes: 'Intranasal corticosteroid' },
      { name: 'Montelukast', dosage: '10mg', frequency: 'Once daily at bedtime', route: 'Oral', duration: '4 weeks', notes: 'For allergic rhinitis with asthma component' }
    ],
    labTests: [
      { name: 'Complete Blood Count', reason: 'Eosinophilia', priority: 'Routine' },
      { name: 'Total IgE', reason: 'Allergic status', priority: 'Routine' },
      { name: 'Specific IgE Panel', reason: 'Identify specific allergens', priority: 'If indicated' }
    ],
    imaging: [],
    notes: ['Allergen avoidance counseling', 'Consider allergy testing if recurrent', 'Saline nasal irrigation may help', 'Follow up in 4 weeks']
  },
  {
    keywords: ['skin', 'eczema', 'dermatitis', 'psoriasis', 'acne', 'fungal'],
    symptoms: ['Skin Rash', 'Itching', 'Swelling', 'Fever'],
    diagnoses: [
      { name: 'Atopic Dermatitis', icdCode: 'L20.9', confidence: 'High' },
      { name: 'Contact Dermatitis', icdCode: 'L25.9', confidence: 'Medium' },
      { name: 'Psoriasis', icdCode: 'L40.9', confidence: 'Low' }
    ],
    medications: [
      { name: 'Hydrocortisone Cream 1%', dosage: 'Thin layer', frequency: 'Twice daily', route: 'Topical', duration: '2 weeks', notes: 'Mild topical steroid' },
      { name: 'Cetirizine', dosage: '10mg', frequency: 'Once daily', route: 'Oral', duration: '2 weeks', notes: 'For itching relief' },
      { name: 'Moisturizing Cream', dosage: 'Liberal application', frequency: 'Three times daily', route: 'Topical', duration: 'Ongoing', notes: 'Fragrance-free emollient' }
    ],
    labTests: [
      { name: 'Complete Blood Count', reason: 'Rule out systemic cause', priority: 'Routine' },
      { name: 'IgE Level', reason: 'Allergic component', priority: 'If indicated' },
      { name: 'Skin Scraping / KOH', reason: 'Rule out fungal infection', priority: 'If indicated' }
    ],
    imaging: [],
    notes: ['Avoid irritants and harsh soaps', 'Use lukewarm water for bathing', 'Cotton clothing recommended', 'Dermatology referral if not improving', 'Follow up in 2 weeks']
  }
];

export function generateRecommendations(patient: PatientData): Recommendations {
  const allSymptoms = [...(patient.symptoms || []), ...(patient.customSymptoms || '').toLowerCase().split(',')].map(s => s.trim().toLowerCase());
  const complaint = (patient.chiefComplaint || '').toLowerCase();
  const combined = [...allSymptoms, complaint].join(' ');

  let bestMatch: ConditionRule | null = null;
  let bestScore = 0;

  for (const cond of CONDITIONS) {
    let score = 0;
    for (const kw of cond.keywords) { if (combined.includes(kw)) score += 2; }
    for (const sym of cond.symptoms) { if ((patient.symptoms || []).includes(sym)) score += 3; }
    if (score > bestScore) { bestScore = score; bestMatch = cond; }
  }

  if (!bestMatch || bestScore < 2) {
    bestMatch = CONDITIONS[0];
  }

  const warnings: string[] = [];

  const bp = patient.vitalSigns?.bloodPressure;
  if (bp) {
    const parts = bp.split('/');
    if (parts.length === 2) {
      const sys = parseInt(parts[0]), dia = parseInt(parts[1]);
      if (sys >= 180 || dia >= 120) warnings.push('⚠️ HYPERTENSIVE CRISIS: BP ' + bp + ' - Immediate intervention required');
      else if (sys >= 140 || dia >= 90) warnings.push('⚠️ Elevated BP: ' + bp + ' - Monitor closely');
    }
  }

  const hr = parseInt(patient.vitalSigns?.heartRate || '0');
  if (hr > 100) warnings.push('⚠️ Tachycardia: HR ' + hr + ' bpm');
  if (hr > 0 && hr < 60) warnings.push('⚠️ Bradycardia: HR ' + hr + ' bpm');

  const temp = parseFloat(patient.vitalSigns?.temperature || '0');
  if (temp > 102.2) warnings.push('⚠️ High Fever: ' + temp + '°F - Consider urgent evaluation');
  else if (temp > 100.4) warnings.push('⚠️ Fever: ' + temp + '°F');

  const spo2 = parseInt(patient.vitalSigns?.oxygenSaturation || '0');
  if (spo2 > 0 && spo2 < 90) warnings.push('⚠️ CRITICAL: SpO₂ ' + spo2 + '% - Oxygen therapy needed');
  else if (spo2 > 0 && spo2 < 95) warnings.push('⚠️ Low SpO₂: ' + spo2 + '% - Monitor closely');

  const allergies = (patient.allergies || '').toLowerCase();
  const safeMeds = bestMatch.medications.filter(m => {
    const medLower = m.name.toLowerCase();
    if (allergies.includes('sulfa') && (medLower.includes('sulfamethoxazole') || medLower.includes('sulfa'))) {
      warnings.push('⚠️ ' + m.name + ' removed due to sulfa allergy');
      return false;
    }
    if (allergies.includes('penicillin') && (medLower.includes('amoxicillin') || medLower.includes('penicillin'))) {
      warnings.push('⚠️ ' + m.name + ' removed due to penicillin allergy');
      return false;
    }
    if (allergies.includes('nsaid') && (medLower.includes('ibuprofen') || medLower.includes('diclofenac') || medLower.includes('naproxen'))) {
      warnings.push('⚠️ ' + m.name + ' removed due to NSAID allergy');
      return false;
    }
    return true;
  });

  const age = parseInt(patient.age || '0');
  if (age >= 65) warnings.push('👴 Geriatric patient - Review medications per Beers Criteria');
  if (age > 0 && age < 18) warnings.push('👶 Pediatric patient - Verify weight-based dosing');

  const history = (patient.medicalHistory || []).map(h => (h || '').toLowerCase());
  if (history.some(h => h.includes('kidney') || h.includes('ckd') || h.includes('renal'))) {
    warnings.push('⚠️ CKD history - Adjust renally cleared medications');
  }
  if (history.some(h => h.includes('liver') || h.includes('hepat'))) {
    warnings.push('⚠️ Liver disease history - Monitor hepatotoxic medications');
  }

  return {
    diagnoses: [], // User requested to not auto-add diagnoses
    medications: safeMeds,
    labTests: bestMatch.labTests,
    imagingStudies: bestMatch.imaging,
    clinicalNotes: bestMatch.notes,
    instructions: '',
    warnings
  };
}

export const LAB_CATALOG = [
  { category: 'Hematology', tests: ['Complete Blood Count (CBC)', 'Differential Count', 'ESR', 'Reticulocyte Count', 'Peripheral Blood Smear', 'Coagulation Profile (PT/INR/aPTT)', 'PT/INR', 'aPTT', 'D-Dimer', 'Fibrinogen', 'Blood Group & Type', 'Bleeding Time', 'Clotting Time', 'G6PD Level'] },
  { category: 'Chemistry', tests: ['Basic Metabolic Panel (BMP)', 'Comprehensive Metabolic Panel (CMP)', 'Fasting Blood Glucose', 'Random Blood Glucose', 'Post-Prandial Glucose (2h)', 'HbA1c', 'Lipid Panel (Total)', 'LDL Cholesterol (Direct)', 'HDL Cholesterol (Direct)', 'Triglycerides', 'VLDL', 'Liver Function Tests (LFT)', 'AST (SGOT)', 'ALT (SGPT)', 'Alkaline Phosphatase (ALP)', 'GGT', 'Renal Function Panel', 'Blood Urea Nitrogen (BUN)', 'Serum Creatinine', 'eGFR', 'Uric Acid', 'Serum Calcium', 'Serum Phosphorus', 'Serum Magnesium', 'Serum Albumin', 'Total Protein', 'Bilirubin (Total & Direct)', 'Serum Amylase', 'Serum Lipase', 'LDH', 'Serum Iron', 'TIBC', 'Ferritin', 'Transferrin Saturation'] },
  { category: 'Cardiac', tests: ['Troponin I', 'Troponin T', 'CK-MB', 'CK Total', 'BNP', 'NT-proBNP', 'Homocysteine', 'hs-CRP', 'Lipoprotein(a)'] },
  { category: 'Thyroid & Endocrine', tests: ['TSH', 'Free T3', 'Free T4', 'Total T3', 'Total T4', 'Anti-TPO Antibodies', 'Thyroglobulin', 'Cortisol (Morning)', 'Cortisol (Evening)', 'ACTH', 'Growth Hormone', 'IGF-1', 'Fasting Insulin', 'C-Peptide', 'PTH (Parathyroid Hormone)', 'Vitamin D (25-OH)', 'Testosterone (Total)', 'Testosterone (Free)', 'Estradiol', 'FSH', 'LH', 'Prolactin', 'DHEA-S', 'Progesterone', 'Beta-hCG'] },
  { category: 'Infectious Disease', tests: ['Blood Culture & Sensitivity', 'Urine Culture & Sensitivity', 'Wound Culture & Sensitivity', 'Sputum Culture & Sensitivity', 'Procalcitonin', 'HIV 1&2 (ELISA)', 'HIV Viral Load', 'Hepatitis Panel (A/B/C)', 'HBsAg', 'Anti-HCV', 'Hepatitis B Viral Load', 'Malaria (Smear & Rapid)', 'Dengue NS1 & IgM/IgG', 'Typhoid (Widal Test)', 'TB QuantiFERON Gold', 'Mantoux Test (PPD)', 'COVID-19 RT-PCR', 'COVID-19 Rapid Antigen', 'Stool for Ova & Parasites', 'Stool Culture', 'H. Pylori (Stool Antigen)', 'H. Pylori (Breath Test)', 'VDRL/RPR (Syphilis)', 'Chlamydia PCR', 'Gonorrhea PCR'] },
  { category: 'Urine Tests', tests: ['Urinalysis (Complete)', 'Urine Microalbumin', 'Urine Albumin-Creatinine Ratio', '24-hour Urine Protein', '24-hour Urine Creatinine Clearance', 'Urine Electrolytes', 'Urine Drug Screen', 'Urine Osmolality', 'Urine pH'] },
  { category: 'Immunology & Autoimmune', tests: ['ANA (Antinuclear Antibodies)', 'Anti-dsDNA', 'Rheumatoid Factor (RF)', 'Anti-CCP Antibodies', 'Complement C3', 'Complement C4', 'Immunoglobulins (IgG/IgA/IgM/IgE)', 'Total IgE', 'Specific IgE Panel', 'CRP (Quantitative)', 'Anti-Phospholipid Antibodies', 'ANCA (p-ANCA/c-ANCA)', 'HLA-B27', 'Serum Protein Electrophoresis'] },
  { category: 'Vitamins & Minerals', tests: ['Vitamin B12', 'Folate (Folic Acid)', 'Vitamin D (25-OH)', 'Vitamin A', 'Vitamin E', 'Zinc', 'Copper', 'Selenium', 'Chromium'] },
  { category: 'Tumor Markers', tests: ['PSA (Total)', 'PSA (Free)', 'CEA', 'CA 19-9', 'CA 125', 'CA 15-3', 'AFP (Alpha-Fetoprotein)', 'Beta-hCG (Tumor Marker)', 'LDH (Tumor Marker)'] },
  { category: 'Coagulation', tests: ['D-Dimer', 'Fibrinogen', 'Factor V Leiden', 'Protein C', 'Protein S', 'Antithrombin III', 'Lupus Anticoagulant'] },
  { category: 'Miscellaneous', tests: ['Arterial Blood Gas (ABG)', 'Venous Blood Gas', 'Lactate', 'Ammonia', 'Osmolality (Serum)', 'Drug Levels (Specify)', 'Heavy Metal Screen', 'Lead Level', 'Genetic Testing (Specify)'] }
];

export const IMAGING_CATALOG = [
  { category: 'X-Ray', studies: ['Chest X-Ray PA', 'Chest X-Ray AP', 'Chest X-Ray Lateral', 'Abdomen X-Ray (Supine)', 'Abdomen X-Ray (Erect)', 'KUB (Kidneys/Ureters/Bladder)', 'Cervical Spine X-Ray', 'Thoracic Spine X-Ray', 'Lumbar Spine X-Ray', 'Lumbosacral Spine X-Ray', 'Pelvis X-Ray', 'Hip X-Ray', 'Knee X-Ray', 'Ankle X-Ray', 'Foot X-Ray', 'Shoulder X-Ray', 'Elbow X-Ray', 'Wrist X-Ray', 'Hand X-Ray', 'Skull X-Ray', 'Sinus X-Ray (Waters View)', 'Bone Survey', 'Bone Age'] },
  { category: 'Ultrasound', studies: ['Abdomen Ultrasound (Complete)', 'Abdomen Ultrasound (Limited)', 'Pelvis Ultrasound', 'Transvaginal Ultrasound', 'Renal Ultrasound', 'Thyroid Ultrasound', 'Breast Ultrasound', 'Testicular Ultrasound', 'Carotid Doppler', 'Lower Extremity Venous Doppler', 'Lower Extremity Arterial Doppler', 'Upper Extremity Venous Doppler', 'Renal Doppler', 'Hepatic Doppler', 'Soft Tissue Ultrasound', 'Musculoskeletal Ultrasound', 'Obstetric Ultrasound', 'FAST Exam (Trauma)', 'Echocardiography (TTE)', 'Echocardiography (TEE)', 'Scrotal Ultrasound'] },
  { category: 'CT Scan', studies: ['CT Head (Non-contrast)', 'CT Head (With Contrast)', 'CT Chest (Non-contrast)', 'CT Chest (With Contrast)', 'HRCT Chest', 'CT Abdomen & Pelvis (Non-contrast)', 'CT Abdomen & Pelvis (With Contrast)', 'CT Abdomen & Pelvis (With & Without Contrast)', 'CT Neck (With Contrast)', 'CT Spine - Cervical', 'CT Spine - Lumbar', 'CT KUB (Renal Stone Protocol)', 'CT Coronary Angiography', 'CT Pulmonary Angiography', 'CT Angiography - Cerebral', 'CT Angiography - Aorta', 'CT Angiography - Lower Extremity', 'CT Sinus', 'CT Orbits', 'CT Temporal Bone'] },
  { category: 'MRI', studies: ['MRI Brain (Without Contrast)', 'MRI Brain (With & Without Contrast)', 'MRI Spine - Cervical', 'MRI Spine - Thoracic', 'MRI Spine - Lumbar', 'MRI Spine - Whole Spine', 'MRI Knee', 'MRI Shoulder', 'MRI Hip', 'MRI Ankle', 'MRI Wrist', 'MRI Abdomen', 'MRI Pelvis', 'MRI Liver (Hepatocyte-specific)', 'MRCP', 'MRI Breast', 'Cardiac MRI', 'MRA - Brain', 'MRA - Neck', 'MRA - Aorta', 'MRI Orbits', 'MRI Temporal Bone', 'MRI Brachial Plexus'] },
  { category: 'Nuclear Medicine', studies: ['Bone Scan (Whole Body)', 'PET-CT (FDG)', 'Thyroid Scan (Tc-99m)', 'Thyroid Uptake (I-131)', 'VQ Scan (Ventilation-Perfusion)', 'MUGA Scan', 'Renal Scan (DTPA/MAG3)', 'HIDA Scan (Hepatobiliary)', 'GI Bleeding Scan', 'Parathyroid Scan (Sestamibi)', 'Gallium Scan', 'Octreotide Scan'] },
  { category: 'Cardiac Studies', studies: ['ECG (12-lead)', 'Holter Monitor (24h)', 'Holter Monitor (48h)', 'Event Monitor (7-day)', 'Event Monitor (30-day)', 'Exercise Stress Test (TMT)', 'Stress Echocardiography', 'Nuclear Stress Test (Myocardial Perfusion)', 'Cardiac Catheterization', 'Coronary Angiography', 'Electrophysiology Study', 'Tilt Table Test'] },
  { category: 'Other Diagnostic', studies: ['DEXA Scan (Bone Density)', 'Mammography (Bilateral)', 'Mammography (Diagnostic)', 'Barium Swallow', 'Barium Meal', 'Barium Enema', 'Nerve Conduction Study (NCS)', 'Electromyography (EMG)', 'EEG (Electroencephalogram)', 'Video EEG', 'Pulmonary Function Test (PFT)', 'DLCO', 'Sleep Study (Polysomnography)', 'Audiometry', 'Tympanometry', 'Visual Field Test', 'OCT (Retinal)', 'Fundus Photography', 'Upper GI Endoscopy', 'Colonoscopy', 'Bronchoscopy', 'Cystoscopy', 'Colposcopy'] }
];
