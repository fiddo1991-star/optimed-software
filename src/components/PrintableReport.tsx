import { useRef, useCallback, useEffect } from 'react';
import type { PatientData, Recommendations, PrescriptionItem, ClinicInfo, ReportLayoutConfig } from '../types';

interface Props {
  patient: PatientData;
  recommendations: Recommendations;
  prescriptions: PrescriptionItem[];
  clinicInfo: ClinicInfo;
  selectedLabs: string[];
  selectedImaging: string[];
  customLabs: string[];
  customImaging: string[];
  layoutConfig: ReportLayoutConfig;
}

const THEMES: Record<string, { primary: string; light: string; headerBg: string; headerText: string }> = {
  blue: { primary: '#1e40af', light: '#eff6ff', headerBg: '#1e3a5f', headerText: '#ffffff' },
  teal: { primary: '#0f766e', light: '#f0fdfa', headerBg: '#134e4a', headerText: '#ffffff' },
  indigo: { primary: '#4338ca', light: '#eef2ff', headerBg: '#312e81', headerText: '#ffffff' },
  slate: { primary: '#334155', light: '#f8fafc', headerBg: '#1e293b', headerText: '#ffffff' },
  emerald: { primary: '#047857', light: '#ecfdf5', headerBg: '#064e3b', headerText: '#ffffff' },
  rose: { primary: '#be123c', light: '#fff1f2', headerBg: '#881337', headerText: '#ffffff' },
  violet: { primary: '#7c3aed', light: '#f5f3ff', headerBg: '#4c1d95', headerText: '#ffffff' },
  amber: { primary: '#b45309', light: '#fffbeb', headerBg: '#78350f', headerText: '#ffffff' },
};

