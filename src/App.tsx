import { useState, useEffect, useCallback } from 'react';
import type { PatientData, Recommendations, PrescriptionItem, ClinicInfo, SavedPatientRecord, ReportLayoutConfig } from './types';
import { generateRecommendations } from './data/medicalKnowledge';
import { generateDummyPatients } from './data/dummyPatients';
import PatientInputForm from './components/PatientInputForm';
import RecommendationPanel from './components/RecommendationPanel';
import PrintableReport from './components/PrintableReport';
import ClinicSettingsModal from './components/ClinicSettingsModal';
import PatientHistoryPanel from './components/PatientHistoryPanel';
import ReportCustomizer from './components/ReportCustomizer';
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import FirstTimeSetup from './components/FirstTimeSetup';

import { getClinicInfo, saveClinicInfo, getReportLayout, saveReportLayout, initializeClinic } from './services/clinicService';
import { subscribeToPatients, savePatient, deletePatient, deleteAllPatients } from './services/patientService';
import { createProfile } from './services/userService';

import PinLoginOverlay from './components/PinLoginOverlay';
import { useAuth, AuthProvider } from './context/AuthContext';



// Vercel deployment trigger - unblocking build pipeline


// ── Test / demo account constants ─────────────────────────────────────────────
const TEST_DOCTORS = [
  { id: 'doc-test-1', doctorName: 'Test Doctor', doctorTitle: 'MD', specialization: 'General Practice', currentDesignation: '', licenseNumber: 'TEST-001' }
];
const TEST_CLINIC: ClinicInfo = {
  clinicName: 'Test Clinic', address: '123 Test St, Medical District',
  phone: '(555) 123-4567', email: 'test@medassist.com',
  logoDataUrl: '', headerSubtitle: '',
  doctors: TEST_DOCTORS, activeDoctorId: 'doc-test-1',
  reportTemplates: [],
  footerText: 'CONFIDENTIAL — This document is for professional medical use only.',
  splashSettings: {
    title: 'MedAssist',
    subtitle: 'Clinical Practice Management',
    loadingText: 'Initializing Healthcare Engine',
    showSplash: true
  }
};

const DEFAULT_LAYOUT: ReportLayoutConfig = {
  templateStyle: 'solid-basic', logoTemplate: 'hospital', layoutStyle: 'compact',
  fontSize: 9, fontFamily: 'inter', lineSpacing: 'normal', colorTheme: 'blue',
  showLogo: true, showBorder: true,
  sections: [
    { id: 'header', label: 'Header', visible: true, locked: true },
    { id: 'patient', label: 'Patient Information', visible: true },
    { id: 'clinical', label: 'Clinical Summary', visible: true },
    { id: 'vitals', label: 'Vital Signs', visible: true },
    { id: 'alerts', label: 'Clinical Alerts', visible: true },
    { id: 'diagnoses', label: 'Diagnoses', visible: true },
    { id: 'prescriptions', label: 'Prescriptions', visible: true },
    { id: 'labs', label: 'Labs & Imaging', visible: true },
    { id: 'notes', label: 'Instructions', visible: true },
    { id: 'followup', label: 'Follow-Up Plan', visible: true },
    { id: 'signature', label: 'Signature Block', visible: true },
    { id: 'footer', label: 'Footer', visible: true, locked: true },
  ]
};

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}


