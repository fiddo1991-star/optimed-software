import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import * as libraryService from '../services/libraryService';
import type { PatientData } from '../types';
import SpeechMicButton from './SpeechMicButton';

const SYMPTOM_LIST = [

  // General
  'Fever', 'Chills', 'Night Sweats', 'Fatigue', 'Malaise', 'Weight Loss', 'Weight Gain', 'Loss of Appetite', 'Excessive Thirst', 'Sweating',
  // Head & Neurological
  'Headache', 'Dizziness', 'Vertigo', 'Fainting/Syncope', 'Seizures', 'Tremors', 'Numbness/Tingling', 'Memory Loss', 'Confusion', 'Speech Difficulty',
  // Eyes
  'Blurred Vision', 'Double Vision', 'Eye Pain', 'Eye Redness', 'Watery Eyes', 'Light Sensitivity', 'Visual Floaters', 'Dry Eyes',
  // Ears, Nose, Throat
  'Ear Pain', 'Hearing Loss', 'Tinnitus', 'Ear Discharge', 'Runny Nose', 'Nasal Congestion', 'Sneezing', 'Nosebleed', 'Sore Throat', 'Hoarseness', 'Difficulty Swallowing', 'Mouth Sores', 'Dry Mouth', 'Jaw Pain',
  // Respiratory
  'Cough', 'Dry Cough', 'Productive Cough', 'Shortness of Breath', 'Wheezing', 'Chest Tightness', 'Hemoptysis', 'Rapid Breathing',
  // Cardiovascular
  'Chest Pain', 'Palpitations', 'Leg Swelling', 'Cyanosis', 'Cold Extremities', 'Claudication',
  // Gastrointestinal
  'Nausea', 'Vomiting', 'Diarrhea', 'Constipation', 'Abdominal Pain', 'Bloating', 'Heartburn', 'Acid Reflux', 'Blood in Stool', 'Black/Tarry Stool', 'Rectal Bleeding', 'Jaundice', 'Loss of Taste',
  // Musculoskeletal
  'Back Pain', 'Joint Pain', 'Muscle Pain', 'Neck Pain', 'Shoulder Pain', 'Knee Pain', 'Hip Pain', 'Muscle Weakness', 'Stiffness', 'Swelling', 'Bone Pain', 'Limited Range of Motion',
  // Skin
  'Skin Rash', 'Itching', 'Hives/Urticaria', 'Skin Lesion', 'Bruising', 'Wound Not Healing', 'Hair Loss', 'Nail Changes', 'Skin Discoloration', 'Excessive Sweating', 'Dry Skin',
  // Urinary
  'Frequent Urination', 'Painful Urination', 'Blood in Urine', 'Urinary Urgency', 'Urinary Incontinence', 'Difficulty Urinating', 'Flank Pain',
  // Reproductive
  'Menstrual Irregularity', 'Heavy Menstrual Bleeding', 'Pelvic Pain', 'Vaginal Discharge', 'Breast Lump', 'Erectile Dysfunction', 'Testicular Pain',
  // Psychiatric
  'Insomnia', 'Anxiety', 'Depression', 'Mood Swings', 'Irritability', 'Panic Attacks', 'Hallucinations', 'Suicidal Thoughts',
  // Endocrine
  'Heat Intolerance', 'Cold Intolerance', 'Increased Thirst', 'Increased Hunger', 'Neck Swelling/Goiter',
];

