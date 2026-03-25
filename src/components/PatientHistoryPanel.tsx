import { useState, useRef } from 'react';
import type { SavedPatientRecord, ClinicInfo, ReportLayoutConfig } from '../types';
import PatientDashboard from './PatientDashboard';
import PrintableReport from './PrintableReport';
import html2pdf from 'html2pdf.js';

interface Props {
  records: SavedPatientRecord[];
  onLoad: (record: SavedPatientRecord) => void;
  onLoadAsNew: (record: SavedPatientRecord) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
  clinicInfo: ClinicInfo;
  layoutConfig: ReportLayoutConfig;
}

export default function PatientHistoryPanel({ records, onLoad, onLoadAsNew, onDelete, onClearAll, onClose, clinicInfo, layoutConfig }: Props) {
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState('');
  const [page, setPage] = useState(0);
  const [dashboardRecord, setDashboardRecord] = useState<SavedPatientRecord | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');
  
  const exportContainerRef = useRef<HTMLDivElement>(null);
  const PER_PAGE = 20;

  const getDoctorName = (id: string) => clinicInfo.doctors.find(d => d.id === id)?.doctorName || 'Unknown';

  const filtered = records.filter(r => {
    const sTerm = search.toLowerCase();
    const docName = getDoctorName(r.doctorId).toLowerCase();
    const dateStr = new Date(r.savedAt).toLocaleDateString().toLowerCase();
    const phone = r.patientData.phoneNumber?.toLowerCase() || '';

    const matchesSearch = !search
      || (r.patientData.patientName || '').toLowerCase().includes(sTerm)
      || (r.patientData.patientId || '').toLowerCase().includes(sTerm)
      || docName.includes(sTerm)
      || dateStr.includes(sTerm)
      || phone.includes(sTerm);
    const matchesDoctor = !doctorFilter || r.doctorId === doctorFilter;
    return matchesSearch && matchesDoctor;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  const generatePdfOptions = (filename: string) => ({
    margin: 10,
    filename,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, ignoreElements: (el: Element) => el.classList?.contains('no-print') },
    jsPDF: { unit: 'mm' as const, format: 'a4', orientation: 'portrait' as const }
  });

  const exportSinglePdf = async () => {
    if (records.length === 0) return;
    setIsExporting(true);
    setExportProgress('Generating combined PDF...');
    
    setTimeout(async () => {
      if (!exportContainerRef.current) { setIsExporting(false); return; }
      try {
        await html2pdf().set(generatePdfOptions('Patient_Records.pdf')).from(exportContainerRef.current).save();
      } catch (e) { console.error('PDF Export Error:', e); }
      setIsExporting(false);
      setExportProgress('');
    }, 500); // Give DOM time to render hidden container
  };

  const exportSeparatePdfs = async () => {
    if (records.length === 0) return;
    setIsExporting(true);
    
    setTimeout(async () => {
      if (!exportContainerRef.current) { setIsExporting(false); return; }
      const nodes = Array.from(exportContainerRef.current.children);
      
      for (let i = 0; i < records.length; i++) {
        setExportProgress(`Exporting ${i + 1} of ${records.length}...`);
        const element = nodes[i] as HTMLElement;
        const r = records[i];
        const filename = `${r.patientData.patientId}_${r.patientData.patientName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(r.savedAt).getTime()}.pdf`;
        try {
          await html2pdf().set(generatePdfOptions(filename)).from(element).save();
        } catch (e) {
             console.error('PDF Export Error:', e);
             break;
        }
      }
      setIsExporting(false);
      setExportProgress('');
    }, 500);
  };

  const handleView = (r: SavedPatientRecord) => {
    onLoad(r);
    onClose();
  };

  const handleFollowUp = (r: SavedPatientRecord) => {
    onLoadAsNew(r);
    onClose();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this patient record? This cannot be undone.')) {
      onDelete(id);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[55]"
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-white z-[60] shadow-2xl flex flex-col">

        {/* Header */}
        <div className="bg-white border-b p-4 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">📋 Patient Records ({records.length})</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-all text-xl"
            >×</button>
          </div>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm mb-2 focus:border-blue-400 outline-none transition-all"
            placeholder="🔍 Search name, ID, Doctor, date or phone..."
          />
          <select
            value={doctorFilter}
            onChange={e => { setDoctorFilter(e.target.value); setPage(0); }}
            className="w-full border-2 border-gray-100 rounded-xl px-3 py-2 text-sm focus:border-blue-400 outline-none bg-white transition-all"
          >
            <option value="">All Doctors</option>
            {clinicInfo.doctors.map(d => (
              <option key={d.id} value={d.id}>{d.doctorName} ({records.filter(r => r.doctorId === d.id).length})</option>
            ))}
          </select>
        </div>

        {/* Records list */}
        <div className="flex-1 overflow-y-auto p-4">
          {paged.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📁</p>
              <p className="font-medium">No records found</p>
              <p className="text-sm mt-1 text-gray-400">
                {search ? 'Try a different search term' : 'Save a patient record to see it here'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {paged.map(r => (
                <div key={r.id} className="border-2 border-gray-100 rounded-xl p-3 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                  {/* Patient info */}
                  <div className="mb-2.5">
                    <div className="font-semibold text-gray-800 text-sm">{r.patientData.patientName}</div>
                    <div className="text-xs text-gray-500">{r.patientData.age}y {r.patientData.gender} · {r.patientData.patientId}</div>
                    <div className="text-xs text-gray-400 line-clamp-1 mt-0.5 break-all">{r.patientData.chiefComplaint}</div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full border border-blue-100">
                        👨‍⚕️ {getDoctorName(r.doctorId)}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(r.savedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      {r.recommendations?.diagnoses?.length > 0 && (
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                          {r.recommendations.diagnoses.length} dx
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      onClick={() => setDashboardRecord(r)}
                      className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-all text-center whitespace-nowrap"
                    >
                      📊 Dashboard
                    </button>
                    <button
                      onClick={() => handleView(r)}
                      className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all text-center whitespace-nowrap"
                    >
                      👁 View
                    </button>
                    <button
                      onClick={() => handleFollowUp(r)}
                      className="flex-1 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-all text-center whitespace-nowrap"
                    >
                      🔄 New Visit
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="px-3 h-[30px] flex items-center justify-center bg-red-50 text-red-500 border border-red-100 rounded-lg text-sm hover:bg-red-100 transition-all"
                      title="Delete record"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-gray-200 transition-all"
              >← Prev</button>
              <span className="text-xs text-gray-500 font-medium">{page + 1} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="px-4 py-2 bg-gray-100 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-gray-200 transition-all"
              >Next →</button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-gray-50 border-t p-4 shrink-0">
          <div className="flex gap-2 mb-2">
            <button
              onClick={exportSinglePdf}
              disabled={isExporting || records.length === 0}
              className="flex-1 py-2 bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold hover:bg-blue-200 transition-all disabled:opacity-50"
            >
              {isExporting && exportProgress.includes('combined') ? 'Generating...' : '📄 Export All (1 PDF)'}
            </button>
            <button
              onClick={exportSeparatePdfs}
              disabled={isExporting || records.length === 0}
              className="flex-1 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold hover:bg-indigo-200 transition-all disabled:opacity-50"
            >
              {isExporting && exportProgress.includes('Exporting') ? exportProgress : '📑 Export Separately'}
            </button>
          </div>
          <div className="flex gap-2">

            {records.length > 0 && (
              <button
                disabled={isExporting}
                onClick={() => { if (window.confirm('Delete ALL patient records? This cannot be undone.')) onClearAll(); }}
                className="flex-1 py-2 bg-red-100 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-200 transition-all disabled:opacity-50"
              >🗑 Clear All</button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden container for PDF Generation */}
      {isExporting && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0, width: layoutConfig.pageSize === 'A5' ? '148mm' : layoutConfig.pageSize === 'Letter' ? '215.9mm' : '210mm' }}>
          <div ref={exportContainerRef}>
            {records.map(r => (
              <div key={r.id} className="html2pdf__page-break">
                <PrintableReport
                  patient={r.patientData}
                  recommendations={r.recommendations}
                  prescriptions={r.prescriptions}
                  clinicInfo={clinicInfo}
                  selectedLabs={r.selectedLabs}
                  selectedImaging={r.selectedImaging}
                  customLabs={r.customLabs}
                  customImaging={r.customImaging}
                  layoutConfig={layoutConfig}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Patient Dashboard — rendered at highest z-index, completely above the panel */}
      {dashboardRecord && (
        <div className="fixed inset-0 z-[70]">
          <PatientDashboard
            patientId={dashboardRecord.patientData.patientId}
            allRecords={records}
            onClose={() => setDashboardRecord(null)}
            onLoadRecord={(r) => { onLoad(r); setDashboardRecord(null); onClose(); }}
            onLoadRecordAsNew={(r) => { onLoadAsNew(r); setDashboardRecord(null); onClose(); }}
          />
        </div>
      )}
    </>
  );
}