function App() {
  const [step, setStep] = useState(0);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo>(TEST_CLINIC);
  const [layoutConfig, setLayoutConfig] = useState<ReportLayoutConfig>(DEFAULT_LAYOUT);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendations | null>(null);
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
  const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
  const [selectedImaging, setSelectedImaging] = useState<string[]>([]);
  const [customLabs, setCustomLabs] = useState<string[]>([]);
  const [customImaging, setCustomImaging] = useState<string[]>([]);
  const [savedRecords, setSavedRecords] = useState<SavedPatientRecord[]>([]);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [showDoctorMenu, setShowDoctorMenu] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null);
  const [isRecordSaving, setIsRecordSaving] = useState(false);
  const [recordSavedSuccessfully, setRecordSavedSuccessfully] = useState(false);

  const { user, sessionUser, clinic, loading, activeProfile, switchProfile, logout } = useAuth();

  const currentClinicId = clinic?.id || 'default';
  const currentUser = { 
    id: activeProfile?.id || user?.id || 'admin-local', 
    name: activeProfile?.full_name || user?.full_name || 'Doctor', 
    role: activeProfile?.role || user?.role || 'admin', 
    clinicId: currentClinicId 
  };




  // ── On mount: load clinic info + layout ──────────────────────
  useEffect(() => {
    (async () => {
      // Don't try to load if we don't have a valid clinic ID yet
      if (!currentClinicId || currentClinicId === 'default') return;

      const [info, layout] = await Promise.all([
        getClinicInfo(currentClinicId),
        getReportLayout(currentClinicId),
      ]);

      if (info) {
        setClinicInfo(info);
        setNeedsSetup(false);
      } else {
        // If we have a clinic ID but no info, maybe it's still being created
        // or we need to show the setup
        setNeedsSetup(true);
      }

      if (layout) {
        setLayoutConfig({ ...DEFAULT_LAYOUT, ...layout, sections: layout.sections || DEFAULT_LAYOUT.sections });
      } else {
        setLayoutConfig(DEFAULT_LAYOUT);
      }
    })();
  }, [currentClinicId]);

  // ── Subscribe to patient records (local) ───────────────────
  useEffect(() => {
    if (needsSetup === true || !currentClinicId || currentClinicId === 'default') return;
    const unsub = subscribeToPatients(currentClinicId, async (records) => {
      setSavedRecords(records);
      
      // Inject dummy Pakistani patients if list is empty
      if (records.length === 0) {
        const dummyRecords = generateDummyPatients([clinicInfo.activeDoctorId || TEST_DOCTORS[0].id], currentClinicId);
        
        // Save them to Supabase to persist them permanently
        for (const dr of dummyRecords) {
          await savePatient(currentClinicId, dr);
        }
      }
    });
    return unsub; 
  }, [needsSetup, clinicInfo.activeDoctorId, currentClinicId]);


  // ── Auto-save clinic info whenever it changes ──────────────────
  useEffect(() => {
    // Only save automatically if we are 100% initialized AND NOT in a setup state
    if (needsSetup !== false || !currentClinicId || currentClinicId === 'default') return;
    
    // Check if what we're about to save is actually worth saving (not just initial defaults)
    if (clinicInfo.clinicName === 'Test Clinic' && clinicInfo.doctors.length === 1 && !clinicInfo.logoDataUrl) return;

    saveClinicInfo(currentClinicId, clinicInfo).catch(console.error);
  }, [clinicInfo, needsSetup, currentClinicId]);

  // ── Auto-save report layout ────────────────────────────────────
  useEffect(() => {
    if (needsSetup !== false || !currentClinicId || currentClinicId === 'default') return; // Only save AFTER load/setup completes
    saveReportLayout(currentClinicId, layoutConfig).catch(console.error);
  }, [layoutConfig, needsSetup, currentClinicId]);


  const activeDoctor = (clinicInfo?.doctors || []).find(d => d.id === clinicInfo?.activeDoctorId) || clinicInfo?.doctors?.[0] || TEST_DOCTORS[0];

  const handlePatientSubmit = (data: PatientData) => {
    setPatientData(data);
    const recs = generateRecommendations(data);
    setRecommendations(recs);
    setSelectedLabs(recs.labTests.map(l => l.name));
    setSelectedImaging(recs.imagingStudies.map(s => s.name));
    setCustomLabs([]);
    setCustomImaging([]);
    setStep(1);
  };

  const saveCurrentRecord = useCallback(async () => {
    if (!patientData || !recommendations) return;
    const recordId = editingRecordId || ('rec-' + Date.now());
    const record: SavedPatientRecord = {
      id: recordId,
      savedAt: new Date().toISOString(),
      doctorId: clinicInfo.activeDoctorId || TEST_DOCTORS[0].id,
      patientData, recommendations, prescriptions,
      selectedLabs, selectedImaging, customLabs, customImaging,
      clinicId: currentClinicId,
    };

    // Optimistically update the UI records list
    setSavedRecords(prev => {
      const idx = prev.findIndex(r => r.id === recordId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = record;
        return updated;
      }
      return [record, ...prev];
    });

    if (!editingRecordId) setEditingRecordId(recordId);
    
    setIsRecordSaving(true);
    setRecordSavedSuccessfully(false);
    
    try {
      await savePatient(currentClinicId, record);
      setRecordSavedSuccessfully(true);
      setTimeout(() => setRecordSavedSuccessfully(false), 2000);
    } catch (err) {
      console.error('Save failed:', err);
      // alert('Error saving to database. But record is saved in local history.');
    } finally {
      setIsRecordSaving(false);
    }

  }, [patientData, recommendations, prescriptions, selectedLabs, selectedImaging, customLabs, customImaging, clinicInfo.activeDoctorId, editingRecordId, currentClinicId]);

  const handleNewPatient = useCallback(() => {
    // Force reset all states to avoid jamming
    setEditingRecordId(null);
    setPatientData(null);
    setRecommendations(null);
    setPrescriptions([]);
    setSelectedLabs([]);
    setSelectedImaging([]);
    setCustomLabs([]);
    setCustomImaging([]);
    setStep(0);
  }, []);

  const loadRecord = (record: SavedPatientRecord) => {
    setPatientData({ ...record.patientData });
    const rec = record.recommendations || {} as Recommendations;
    setRecommendations({
      diagnoses: rec.diagnoses || [], medications: rec.medications || [],
      labTests: rec.labTests || [], imagingStudies: rec.imagingStudies || [],
      clinicalNotes: rec.clinicalNotes || [], instructions: rec.instructions || '',
      warnings: rec.warnings || [], followUpDate: rec.followUpDate || '',
    });
    setPrescriptions([...(record.prescriptions || [])]);
    setSelectedLabs([...(record.selectedLabs || [])]);
    setSelectedImaging([...(record.selectedImaging || [])]);
    setCustomLabs([...(record.customLabs || [])]);
    setCustomImaging([...(record.customImaging || [])]);
    setEditingRecordId(record.id);
    if (record.doctorId && clinicInfo.doctors.some(d => d.id === record.doctorId)) {
      setClinicInfo(p => ({ ...p, activeDoctorId: record.doctorId }));
    }
    setStep(2); // Preview
  };

  const loadRecordAsNew = (record: SavedPatientRecord) => {
    // This is the "New Visit" logic for a returning patient
    // Keep: Name, ID, Phone, Age, Gender
    // Keep: Medical History (Past Conditions, Allergies, PMH)
    // Clear: Current Symptoms, Vitals, Findings, Recommendations, Prescriptions
    
    const pData = record.patientData;
    const cleanVisitData: PatientData = {
      ...pData,
      // Visit-specific fields to clear:
      chiefComplaint: '',
      symptoms: [],
      customSymptoms: '',
      vitalSigns: {
        bloodPressure: '',
        heartRate: '',
        temperature: '',
        oxygenSaturation: '',
        respiratoryRate: '',
        weight: '',
        heightInches: pData.vitalSigns?.heightInches || '',
        printHeightInches: pData.vitalSigns?.printHeightInches ?? true,
      },
      diagnosticFindings: '',
      // Note: allergies, currentMedications, medicalHistory, customPMH are kept.
    };

    setPatientData(cleanVisitData);
    setRecommendations(null);
    setPrescriptions([]);
    setSelectedLabs([]);
    setSelectedImaging([]);
    setCustomLabs([]);
    setCustomImaging([]);
    
    setEditingRecordId(null); // Ensure it saves as a NEW history record
    setStep(0); // Take user to input form to update demographics/vitals
  };

  const deleteRecord = async (id: string) => {
    await deletePatient(currentClinicId, id);
  };

  const clearAllRecords = async () => {
    await deleteAllPatients(currentClinicId);
  };



  const steps = [
    { label: 'Patient Input', icon: '📝' },
    { label: 'Recommendations', icon: '💊' },
    { label: 'Report', icon: '📄' },
  ];

  if (showWelcome && (clinicInfo.splashSettings?.showSplash !== false)) return <WelcomeScreen clinicInfo={clinicInfo} onComplete={() => setShowWelcome(false)} />;

  if (loading) return null;

  if (!sessionUser) {
    return <LoginScreen />;
  }

  if (needsSetup === true) {

    return (
      <>
        <FirstTimeSetup
          onComplete={async (info) => {
            setClinicInfo(info);
            let cid = currentClinicId;
            
            try {
              if (cid === 'default' || !cid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                cid = await initializeClinic(info);
                if (sessionUser?.id) {
                  // We also create the profile here for the first time
                  await createProfile({ 
                    id: sessionUser.id,
                    clinicId: cid,
                    full_name: (sessionUser.user_metadata?.full_name || info.doctors[0].doctorName),
                    role: 'admin',
                    email: sessionUser.email,
                    status: 'active',
                    pin_code: '1234'
                  } as any);
                }
              } else {
                await saveClinicInfo(cid, info);
              }
              setNeedsSetup(false);
            } catch (err) {
              console.error('Failed to launch clinic:', err);
              alert('Error saving clinic. Check database connectivity.');
            }
          }}
        />
        
        {/* Secure PIN Lock */}
        <PinLoginOverlay />
      </>
    );
  }


  if (needsSetup === null || loading) return null;


  return (
    <div className="min-h-screen bg-gray-50">
      <PinLoginOverlay />

      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 min-h-[3.5rem] py-2 flex items-center justify-between flex-wrap gap-2">

          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            {clinicInfo.logoDataUrl ? (
              <img src={clinicInfo.logoDataUrl} alt="Logo" className="w-8 h-8 rounded-lg object-contain" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">M</div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-gray-800 leading-tight">{clinicInfo.clinicName}</h1>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-green-50 rounded-full border border-green-100">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_4px_rgba(34,197,94,0.6)]"></span>
                  <span className="text-[8px] font-black text-green-700 uppercase tracking-tighter">Live Cloud Sync</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider leading-tight">{currentUser.role}: {currentUser.name}</p>
            </div>

          </div>

          {/* Step navigator */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-xl p-1 gap-0.5 mx-auto">
            {steps.map((s, i) => {
              const isActive = step === i;
              const isDone = i < step;
              const isRecommendationFromInput = step === 0 && i === 1;
              const canClick = isDone || isActive || isRecommendationFromInput;

              return (
                <button key={i}
                  onClick={() => {
                    if (isRecommendationFromInput) {
                      document.getElementById('main-submit-btn')?.click();
                    } else if (canClick && (i === 0 || patientData)) {
                      setStep(i);
                    }
                  }}
                  disabled={!canClick}
                  className={`h-8 px-4 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 whitespace-nowrap
                    ${isActive ? 'bg-white text-blue-700 shadow-sm font-semibold' : canClick ? 'text-blue-600 hover:bg-white/70 hover:shadow-sm cursor-pointer' : 'text-gray-400 cursor-not-allowed'}`}>
                  <span className="text-sm">{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
            {/* Doctor switcher */}
            <div className="relative">
              <button onClick={() => setShowDoctorMenu(!showDoctorMenu)}
                className="h-8 flex items-center gap-1.5 px-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 font-medium hover:bg-emerald-100 transition-all">
                <span>👨‍⚕️</span>
                <span className="max-w-[90px] truncate">{activeDoctor?.doctorName}</span>
                <span className="text-emerald-400 text-[10px]">▼</span>
              </button>
              {showDoctorMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowDoctorMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-xl shadow-2xl z-50 w-72 max-h-80 overflow-y-auto">
                    <div className="p-2 border-b bg-gray-50 rounded-t-xl">
                      <span className="text-xs font-medium text-gray-500">Switch Active Doctor</span>
                    </div>
                    {clinicInfo.doctors.map(doc => (
                      <button key={doc.id} onClick={() => { setClinicInfo(p => ({ ...p, activeDoctorId: doc.id })); setShowDoctorMenu(false); }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-all flex items-center justify-between ${doc.id === clinicInfo.activeDoctorId ? 'bg-green-50' : ''}`}>
                        <div>
                          <div className="font-medium text-gray-800">{doc.doctorName}</div>
                          <div className="text-xs text-gray-500">{doc.specialization}</div>
                        </div>
                        {doc.id === clinicInfo.activeDoctorId && <span className="text-green-600 text-xs font-medium">✓</span>}
                      </button>
                    ))}
                    <button onClick={() => { setShowSettings(true); setShowDoctorMenu(false); }}
                      className="w-full text-left px-3 py-2 text-xs text-blue-600 border-t hover:bg-blue-50">
                      ⚙️ Manage Doctors in Settings
                    </button>
                  </div>
                </>
              )}
            </div>

            <button onClick={() => setShowHistory(true)} className="relative h-8 px-2.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 transition-all flex items-center gap-1.5">
              <span>📋</span><span>Records</span>
              {savedRecords.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] min-w-[17px] h-[17px] rounded-full flex items-center justify-center font-bold px-0.5">
                  {savedRecords.length}
                </span>
              )}
            </button>

            <button onClick={() => setShowSettings(true)} className="h-8 w-8 bg-gray-100 rounded-lg text-sm text-gray-600 hover:bg-gray-200 transition-all flex items-center justify-center">⚙️</button>

            <button onClick={handleNewPatient} className="h-8 px-3 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-1 shadow-sm">
              <span className="text-base font-bold leading-none">+</span><span>New Patient</span>
            </button>

            {activeProfile && (
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => switchProfile()} 
                  title="Lock/Switch User"
                  className="h-8 w-8 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all flex items-center justify-center"
                >
                  🔒
                </button>
                <button 
                  onClick={() => logout()} 
                  className="h-8 px-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-1.5"
                >
                  🚪 Logout
                </button>
              </div>
            )}

          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {step === 0 && (
          <PatientInputForm onSubmit={handlePatientSubmit} initialData={patientData} recentPatients={savedRecords} />
        )}
        {step === 1 && recommendations && (
          <RecommendationPanel
            recommendations={recommendations} setRecommendations={setRecommendations}
            prescriptions={prescriptions} setPrescriptions={setPrescriptions}
            selectedLabs={selectedLabs} setSelectedLabs={setSelectedLabs}
            selectedImaging={selectedImaging} setSelectedImaging={setSelectedImaging}
            customLabs={customLabs} setCustomLabs={setCustomLabs}
            customImaging={customImaging} setCustomImaging={setCustomImaging}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && patientData && recommendations && (
          <div>
            <div className="no-print mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setStep(1)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">← Recommendations</button>
                <button onClick={() => setShowCustomizer(!showCustomizer)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${showCustomizer ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200'}`}>
                  🎨 Customize Report
                </button>
                <button 
                  onClick={async () => { await saveCurrentRecord(); }}
                  disabled={isRecordSaving}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    recordSavedSuccessfully 
                      ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
                      : isRecordSaving 
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {recordSavedSuccessfully ? '✓ Saved' : isRecordSaving ? 'Saving...' : '💾 Save to Records'}
                </button>
              </div>
            </div>
            {showCustomizer ? (
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 w-full md:w-[65%] order-2 md:order-1 border border-gray-200 bg-gray-100 rounded-xl p-4 overflow-x-auto shadow-inner min-h-[70vh]">
                  <div className="mx-auto transform origin-top" style={{ width: 'fit-content' }}>
                    <PrintableReport patient={patientData} recommendations={recommendations} prescriptions={prescriptions}
                      clinicInfo={clinicInfo} selectedLabs={selectedLabs} selectedImaging={selectedImaging}
                      customLabs={customLabs} customImaging={customImaging} layoutConfig={layoutConfig} />
                  </div>
                </div>
                <div className="w-full md:w-[35%] order-1 md:order-2 shrink-0 no-print sticky top-6">
                  <ReportCustomizer
                    config={layoutConfig}
                    onChange={setLayoutConfig}
                    onClose={() => setShowCustomizer(false)}
                    clinicInfo={clinicInfo}
                    onSaveTemplates={async (templates: any) => {
                      const updated = { ...clinicInfo, reportTemplates: templates };
                      setClinicInfo(updated);
                      await saveClinicInfo(currentClinicId, updated);
                    }}

                  />
                </div>
              </div>
            ) : (
              <PrintableReport patient={patientData} recommendations={recommendations} prescriptions={prescriptions}
                clinicInfo={clinicInfo} selectedLabs={selectedLabs} selectedImaging={selectedImaging}
                customLabs={customLabs} customImaging={customImaging} layoutConfig={layoutConfig} />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      {showSettings && (
        <ClinicSettingsModal
          clinicInfo={clinicInfo}
          onSave={async (info) => {
            setClinicInfo(info);
            await saveClinicInfo(currentClinicId, info);
          }}

          onClose={() => setShowSettings(false)}
        />
      )}
      {showHistory && (
        <PatientHistoryPanel records={savedRecords} onLoad={loadRecord} onLoadAsNew={loadRecordAsNew}
          onDelete={deleteRecord} onClearAll={clearAllRecords} onClose={() => setShowHistory(false)}
          clinicInfo={clinicInfo} layoutConfig={layoutConfig} />
      )}
    </div>
  );
}