const PMH_LIST = [
  // Cardiovascular
  'Hypertension', 'Coronary Artery Disease', 'Heart Failure', 'Atrial Fibrillation', 'Valvular Heart Disease', 'Peripheral Vascular Disease', 'Deep Vein Thrombosis', 'Pulmonary Embolism', 'Aortic Aneurysm', 'Myocardial Infarction', 'Cardiomyopathy', 'Congenital Heart Disease',
  // Respiratory
  'Asthma', 'COPD', 'Bronchiectasis', 'Pulmonary Fibrosis', 'Sleep Apnea', 'Pneumonia (Recurrent)', 'Pleural Effusion', 'Sarcoidosis',
  // Endocrine
  'Diabetes Mellitus Type 1', 'Diabetes Mellitus Type 2', 'Hypothyroidism', 'Hyperthyroidism', 'Cushing Syndrome', 'Addison Disease', 'PCOS', 'Gestational Diabetes',
  // Gastrointestinal
  'GERD', 'Peptic Ulcer Disease', 'Inflammatory Bowel Disease', 'Crohn Disease', 'Ulcerative Colitis', 'Celiac Disease', 'Irritable Bowel Syndrome', 'Fatty Liver Disease', 'Cirrhosis', 'Hepatitis B', 'Hepatitis C', 'Gallstones', 'Pancreatitis', 'Diverticulitis',
  // Renal
  'Chronic Kidney Disease', 'Kidney Stones', 'Polycystic Kidney Disease', 'Nephrotic Syndrome', 'Renal Transplant',
  // Neurological
  'Stroke', 'Epilepsy', 'Migraine', 'Parkinson Disease', 'Multiple Sclerosis', 'Alzheimer Disease', 'Neuropathy', 'Bell Palsy', 'Cerebral Palsy',
  // Musculoskeletal
  'Osteoarthritis', 'Rheumatoid Arthritis', 'Gout', 'Osteoporosis', 'Ankylosing Spondylitis', 'Fibromyalgia', 'Lupus (SLE)', 'Scleroderma', 'Disc Herniation',
  // Psychiatric
  'Depression', 'Anxiety Disorder', 'Bipolar Disorder', 'Schizophrenia', 'PTSD', 'OCD', 'ADHD', 'Eating Disorder', 'Substance Use Disorder',
  // Hematological
  'Anemia (Iron Deficiency)', 'Sickle Cell Disease', 'Thalassemia', 'Hemophilia', 'Leukemia', 'Lymphoma', 'Thrombocytopenia',
  // Oncological
  'Breast Cancer', 'Lung Cancer', 'Colon Cancer', 'Prostate Cancer', 'Thyroid Cancer', 'Cervical Cancer', 'Skin Cancer/Melanoma', 'Pancreatic Cancer', 'Bladder Cancer',
  // Infectious
  'HIV/AIDS', 'Tuberculosis', 'Malaria (History)', 'COVID-19 (History)',
  // Surgical History
  'Appendectomy', 'Cholecystectomy', 'Hysterectomy', 'Cesarean Section', 'CABG Surgery', 'Joint Replacement', 'Spinal Surgery', 'Hernia Repair',
  // Other
  'Thyroid Disease', 'Liver Disease', 'Kidney Transplant', 'Organ Transplant', 'Blood Transfusion History', 'Allergy to Medications',
];

const getEmptyPatient = (): PatientData => ({
  patientName: '', patientId: '', phoneNumber: '', age: '', gender: '', chiefComplaint: '',
  symptoms: [], customSymptoms: '', medicalHistory: [], customPMH: '',
  currentMedications: '', allergies: '', previousLabs: '',
  vitalSigns: { bloodPressure: '', heartRate: '', temperature: '', oxygenSaturation: '', respiratoryRate: '', weight: '', heightInches: '', printHeightInches: true },
  diagnosticFindings: ''
});

interface Props { onSubmit: (data: PatientData) => void; initialData?: PatientData | null; }