export default function PrintableReport({ patient, recommendations, prescriptions, clinicInfo, selectedLabs, selectedImaging, customLabs, customImaging, layoutConfig }: Props) {
  const reportRef = useRef<HTMLDivElement>(null);
  const theme = THEMES[layoutConfig.colorTheme] || THEMES.blue;
  const fs = layoutConfig.fontSize;
  const activeDoctor = clinicInfo.doctors.find(d => d.id === clinicInfo.activeDoctorId) || clinicInfo.doctors[0];

  const isSectionVisible = (id: string) => {
    const sec = layoutConfig.sections.find(s => s.id === id);
    return sec ? sec.visible : true;
  };

  const allLabs = [...(selectedLabs || []), ...(customLabs || [])];
  const allImaging = [...(selectedImaging || []), ...(customImaging || [])];
  const allSymptoms = [...(patient.symptoms || []), ...(patient.customSymptoms ? patient.customSymptoms.split(',').map(s => s.trim()).filter(Boolean) : [])];
  const allPMH = [...(patient.medicalHistory || []), ...(patient.customPMH ? patient.customPMH.split(',').map(s => s.trim()).filter(Boolean) : [])];

  const spacingMap = { compact: { section: 3, cell: 1 }, standard: { section: 6, cell: 2 }, detailed: { section: 8, cell: 3 } };
  const sp = spacingMap[layoutConfig.layoutStyle];
  const vs = patient.vitalSigns || {};

  const ts = layoutConfig.textStyles || {};
  const globalFsOffset = ts.globalFontSize || 0;
  const globalFs = layoutConfig.fontSize + globalFsOffset;
  const globalColor = ts.globalColor || '#000000';

  const getFontFamily = (ff?: string, fallbackConfigFF?: string) =>
    ff === 'urdu' ? '"Jameel Noori Nastaleeq", sans-serif' :
      ff === 'serif' ? 'Georgia, serif' : ff === 'roboto' ? 'Roboto, sans-serif' : ff === 'inter' ? 'Inter, sans-serif' :
        (fallbackConfigFF === 'serif' ? 'Georgia, serif' : fallbackConfigFF === 'roboto' ? 'Roboto, sans-serif' : 'Inter, sans-serif');

  const getSectionStyle = (id: string, defAlign?: string, defColor?: string) => {
    const s = ts.sections?.[id] || {};
    return {
      maxWidth: '100%',
      boxSizing: 'border-box' as const,
      overflow: 'hidden',
      wordBreak: 'break-word' as const,
      color: s.color || defColor || 'inherit',
      fontFamily: s.fontFamily ? getFontFamily(s.fontFamily) : 'inherit',
      fontWeight: s.bold ? 'bold' : 'inherit',
      fontStyle: s.italic ? 'italic' : 'normal',
      textAlign: (s.align || defAlign || 'left') as any
    };
  };

  const getLabelStyle = (isAlert?: boolean): React.CSSProperties => {
    return {
      color: ts.labelColor || '#6b7280',
      fontSize: ts.labelFontSize !== undefined && ts.labelFontSize !== 0 ? globalFs + ts.labelFontSize : 'inherit',
      fontFamily: ts.labelFont ? getFontFamily(ts.labelFont) : 'inherit',
      fontWeight: ts.labelBold || isAlert ? 600 : 'normal'
    };
  };

  const tBorder = ts.tableBorderColor || '#e5e7eb';
  const thStyle = {
    padding: `${sp.cell}px 6px`,
    borderBottom: `1px solid ${tBorder}`,
    color: ts.tableHeaderColor || 'inherit',
    fontWeight: ts.tableHeaderBold !== false ? 'bold' : 'normal',
    fontSize: globalFs + (ts.tableHeaderFontSize || 0)
  };
  const tdStyle = { padding: `${sp.cell}px 6px`, borderBottom: `1px solid ${tBorder}` };

  const autoScaleForPrint = useCallback(() => {
    const el = reportRef.current;
    if (!el) return;
    el.style.transform = 'none';
    el.style.transformOrigin = 'top left';
    el.style.width = '100%';
    el.style.height = 'auto';
    const contentH = el.scrollHeight;
    const pageH = 1045;
    if (contentH > pageH) {
      const scale = pageH / contentH;
      el.style.transform = `scale(${scale})`;
      el.style.transformOrigin = 'top left';
      el.style.width = `${100 / scale}%`;
      el.style.height = `${pageH}px`;
    }
  }, []);

  const resetScale = useCallback(() => {
    const el = reportRef.current;
    if (!el) return;
    el.style.transform = 'none';
    el.style.width = '100%';
    el.style.height = 'auto';
  }, []);

  useEffect(() => {
    const beforePrint = () => autoScaleForPrint();
    const afterPrint = () => resetScale();
    window.addEventListener('beforeprint', beforePrint);
    window.addEventListener('afterprint', afterPrint);
    return () => { window.removeEventListener('beforeprint', beforePrint); window.removeEventListener('afterprint', afterPrint); };
  }, [autoScaleForPrint, resetScale]);

  const handlePrint = () => {
    autoScaleForPrint();
    setTimeout(() => {
        window.print();
        setTimeout(resetScale, 500);
    }, 100);
  };

  const handleSavePdf = () => {
    // In a web browser, Save to PDF is handled by the browser's Print dialog
    handlePrint();
  };

  const handleWhatsAppShare = () => {
    if (!patient.phoneNumber) {
      alert("No phone number found for this patient.");
      return;
    }

    // Format phone number (strip everything but numbers)
    const phone = patient.phoneNumber.replace(/\D/g, '');

    // Optional preset message
    const message = encodeURIComponent(`Hello ${patient.patientName},\n\nHere is your clinical report from ${clinicInfo.clinicName}.`);

    // Open WhatsApp
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  const sectionTitle = (_id: string, text: string, rightContent?: React.ReactNode, inline?: boolean) => {
    const tStyle = layoutConfig.templateStyle || 'solid-basic';
    const sColor = ts.headerColor || (tStyle === 'solid-dark' ? '#ffffff' : theme.primary);
    const sBg = ts.headerBgColor || (tStyle === 'solid-dark' ? theme.primary : tStyle === 'solid-boxed' ? theme.light : 'transparent');
    const sBold = ts.headerBold !== false ? 700 : 500;
    const sFs = globalFs + 1 + (ts.headerFontSize || 0);

    const titleContent = (
      <>
        <span>{text}</span>
        {rightContent && (
          <span style={{ 
            fontSize: globalFs - 1, 
            fontWeight: 'normal', 
            color: 'inherit', 
            opacity: 0.9,
            marginLeft: inline ? 12 : 0 
          }}>
            {rightContent}
          </span>
        )}
      </>
    );

    const containerStyle: React.CSSProperties = {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: inline ? 'flex-start' : 'space-between',
      alignItems: 'center',
      fontSize: sFs,
      fontWeight: sBold,
      color: sColor,
      marginBottom: sp.section,
      marginTop: sp.section
    };

    if (tStyle === 'solid-dark') {
      return (
        <div style={{ ...containerStyle, background: sBg, padding: '4px 10px', borderRadius: '4px' }}>
          {titleContent}
        </div>
      );
    }
    if (tStyle === 'solid-boxed') {
      return (
        <div style={{ ...containerStyle, border: `2px solid ${sColor}`, background: sBg, padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
          {titleContent}
        </div>
      );
    }
    return (
      <div style={{ ...containerStyle, borderBottom: `1.5px solid ${sColor}`, paddingBottom: 2 }}>
        {titleContent}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4 no-print">
        <h3 className="text-lg font-bold text-gray-800">Clinical Report Preview</h3>
        <div className="flex gap-2">
          <button onClick={handleWhatsAppShare} className="px-4 py-2.5 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all flex items-center gap-2">
            whatsapp
          </button>
          <button onClick={handleSavePdf} className="px-4 py-2.5 bg-gray-100 text-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all border border-gray-300">
            📥 Save as PDF
          </button>
          <button onClick={handlePrint} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">
            🖨️ Print Report
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg print-report" style={{
        position: 'relative',
        border: layoutConfig.showBorder ? `2px solid ${theme.primary}` : '1px solid #e5e7eb',
        width: layoutConfig.pageSize === 'A5' ? '148mm' : layoutConfig.pageSize === 'Letter' ? '215.9mm' : '210mm',
        minHeight: layoutConfig.pageSize === 'A5' ? '210mm' : layoutConfig.pageSize === 'Letter' ? '279.4mm' : '297mm',
        margin: '0 auto',
        borderRadius: layoutConfig.showBorder ? '12px' : '0',
        overflow: 'hidden'
      }}>
        {layoutConfig.showWatermark && clinicInfo.logoDataUrl && (
          <img
            src={clinicInfo.logoDataUrl}
            alt=""
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              opacity: layoutConfig.watermarkOpacity ?? 0.05,
              pointerEvents: 'none',
              zIndex: 10,
              width: `${layoutConfig.watermarkSize ?? 60}%`,
              height: `${layoutConfig.watermarkSize ?? 60}%`,
              objectFit: 'contain',
            }}
          />
        )}
        <div ref={reportRef} style={{
          padding: layoutConfig.layoutStyle === 'compact' ? '10px 14px' : '16px 20px',
          fontSize: globalFs,
          color: globalColor,
          fontFamily: getFontFamily(undefined, layoutConfig.fontFamily),
          lineHeight: layoutConfig.lineSpacing === 'tight' ? '1.2' : layoutConfig.lineSpacing === 'relaxed' ? '1.6' : '1.4',
          position: 'relative', zIndex: 1,
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          maxWidth: '100%'
        }}>

          {/* HEADER */}
          {(!layoutConfig.templateStyle || layoutConfig.templateStyle === 'solid-basic') && (
            <div style={{ background: theme.headerBg, color: theme.headerText, margin: layoutConfig.layoutStyle === 'compact' ? '0 0 12px' : '0 0 16px', padding: layoutConfig.layoutStyle === 'compact' ? '12px 16px' : '16px 20px', borderRadius: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                  {/* LOGO */}
                  {layoutConfig.showLogo && clinicInfo.logoDataUrl && (
                    <img src={clinicInfo.logoDataUrl} alt="Logo" style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'contain', background: '#fff', padding: 2 }} />
                  )}
                  <div style={{ fontSize: globalFs - 1 }}>
                    <div style={{ fontWeight: 700, fontSize: globalFs + 2 }}>{activeDoctor?.doctorName}</div>
                    <div style={{ opacity: 0.9 }}>{activeDoctor?.doctorTitle}</div>
                    <div style={{ opacity: 0.9 }}>{activeDoctor?.specialization}</div>
                    {activeDoctor?.currentDesignation && <div style={{ opacity: 0.9 }}>{activeDoctor?.currentDesignation}</div>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: globalFs + 5, fontWeight: 700 }}>{clinicInfo.clinicName}</div>
                  <div style={{ fontSize: globalFs - 1, opacity: 0.85 }}>{clinicInfo.address}</div>
                  {clinicInfo.headerSubtitle && <div style={{ fontSize: globalFs - 1, opacity: 0.75, marginTop: 1 }}>{clinicInfo.headerSubtitle}</div>}
                  <div style={{ opacity: 0.7, fontSize: globalFs - 1 }}>{clinicInfo.phone} · {clinicInfo.email}</div>
                </div>
              </div>
            </div>
          )}

          {layoutConfig.templateStyle === 'solid-dark' && (
            <div style={{ background: '#111827', color: '#ffffff', margin: layoutConfig.layoutStyle === 'compact' ? '0 0 16px' : '0 0 24px', padding: layoutConfig.layoutStyle === 'compact' ? '12px 16px' : '16px 24px', borderRadius: 12, borderBottom: `6px solid ${theme.primary}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
                  {layoutConfig.showLogo && clinicInfo.logoDataUrl && (
                    <img src={clinicInfo.logoDataUrl} alt="Logo" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'contain', background: '#fff', padding: 3 }} />
                  )}
                  <div style={{ fontSize: globalFs - 1 }}>
                    <div style={{ fontWeight: 800, fontSize: globalFs + 3, color: theme.light }}>{activeDoctor?.doctorName}</div>
                    <div style={{ color: '#d1d5db', marginTop: 1 }}>{activeDoctor?.doctorTitle}</div>
                    <div style={{ color: '#d1d5db', marginTop: 1 }}>{activeDoctor?.specialization}</div>
                    {activeDoctor?.currentDesignation && <div style={{ color: '#d1d5db', marginTop: 1 }}>{activeDoctor?.currentDesignation}</div>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: globalFs + 7, fontWeight: 800, letterSpacing: '-0.01em' }}>{clinicInfo.clinicName}</div>
                  <div style={{ fontSize: globalFs, color: '#9ca3af', marginTop: 2 }}>{clinicInfo.address}</div>
                  {clinicInfo.headerSubtitle && <div style={{ fontSize: globalFs, color: '#6b7280', marginTop: 1 }}>{clinicInfo.headerSubtitle}</div>}
                  <div style={{ color: '#9ca3af', marginTop: 1 }}>{clinicInfo.phone} · {clinicInfo.email}</div>
                </div>
              </div>
            </div>
          )}

          {layoutConfig.templateStyle === 'solid-boxed' && (
            <div style={{ background: theme.headerBg, color: theme.headerText, margin: layoutConfig.layoutStyle === 'compact' ? '4px 4px 16px' : '4px 4px 24px', padding: layoutConfig.layoutStyle === 'compact' ? '12px 16px' : '16px 24px', borderRadius: 12, border: `3px solid ${theme.primary}`, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
                  {layoutConfig.showLogo && clinicInfo.logoDataUrl && (
                    <img src={clinicInfo.logoDataUrl} alt="Logo" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'contain', background: '#fff', padding: 2 }} />
                  )}
                  <div style={{ fontSize: globalFs - 1 }}>
                    <div style={{ fontWeight: 800, fontSize: globalFs + 2 }}>{activeDoctor?.doctorName}</div>
                    <div style={{ opacity: 0.9 }}>{activeDoctor?.doctorTitle}</div>
                    <div style={{ opacity: 0.9 }}>{activeDoctor?.specialization}</div>
                    {activeDoctor?.currentDesignation && <div style={{ opacity: 0.9 }}>{activeDoctor?.currentDesignation}</div>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: globalFs + 6, fontWeight: 800 }}>{clinicInfo.clinicName}</div>
                  <div style={{ fontSize: globalFs, opacity: 0.9 }}>{clinicInfo.address}</div>
                  {clinicInfo.headerSubtitle && <div style={{ fontSize: globalFs, opacity: 0.75, marginTop: 1 }}>{clinicInfo.headerSubtitle}</div>}
                  <div style={{ opacity: 0.75, marginTop: 2 }}>{clinicInfo.phone} · {clinicInfo.email}</div>
                </div>
              </div>
            </div>
          )}

          {/* PATIENT INFO */}
          {isSectionVisible('patient') && (
            <div style={getSectionStyle('patient')}>
              {sectionTitle('patient', 'Patient Information', (
                <div style={{ display: 'flex', gap: 16 }}>
                  <span>Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              ))}
              <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: 24, rowGap: 4 }}>
                <div><span style={getLabelStyle()}>Name:</span> <strong>{patient.patientName}</strong></div>
                <div><span style={getLabelStyle()}>ID:</span> {patient.patientId}</div>
                <div><span style={getLabelStyle()}>Age:</span> {patient.age} yrs</div>
                <div><span style={getLabelStyle()}>Gender:</span> {patient.gender}</div>
                {patient.phoneNumber && <div><span style={getLabelStyle()}>Phone:</span> {patient.phoneNumber}</div>}
              </div>
            </div>
          )}

          {/* CLINICAL SUMMARY */}
          {isSectionVisible('clinical') && (
            <div style={getSectionStyle('clinical')}>
              {sectionTitle('clinical', 'Symptoms & Complaints')}
              <div style={{ ...getSectionStyle('clinical'), maxWidth: '100%', overflowWrap: 'break-word', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                {(patient.chiefComplaint || allSymptoms.length > 0) && (
                  <div style={{ marginBottom: 3 }}>
                    <span style={getLabelStyle()}>Chief Complaint:</span> {
                      [patient.chiefComplaint, allSymptoms.length > 0 ? `(${allSymptoms.join(', ')})` : ''].filter(Boolean).join(' ')
                    }
                  </div>
                )}
                {allPMH.length > 0 && <div style={{ marginBottom: 3 }}><span style={getLabelStyle()}>PMH:</span> {allPMH.join(', ')}</div>}
                {patient.currentMedications && <div style={{ marginBottom: 3 }}><span style={getLabelStyle()}>Current Meds:</span> {patient.currentMedications}</div>}
                {patient.allergies && <div><span style={getLabelStyle(true)}>⚠ Allergies:</span> <span style={{ color: '#dc2626' }}>{patient.allergies}</span></div>}
                {patient.previousLabs && <div style={{ marginTop: 3 }}><span style={getLabelStyle()}>Previous Labs:</span> {patient.previousLabs}</div>}
              </div>
            </div>
          )}

          {/* VITALS */}
          {isSectionVisible('vitals') && (
            <div style={getSectionStyle('vitals')}>
              {sectionTitle('vitals', 'Vital Signs', (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {vs.bloodPressure && <span>BP: <strong>{vs.bloodPressure}</strong> mmHg</span>}
                  {vs.heartRate && <span>· HR: <strong>{vs.heartRate}</strong> bpm</span>}
                  {vs.temperature && <span>· Temp: <strong>{vs.temperature}</strong> °F</span>}
                  {vs.oxygenSaturation && <span>· SpO₂: <strong>{vs.oxygenSaturation}</strong>%</span>}
                  {vs.respiratoryRate && <span>· RR: <strong>{vs.respiratoryRate}</strong>/min</span>}
                  {vs.weight && <span>· Wt: <strong>{vs.weight}</strong>kg</span>}
                  {vs.heightInches && vs.printHeightInches !== false && (
                    <span>· Ht: <strong>{vs.heightInches} in</strong></span>
                  )}
                  {vs.weight && vs.heightInches && (
                    <span>· BMI: <strong>
                      {(Number(vs.weight) / Math.pow(Number(vs.heightInches) * 0.0254, 2)).toFixed(1)}
                    </strong></span>
                  )}
                </div>
              ), true)}
            </div>
          )}

          {/* ALERTS */}
          {isSectionVisible('alerts') && (recommendations.warnings || []).length > 0 && (
            <div style={getSectionStyle('alerts')}>
              {sectionTitle('alerts', 'Clinical Alerts')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {(recommendations.warnings || []).map((w, i) => (
                  <div key={i} style={{ color: '#dc2626', fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontSize: globalFs + 2 }}>⚠</span> <span>{w.replace(/^⚠\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DIAGNOSES */}
          {isSectionVisible('diagnoses') && (
            <div style={getSectionStyle('diagnoses')}>
              {sectionTitle('diagnoses', 'Assessment — Differential Diagnoses')}
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', ...getSectionStyle('diagnoses') }}>
                <thead>
                  <tr style={{ background: theme.light }}>
                    <th style={{ textAlign: 'left', ...thStyle }}>#</th>
                    <th style={{ textAlign: 'left', ...thStyle }}>Diagnosis</th>
                    <th style={{ textAlign: 'left', ...thStyle }}>ICD Code</th>
                  </tr>
                </thead>
                <tbody>
                  {(recommendations.diagnoses || []).map((d, i) => (
                    <tr key={i}>
                      <td style={{ padding: `${sp.cell}px 6px`, borderBottom: '1px solid #f3f4f6' }}>{i + 1}</td>
                      <td style={{ padding: `${sp.cell}px 6px`, borderBottom: '1px solid #f3f4f6', fontWeight: 500 }}>{d.name}</td>
                      <td style={{ padding: `${sp.cell}px 6px`, borderBottom: '1px solid #f3f4f6', color: '#6b7280' }}>{d.icdCode || '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PRESCRIPTIONS */}
          {isSectionVisible('prescriptions') && prescriptions.length > 0 && (
            <div style={getSectionStyle('prescriptions')}>
              {sectionTitle('prescriptions', 'Prescription')}

              {layoutConfig.prescriptionStyle === 'list' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: sp.cell }}>
                  {prescriptions.map((p, i) => (
                    <div key={i} style={{ 
                      paddingBottom: sp.cell, 
                      paddingTop: sp.cell,
                      borderBottom: '1px solid #f3f4f6',
                      fontSize: fs
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Column 1: Sr # & Name (35%) */}
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, width: '35%', flexShrink: 0, overflow: 'hidden' }}>
                          <span style={{ fontWeight: 800, fontSize: fs - 2, color: theme.primary, minWidth: '1rem' }}>{i + 1}.</span>
                          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 3 }}>
                             <span style={{ fontWeight: 700, fontSize: fs, color: '#111827' }}>{p.medicineName}</span>
                             <span style={{ fontWeight: 400, color: '#6b7280', fontSize: fs - 2 }}>({p.dosage})</span>
                          </div>
                        </div>

                        {/* Column 2: Dosage / Timing (20%) */}
                        <div style={{ width: '20%', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: '#e5e7eb' }}>|</span>
                          <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, fontSize: fs - 2, color: '#9ca3af', textTransform: 'uppercase' }}>Dose:</span>
                            <span style={{ 
                              fontWeight: 800, 
                              color: theme.primary, 
                              letterSpacing: '1px',
                              background: theme.light,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              fontSize: fs - 1
                            }}>
                              {p.morning}-{p.noon}-{p.evening}-{p.night}
                            </span>
                          </div>
                        </div>

                        {/* Column 3: Duration (15%) */}
                        <div style={{ width: '15%', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ color: '#e5e7eb' }}>|</span>
                          <span style={{ fontWeight: 700, fontSize: fs - 1, color: '#374151', whiteSpace: 'nowrap' }}>{p.duration}</span>
                        </div>

                        {/* Column 4: Instructions (Remaining) */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
                          <span style={{ color: '#e5e7eb' }}>|</span>
                          {p.instructions && (
                             <div style={{ 
                               fontSize: fs - 2, 
                               color: '#4b5563', 
                               display: 'flex', 
                               alignItems: 'center', 
                               gap: 3,
                               fontStyle: 'italic'
                             }}>
                               <span style={{ opacity: 0.5 }}>ℹ️</span>
                               <span className="font-urdu truncate" style={{ lineHeight: 1.2 }}>{p.instructions}</span>
                             </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: fs }}>
                  <thead>
                    <tr style={{ background: theme.light }}>
                      <th style={{ textAlign: 'left', padding: `${sp.cell}px 4px`, borderBottom: `1px solid #e5e7eb`, width: '4%' }}>#</th>
                      <th style={{ textAlign: 'left', padding: `${sp.cell}px 4px`, borderBottom: `1px solid #e5e7eb`, width: '35%' }}>Medicine</th>
                      <th style={{ textAlign: 'left', padding: `${sp.cell}px 4px`, borderBottom: `1px solid #e5e7eb`, width: '15%' }}>Dosage</th>
                      <th style={{ textAlign: 'center', padding: `${sp.cell}px 2px`, borderBottom: `1px solid #e5e7eb`, width: '4%' }}>
                        <div style={{ fontSize: fs - 1 }}>🌅</div>
                        <div className="font-urdu" style={{ fontSize: fs - 4, fontWeight: 'normal', lineHeight: 1 }}>صبح</div>
                      </th>
                      <th style={{ textAlign: 'center', padding: `${sp.cell}px 2px`, borderBottom: `1px solid #e5e7eb`, width: '4%' }}>
                        <div style={{ fontSize: fs - 1 }}>☀️</div>
                        <div className="font-urdu" style={{ fontSize: fs - 4, fontWeight: 'normal', lineHeight: 1 }}>دوپہر</div>
                      </th>
                      <th style={{ textAlign: 'center', padding: `${sp.cell}px 2px`, borderBottom: `1px solid #e5e7eb`, width: '4%' }}>
                        <div style={{ fontSize: fs - 1 }}>🌆</div>
                        <div className="font-urdu" style={{ fontSize: fs - 4, fontWeight: 'normal', lineHeight: 1 }}>شام</div>
                      </th>
                      <th style={{ textAlign: 'center', padding: `${sp.cell}px 2px`, borderBottom: `1px solid #e5e7eb`, width: '4%' }}>
                        <div style={{ fontSize: fs - 1 }}>🌙</div>
                        <div className="font-urdu" style={{ fontSize: fs - 4, fontWeight: 'normal', lineHeight: 1 }}>رات</div>
                      </th>
                      <th style={{ textAlign: 'left', padding: `${sp.cell}px 4px`, borderBottom: `1px solid #e5e7eb`, width: '10%' }}>Duration</th>
                      <th style={{ textAlign: 'left', padding: `${sp.cell}px 4px`, borderBottom: `1px solid #e5e7eb`, width: '20%' }}>Instructions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map((p, i) => (
                      <tr key={i}>
                        <td style={tdStyle}>{i + 1}</td>
                        <td style={{ ...tdStyle, fontWeight: ts.sections?.prescriptions?.bold ? 'bold' : 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.medicineName}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{p.dosage}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: p.morning !== '0' ? theme.primary : '#d1d5db', fontSize: fs - 1 }}>{p.morning !== '0' ? p.morning : '-'}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: p.noon !== '0' ? theme.primary : '#d1d5db', fontSize: fs - 1 }}>{p.noon !== '0' ? p.noon : '-'}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: p.evening !== '0' ? theme.primary : '#d1d5db', fontSize: fs - 1 }}>{p.evening !== '0' ? p.evening : '-'}</td>
                        <td style={{ ...tdStyle, textAlign: 'center', fontWeight: 600, color: p.night !== '0' ? theme.primary : '#d1d5db', fontSize: fs - 1 }}>{p.night !== '0' ? p.night : '-'}</td>
                        <td style={{ ...tdStyle, color: '#6b7280' }}>{p.duration}</td>
                        <td className="font-urdu" style={{ ...tdStyle, color: '#6b7280', fontSize: fs - 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.instructions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* LAB TESTS & IMAGING */}
          {isSectionVisible('labs') && (allLabs.length > 0 || allImaging.length > 0 || patient.previousLabs) && (
            <div style={getSectionStyle('labs')}>
              {sectionTitle('labs', 'Laboratory Tests & Imaging Ordered')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {allLabs.length > 0 && (
                  <div style={{ lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: theme.primary, marginRight: 6 }}>Lab Tests Advised:</span>
                    {allLabs.join(', ')}
                  </div>
                )}
                {allImaging.length > 0 && (
                  <div style={{ lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 600, color: theme.primary, marginRight: 6 }}>Imaging Advised:</span>
                    {allImaging.join(', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INSTRUCTIONS */}
          {isSectionVisible('notes') && (recommendations.instructions || '').length > 0 && (
            <div style={getSectionStyle('notes')}>
              {sectionTitle('notes', 'Clinical Instructions')}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recommendations.instructions && (
                  <div style={{ lineHeight: 1.5 }} dir="rtl" className="text-right font-urdu">
                    <span style={{ fontWeight: 600, color: theme.primary, marginLeft: 6 }}>ہدایات:</span>
                    {recommendations.instructions.replace(/\n-/g, ',').replace(/\n/g, ', ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FOLLOW UP PLAN */}
          {isSectionVisible('followup') && recommendations.followUpDate && (
            <div style={getSectionStyle('followup')}>
              {sectionTitle('followup', 'Follow-Up Plan', (
                <span><span style={{ fontWeight: 600 }}>Next Appointment:</span> {recommendations.followUpDate}</span>
              ), true)}
            </div>
          )}

          {/* SIGNATURE */}
          {isSectionVisible('signature') && (
            <div style={{ marginTop: sp.section * 2, display: 'flex', justifyContent: 'flex-end', ...getSectionStyle('signature') }}>
              <div style={{ textAlign: 'center', minWidth: 200 }}>
                <div style={{ borderBottom: `1.5px solid ${theme.primary}`, height: 30, marginBottom: 4 }}></div>
                <div style={{ fontWeight: 600 }}>{activeDoctor?.doctorName}</div>
                <div style={{ color: '#6b7280', fontSize: globalFs - 1 }}>{activeDoctor?.doctorTitle}</div>
                <div style={{ color: '#9ca3af', fontSize: globalFs - 2 }}>{activeDoctor?.specialization}</div>
                {activeDoctor?.currentDesignation && <div style={{ color: '#9ca3af', fontSize: globalFs - 2 }}>{activeDoctor?.currentDesignation}</div>}
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div style={{ marginTop: sp.section, borderTop: `1px solid #e5e7eb`, paddingTop: 4, fontSize: globalFs - 2, ...getSectionStyle('footer', 'center', '#9ca3af') }}>
            {clinicInfo.footerText && <div><strong>{clinicInfo.footerText}</strong></div>}
            {clinicInfo.clinicName} · {clinicInfo.phone} · Generated {new Date().toLocaleString()}
          </div>
        </div>
      </div>
    </div >
  );
}
