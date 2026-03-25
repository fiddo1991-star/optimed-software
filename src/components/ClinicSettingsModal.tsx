import { useState } from 'react';
import type { ClinicInfo, DoctorProfile } from '../types';

interface Props { clinicInfo: ClinicInfo; onSave: (info: ClinicInfo) => void; onClose: () => void; }

export default function ClinicSettingsModal({ clinicInfo, onSave, onClose }: Props) {
  const [info, setInfo] = useState<ClinicInfo>(JSON.parse(JSON.stringify(clinicInfo)));
  const [tab, setTab] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);



  const updateClinic = (field: string, value: string) => setInfo(p => ({ ...p, [field]: value }));
  const updateDoctor = (id: string, field: string, value: string) => {
    setInfo(p => ({ ...p, doctors: p.doctors.map(d => d.id === id ? { ...d, [field]: value } : d) }));
  };

  const addDoctor = () => {
    const newDoc: DoctorProfile = { id: 'doc-' + Date.now(), doctorName: 'New Doctor', doctorTitle: 'MD', specialization: 'General', currentDesignation: '', licenseNumber: 'MD-XXXX' };
    setInfo(p => ({ ...p, doctors: [...p.doctors, newDoc] }));
    setExpanded(newDoc.id);
  };

  const removeDoctor = (id: string) => {
    if (info.doctors.length <= 1) return;
    setInfo(p => ({
      ...p,
      doctors: p.doctors.filter(d => d.id !== id),
      activeDoctorId: p.activeDoctorId === id ? p.doctors.find(d => d.id !== id)!.id : p.activeDoctorId
    }));
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || file.size > 500000) { alert('Max 500KB'); return; }
    const reader = new FileReader();
    reader.onload = () => setInfo(p => ({ ...p, logoDataUrl: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleImportMedicines = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const lines = text.split(/\r?\n/);
        const newMeds = new Set<string>();

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          let columns = [];
          let currentString = '';
          let insideQuotes = false;
          for (let char of line) {
            if (char === '"') insideQuotes = !insideQuotes;
            else if (char === ',' && !insideQuotes) { columns.push(currentString); currentString = ''; }
            else currentString += char;
          }
          columns.push(currentString);

          // Heuristic: if CSV has multiple columns like the provided one, take the second column. Otherwise take the first.
          const medName = columns.length > 1 ? columns[1].trim().replace(/^"|"$/g, '') : columns[0].trim().replace(/^"|"$/g, '');
          if (medName) newMeds.add(medName);
        }

        const existingStr = localStorage.getItem('customMedicines');
        const existing = existingStr ? JSON.parse(existingStr) : [];
        const combined = Array.from(new Set([...existing, ...Array.from(newMeds)]));
        localStorage.setItem('customMedicines', JSON.stringify(combined));

        alert(`Successfully imported ${newMeds.size} new medicines! Close settings to use them.`);
      } catch (err) {
        alert('Failed to parse CSV file.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // clear input
  };

  const PRESET_LOGOS = [
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='10' y='10' width='80' height='80' rx='20' fill='%232563eb'/%3E%3Crect x='40' y='25' width='20' height='50' rx='4' fill='%23ffffff'/%3E%3Crect x='25' y='40' width='50' height='20' rx='4' fill='%23ffffff'/%3E%3C/svg%3E",
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='10' y='10' width='80' height='80' rx='40' fill='%23ef4444'/%3E%3Cpath d='M20 50h15l10 -20l10 40l10 -20h15' fill='none' stroke='%23ffffff' stroke-width='6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E",
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M50 10l35 15v30c0 25-35 40-35 40s-35-15-35-40v-30z' fill='%2310b981'/%3E%3Crect x='42' y='32' width='16' height='36' rx='2' fill='%23ffffff'/%3E%3Crect x='32' y='42' width='36' height='16' rx='2' fill='%23ffffff'/%3E%3C/svg%3E"
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-800">⚙️ Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="flex gap-1 mx-5 mt-4 bg-gray-100 rounded-lg p-1">
          {['🏥 Clinic & Logo', '🎨 Splash Screen', '👨‍⚕️ Doctors'].map((t, i) => (
            <button key={i} onClick={() => setTab(i)}
              className={`flex-1 py-2 rounded-md text-sm font-medium ${tab === i ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'}`}>
              {t}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Clinic Logo</label>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    {info.logoDataUrl ? (
                      <img src={info.logoDataUrl} alt="Logo" className="w-14 h-14 rounded-lg object-contain border bg-gray-50 p-1" />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center text-2xl border">🏥</div>
                    )}
                    <div className="flex gap-2">
                      <label className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm cursor-pointer hover:bg-blue-700">
                        Upload Logo <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
                      </label>
                      {info.logoDataUrl && (
                        <button onClick={() => setInfo(p => ({ ...p, logoDataUrl: '' }))} className="px-3 py-1.5 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200">Remove</button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Or choose a preset logo:</label>
                    <div className="flex gap-2">
                      {PRESET_LOGOS.map((svg, idx) => (
                        <button key={idx} onClick={() => setInfo(p => ({ ...p, logoDataUrl: svg }))}
                          className="w-12 h-12 border rounded-lg p-1.5 hover:border-blue-500 hover:shadow-sm transition-all bg-gray-50">
                          <img src={svg} alt={`Preset ${idx + 1}`} className="w-full h-full object-contain" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {[
                { key: 'clinicName', label: 'Clinic Name' },
                { key: 'address', label: 'Address' },
                { key: 'phone', label: 'Phone' },
                { key: 'email', label: 'Email' },
                { key: 'headerSubtitle', label: 'Header Subtitle (appears below clinic name)' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input value={(info as unknown as Record<string, string>)[f.key]} onChange={e => updateClinic(f.key, e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text (printed at bottom of report)</label>
                <textarea value={info.footerText || ''} onChange={e => updateClinic('footerText', e.target.value)}
                  rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g., CONFIDENTIAL — This document is for professional medical use only." />
              </div>
            </div>
          )}

          {tab === 1 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div>
                  <h3 className="text-sm font-bold text-blue-800">Show Splash Screen</h3>
                  <p className="text-xs text-blue-600">Toggle the 3-second animated welcome on startup</p>
                </div>
                <button
                  onClick={() => setInfo(p => ({ ...p, splashSettings: { ...(p.splashSettings || { title: 'MedAssist', subtitle: 'Clinical Practice Management', loadingText: 'Initializing Healthcare Engine', showSplash: true }), showSplash: !p.splashSettings?.showSplash } }))}
                  className={`w-12 h-6 rounded-full transition-all relative ${info.splashSettings?.showSplash !== false ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${info.splashSettings?.showSplash !== false ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'title', label: 'Main Splash Title' },
                  { key: 'subtitle', label: 'Branding Subtitle' },
                  { key: 'loadingText', label: 'Loading Indicator Text' }
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{f.label}</label>
                    <input
                      value={(info.splashSettings as any)?.[f.key] || ''}
                      onChange={e => setInfo(p => ({
                        ...p,
                        splashSettings: {
                          ...(p.splashSettings || { title: 'MedAssist', subtitle: 'Clinical Practice Management', loadingText: 'Initializing Healthcare Engine', showSplash: true }),
                          [f.key]: e.target.value
                        }
                      }))}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-sm transition-all"
                    />
                  </div>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Preview Hint</span>
                <p className="text-xs text-gray-500 mt-1 italic">The splash screen uses your primary theme colors defined in the report layout.</p>
              </div>
            </div>
          )}

          {tab === 2 && (
            <div className="space-y-3">
              {info.doctors.map(doc => (
                <div key={doc.id} className={`border rounded-xl overflow-hidden ${info.activeDoctorId === doc.id ? 'border-green-400 bg-green-50/30' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between p-3 cursor-pointer" onClick={() => setExpanded(expanded === doc.id ? null : doc.id)}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">👨‍⚕️</span>
                      <div>
                        <span className="font-medium text-gray-800 text-sm">{doc.doctorName}</span>
                        <span className="text-xs text-gray-500 ml-2">{doc.specialization}</span>
                      </div>
                      {info.activeDoctorId === doc.id && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Active</span>}
                    </div>
                    <span className="text-gray-400">{expanded === doc.id ? '▲' : '▼'}</span>
                  </div>
                  {expanded === doc.id && (
                    <div className="px-3 pb-3 space-y-2 border-t bg-white">
                      {[
                        { key: 'doctorName', label: 'Full Name' },
                        { key: 'doctorTitle', label: 'Title/Credentials' },
                        { key: 'specialization', label: 'Specialization' },
                        { key: 'currentDesignation', label: 'Current Designation' },
                      ].map(f => (
                        <div key={f.key}>
                          <label className="block text-xs text-gray-500 mb-0.5">{f.label}</label>
                          <input value={(doc as unknown as Record<string, string>)[f.key]} onChange={e => updateDoctor(doc.id, f.key, e.target.value)}
                            className="w-full border rounded px-2.5 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        {info.activeDoctorId !== doc.id && (
                          <button onClick={() => setInfo(p => ({ ...p, activeDoctorId: doc.id }))}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs hover:bg-green-700">Set Active</button>
                        )}
                        {info.doctors.length > 1 && (
                          <button onClick={() => removeDoctor(doc.id)}
                            className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs hover:bg-red-200">Delete</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <button onClick={addDoctor} className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-all">
                + Add Doctor
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-5 border-t sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">Cancel</button>
          <button onClick={() => { onSave(info); onClose(); }} className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">Save Changes</button>
        </div>
      </div>
    </div>
  );
}