export default function PatientInputForm({ onSubmit, initialData }: Props) {
  const [data, setData] = useState<PatientData>(initialData || getEmptyPatient());
  const [activeTab, setActiveTab] = useState('demographics');
  const [errors, setErrors] = useState<string[]>([]);
  const [symSearch, setSymSearch] = useState('');
  const [pmhSearch, setPmhSearch] = useState('');
  const [newSymptom, setNewSymptom] = useState('');
  const [newPMH, setNewPMH] = useState('');
  const demographicsRef = useRef<HTMLElement>(null);
  const symptomsRef = useRef<HTMLElement>(null);
  const historyRef = useRef<HTMLElement>(null);
  const vitalsRef = useRef<HTMLElement>(null);
  const diagnosticsRef = useRef<HTMLElement>(null);

  const { clinic } = useAuth();
  const clinicId = clinic?.id || 'default';

  const [symptomList, setSymptomList] = useState<string[]>(SYMPTOM_LIST);
  const [pmhList, setPmhList] = useState<string[]>(PMH_LIST);

  useEffect(() => {
    if (!clinicId) return;
    const unsubSym = libraryService.subscribeToLibrary(clinicId, 'symptoms', (items) => {
      if (items && items.length > 0) setSymptomList(items);
    });
    const unsubPMH = libraryService.subscribeToLibrary(clinicId, 'pmh', (items) => {
      if (items && items.length > 0) setPmhList(items);
    });
    return () => { unsubSym(); unsubPMH(); };
  }, [clinicId]);

  const saveSymptomList = (newItems: string[]) => {
    setSymptomList(newItems);
    libraryService.saveLibraryItems(clinicId, 'symptoms', newItems);
  };

  const savePmhList = (newItems: string[]) => {
    setPmhList(newItems);
    libraryService.saveLibraryItems(clinicId, 'pmh', newItems);
  };


  const sections = [
    { id: 'demographics', label: 'Demographics', icon: '👤', ref: demographicsRef },
    { id: 'symptoms', label: 'Symptoms & Complaint', icon: '🩺', ref: symptomsRef },
    { id: 'history', label: 'History', icon: '📋', ref: historyRef },
    { id: 'vitals', label: 'Vitals', icon: '💓', ref: vitalsRef },
    { id: 'diagnostics', label: 'Diagnostics', icon: '🔬', ref: diagnosticsRef },
  ];

  useEffect(() => {
    if (initialData === null) {
      setData(getEmptyPatient());
      setErrors([]);
      setSymSearch('');
      setPmhSearch('');
    } else if (initialData) {
      setData({
        ...getEmptyPatient(),
        ...initialData,
        symptoms: initialData.symptoms || [],
        medicalHistory: initialData.medicalHistory || [],
        vitalSigns: { ...getEmptyPatient().vitalSigns, ...(initialData.vitalSigns || {}) }
      });
    }
  }, [initialData]);

  const scrollToSection = (id: string) => {
    const section = sections.find(s => s.id === id);
    if (section?.ref.current) {
      section.ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 150;
      for (const section of sections) {
        const el = section.ref.current;
        if (el && el.offsetTop <= scrollPos && el.offsetTop + el.offsetHeight > scrollPos) {
          setActiveTab(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const update = (field: string, value: string) => setData(p => ({ ...p, [field]: value }));
  const updateVital = (field: keyof PatientData['vitalSigns'], value: string) => setData(p => ({ ...p, vitalSigns: { ...p.vitalSigns, [field]: value } }));
  const toggleSymptom = (s: string) => setData(p => ({ ...p, symptoms: p.symptoms.includes(s) ? p.symptoms.filter(x => x !== s) : [...p.symptoms, s] }));
  const togglePMH = (h: string) => setData(p => ({ ...p, medicalHistory: p.medicalHistory.includes(h) ? p.medicalHistory.filter(x => x !== h) : [...p.medicalHistory, h] }));


  const handleSubmit = () => {
    setErrors([]); // Clear any previous errors
    const finalData = { ...data };
    if (!finalData.patientId.trim()) finalData.patientId = 'PT-' + Date.now().toString(36).toUpperCase();
    onSubmit(finalData);
  };

  const handleAddCustomSymptom = () => {
    const val = newSymptom.trim();
    if (!val) return;
    if (!symptomList.some(s => s.toLowerCase() === val.toLowerCase())) saveSymptomList([...symptomList, val]);
    if (!data.symptoms.includes(val)) toggleSymptom(val);
    setNewSymptom('');
  };


  const handleAddCustomPMH = () => {
    const val = newPMH.trim();
    if (!val) return;
    if (!pmhList.some(h => h.toLowerCase() === val.toLowerCase())) savePmhList([...pmhList, val]);
    if (!data.medicalHistory.includes(val)) togglePMH(val);
    setNewPMH('');
  };


  const filteredSymptoms = symptomList.filter(s => s.toLowerCase().includes(symSearch.toLowerCase()));
  const filteredPMH = pmhList.filter(h => h.toLowerCase().includes(pmhSearch.toLowerCase()));

  const bmi = data.vitalSigns.weight && data.vitalSigns.heightInches
    ? (parseFloat(data.vitalSigns.weight) / Math.pow(parseFloat(data.vitalSigns.heightInches) * 0.0254, 2)).toFixed(1)
    : null;

  return (
    <div className="flex flex-col md:flex-row gap-6 items-start max-w-6xl mx-auto">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-[15%] shrink-0 sticky top-[3.7rem] md:top-8 md:h-[calc(100vh-4rem)] flex flex-col justify-start md:justify-center z-30 -mx-4 px-4 md:mx-0 md:px-0 mb-4 md:mb-0">
        <div className="bg-white/90 backdrop-blur-md md:bg-white rounded-xl md:rounded-2xl border border-gray-200 p-1.5 md:p-2 shadow-lg md:shadow-sm flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-1 no-scrollbar whitespace-nowrap">
          {sections.map(s => (
            <button key={s.id} onClick={() => scrollToSection(s.id)}
              className={`flex-1 md:w-full flex items-center justify-center md:justify-start gap-2 md:gap-3 px-4 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[11px] md:text-sm font-bold transition-all ${activeTab === s.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}>
              <span className="text-base md:text-lg">{s.icon}</span>
              <span className="hidden sm:inline md:inline">{s.label}</span>
            </button>
          ))}
        </div>
        {errors.length > 0 && (
          <div className="hidden md:block mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
            {errors.map((e, i) => <p key={i} className="text-red-700 text-[10px] font-bold">⚠ {e}</p>)}
          </div>
        )}
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 space-y-10 pb-32 w-full">
        {/* Section: Demographics */}
        <section ref={demographicsRef} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">👤 Patient Demographics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Full Name *</label>
              <input value={data.patientName} onChange={e => update('patientName', e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" placeholder="Enter patient name" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Patient ID</label>
              <input value={data.patientId} onChange={e => update('patientId', e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" placeholder="Auto-generated if empty" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">📱 Phone / Mobile</label>
              <input value={data.phoneNumber} onChange={e => update('phoneNumber', e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" placeholder="Search past patient by phone..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Age *</label>
                <input type="number" value={data.age} onChange={e => update('age', e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none transition-all" placeholder="Years" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase">Gender *</label>
                <select value={data.gender} onChange={e => update('gender', e.target.value)} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none bg-white transition-all">
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Symptoms */}
        <section ref={symptomsRef} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b pb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">🩺 Symptoms & Complaint</h3>
          </div>
          <div className="mb-6 bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-amber-700 uppercase tracking-wide">✏️ Chief Complaint / Major Symptoms</label>
              <SpeechMicButton onResult={(text) => update('chiefComplaint', (data.chiefComplaint ? data.chiefComplaint + ' ' : '') + text)} />
            </div>
            <textarea value={data.chiefComplaint} onChange={e => update('chiefComplaint', e.target.value)} rows={3} className="w-full border-2 border-amber-200 rounded-xl px-4 py-3 text-sm focus:border-amber-500 outline-none bg-white transition-all shadow-inner" placeholder="Main reason for visit... (or use 🎤 mic)" />
          </div>
          <div className="space-y-4">
            <label className="block text-xs font-bold text-gray-500 uppercase">Check Symptoms to include</label>
            <div className="flex flex-col md:flex-row gap-2">
              <input value={symSearch} onChange={e => setSymSearch(e.target.value)} className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all" placeholder="Search symptoms..." />
              <div className="flex gap-2">
                <input value={newSymptom} onChange={e => setNewSymptom(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCustomSymptom()} className="w-full md:w-48 border-2 border-blue-50 rounded-xl px-4 py-2 text-sm focus:border-blue-300 outline-none bg-blue-50/30" placeholder="Type new symptom..." />
                <button onClick={handleAddCustomSymptom} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-sm whitespace-nowrap">Add & Save</button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 max-h-72 overflow-y-auto p-2 bg-gray-50 rounded-xl border border-dashed">
              {filteredSymptoms.map(s => (
                <div key={s} className="group relative flex">
                  <button onClick={() => toggleSymptom(s)} className={`pr-8 pl-4 py-2 rounded-xl text-xs font-semibold transition-all border ${data.symptoms.includes(s) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                    {data.symptoms.includes(s) ? '✓ ' : '+ '}{s}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); saveSymptomList(symptomList.filter(item => item !== s)); }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-red-500 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>

                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: History */}
        <section ref={historyRef} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 border-b pb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">📋 Medical History</h3>
          </div>
          <div className="flex flex-col gap-6">
            <div className="space-y-4 border-b border-gray-100 pb-6">
              <label className="block text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5"><span className="text-sm">🏥</span> Past Conditions</label>
              <div className="flex flex-col md:flex-row gap-2">
                <input value={pmhSearch} onChange={e => setPmhSearch(e.target.value)} className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-purple-500 outline-none transition-all" placeholder="Search PMH..." />
                <div className="flex gap-2">
                  <input value={newPMH} onChange={e => setNewPMH(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddCustomPMH()} className="w-full md:w-48 border-2 border-purple-50 rounded-xl px-4 py-2 text-sm focus:border-purple-300 outline-none bg-purple-50/30" placeholder="Type new condition..." />
                  <button onClick={handleAddCustomPMH} className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 shadow-sm whitespace-nowrap">Add & Save</button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-purple-50/30 rounded-xl border border-purple-100 border-dashed">
                {filteredPMH.map(h => (
                  <div key={h} className="group relative flex">
                    <button onClick={() => togglePMH(h)} className={`pr-8 pl-3 py-1.5 rounded-lg text-xs font-medium transition-all ${data.medicalHistory.includes(h) ? 'bg-purple-600 text-white shadow-md' : 'bg-white text-gray-600 border'}`}>
                      {h}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); savePmhList(pmhList.filter(item => item !== h)); }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-red-300 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </button>

                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4 border-b border-gray-100 pb-6">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5"><span className="text-sm">💊</span> Current Medications</label>
                <SpeechMicButton onResult={(text) => update('currentMedications', (data.currentMedications ? data.currentMedications + ' ' : '') + text)} />
              </div>
              <textarea value={data.currentMedications} onChange={e => update('currentMedications', e.target.value)} rows={3} className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 text-sm focus:border-blue-500 outline-none transition-all" placeholder="List medications... (or use 🎤 mic)" />
            </div>

            <div className="space-y-4 border-b border-gray-100 pb-6">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-500 uppercase flex items-center gap-1.5"><span className="text-sm">⚠️</span> Allergies</label>
                <SpeechMicButton onResult={(text) => update('allergies', (data.allergies ? data.allergies + ' ' : '') + text)} />
              </div>
              <textarea value={data.allergies} onChange={e => update('allergies', e.target.value)} rows={2} className="w-full border-2 border-red-50 rounded-xl px-4 py-3 text-sm focus:border-red-400 outline-none bg-red-50/10 shadow-sm" placeholder="List allergies... (or use 🎤 mic)" />
            </div>

            <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-teal-700 uppercase tracking-wide">🧪 Previous Lab Results</label>
                <SpeechMicButton onResult={(text) => update('previousLabs', ((data.previousLabs || '') ? (data.previousLabs || '') + ' ' : '') + text)} />
              </div>
              <textarea value={data.previousLabs || ''} onChange={e => update('previousLabs', e.target.value)} rows={3} className="w-full border-2 border-teal-200 rounded-xl px-4 py-3 text-sm focus:border-teal-500 outline-none bg-white transition-all shadow-inner" placeholder="e.g. CBC, HbA1c, Lipid panel... (or use 🎤 mic)" />
            </div>
          </div>
        </section>

        {/* Section: Vitals */}
        <section ref={vitalsRef} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-b pb-4">💓 Vital Signs</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { key: 'bloodPressure', label: 'Blood Pressure', placeholder: '120/80', unit: 'mmHg', icon: '🩸' },
              { key: 'heartRate', label: 'Heart Rate', placeholder: '72', unit: 'bpm', icon: '💓' },
              { key: 'temperature', label: 'Temperature', placeholder: '98.6', unit: '°F', icon: '🌡️' },
              { key: 'oxygenSaturation', label: 'SpO₂', placeholder: '98', unit: '%', icon: '🫁' },
              { key: 'respiratoryRate', label: 'Resp. Rate', placeholder: '16', unit: '/min', icon: '💨' },
              { key: 'weight', label: 'Weight', placeholder: '70', unit: 'kg', icon: '⚖️' },
            ].map(v => (
              <div key={v.key} className="bg-gray-50/50 rounded-xl p-4 border-2 border-gray-50">
                <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{v.icon} {v.label}</label>
                <div className="flex items-center gap-2">
                  <input value={(data.vitalSigns as unknown as Record<string, string>)[v.key]} onChange={e => updateVital(v.key as keyof PatientData['vitalSigns'], e.target.value)} className="w-full border-2 border-gray-100 rounded-lg px-2 py-2 text-sm focus:border-blue-500 outline-none bg-white transition-all font-bold text-gray-700" placeholder={v.placeholder} />
                  <span className="text-[10px] font-bold text-gray-300">{v.unit}</span>
                </div>
              </div>
            ))}
            <div className="bg-gray-50/50 rounded-xl p-4 border-2 border-gray-50 md:col-span-2 flex items-center gap-4">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">📏 Height (Inches)</label>
                <input value={data.vitalSigns.heightInches || ''} onChange={e => setData(p => ({ ...p, vitalSigns: { ...p.vitalSigns, heightInches: e.target.value } }))} className="w-full border-2 border-gray-100 rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white font-bold" type="number" step="any" placeholder="68" />
              </div>
              {bmi && (
                <div className={`shrink-0 px-6 py-4 rounded-xl text-center shadow-sm ${parseFloat(bmi) < 18.5 ? 'bg-yellow-100 text-yellow-800' : parseFloat(bmi) < 25 ? 'bg-green-100 text-green-800' : parseFloat(bmi) < 30 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                  <div className="text-[10px] font-bold uppercase opacity-60">BMI Range</div>
                  <div className="text-2xl font-black">{bmi}</div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section: Diagnostics */}
        <section ref={diagnosticsRef} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">🔬 Diagnostic Findings & Notes</h3>
            <SpeechMicButton onResult={(text) => update('diagnosticFindings', (data.diagnosticFindings ? data.diagnosticFindings + ' ' : '') + text)} />
          </div>
          <textarea value={data.diagnosticFindings} onChange={e => update('diagnosticFindings', e.target.value)} rows={8} className="w-full border-2 border-gray-100 rounded-2xl px-6 py-6 text-sm focus:border-blue-500 outline-none transition-all shadow-inner" placeholder="Type examination findings, or use 🎤 mic to dictate..." />
        </section>

        <div className="flex justify-center pt-8">
          <button id="main-submit-btn" onClick={handleSubmit} className="px-12 py-4 bg-green-600 text-white rounded-2xl text-lg font-black shadow-2xl hover:bg-green-700 active:scale-95 transition-all flex items-center gap-3">
            <span className="text-2xl">🩺</span> Confirm All & Add Recommendations
          </button>
        </div>
      </div>
    </div>
  );
}
