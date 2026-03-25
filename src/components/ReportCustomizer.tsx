import { useState } from 'react';
import type { ReportLayoutConfig, ClinicInfo } from '../types';

interface Props { 
  config: ReportLayoutConfig; 
  onChange: (config: ReportLayoutConfig) => void; 
  onClose: () => void; 
  clinicInfo: ClinicInfo;
  onSaveTemplates: (templates: { id: string; name: string; config: ReportLayoutConfig }[]) => void;
}

const THEMES = [
  { id: 'blue', label: 'Blue', color: '#1e40af' },
  { id: 'teal', label: 'Teal', color: '#0f766e' },
  { id: 'indigo', label: 'Indigo', color: '#4338ca' },
  { id: 'slate', label: 'Slate', color: '#334155' },
  { id: 'emerald', label: 'Emerald', color: '#047857' },
  { id: 'rose', label: 'Rose', color: '#be123c' },
  { id: 'violet', label: 'Violet', color: '#7c3aed' },
  { id: 'amber', label: 'Amber', color: '#b45309' },
];

const TYPO_THEMES = [
  { id: 'default', label: 'Default', bg: '#f3f4f6', border: '#e5e7eb', globalColor: '#000000', labelColor: '#6b7280', headerColor: '' },
  { id: 'dark', label: 'Dark', bg: '#374151', border: '#4b5563', globalColor: '#111827', labelColor: '#4b5563', headerColor: '#1f2937' },
  { id: 'black', label: 'Black', bg: '#000000', border: '#111827', globalColor: '#000000', labelColor: '#000000', headerColor: '#000000' },
  { id: 'blue', label: 'Blue', bg: '#2563eb', border: '#3b82f6', globalColor: '#1e3a8a', labelColor: '#3b82f6', headerColor: '#1e40af' },
  { id: 'emerald', label: 'Emerald', bg: '#059669', border: '#10b981', globalColor: '#064e3b', labelColor: '#10b981', headerColor: '#047857' },
  { id: 'rose', label: 'Rose', bg: '#e11d48', border: '#f43f5e', globalColor: '#881337', labelColor: '#f43f5e', headerColor: '#be123c' },
  { id: 'violet', label: 'Violet', bg: '#7c3aed', border: '#8b5cf6', globalColor: '#4c1d95', labelColor: '#8b5cf6', headerColor: '#6d28d9' },
];

const DEFAULT_CONFIG: ReportLayoutConfig = {
  templateStyle: 'solid-basic', logoTemplate: 'hospital', layoutStyle: 'compact', fontSize: 9, fontFamily: 'inter', lineSpacing: 'normal', colorTheme: 'blue', showLogo: true, showBorder: true,
  sections: [
    { id: 'header', label: 'Header', visible: true, locked: true },
    { id: 'patient', label: 'Patient Information', visible: true },
    { id: 'clinical', label: 'Clinical Summary', visible: true },
    { id: 'vitals', label: 'Vital Signs', visible: true },
    { id: 'alerts', label: 'Clinical Alerts', visible: true },
    { id: 'diagnoses', label: 'Diagnoses', visible: true },
    { id: 'prescriptions', label: 'Prescriptions', visible: true },
    { id: 'labs', label: 'Labs & Imaging', visible: true },
    { id: 'notes', label: 'Clinical Notes', visible: true },
    { id: 'followup', label: 'Follow-Up Plan', visible: true },
    { id: 'signature', label: 'Signature Block', visible: true },
    { id: 'footer', label: 'Footer', visible: true, locked: true },
  ]
};

export default function ReportCustomizer({ config, onChange, onClose, clinicInfo, onSaveTemplates }: Props) {
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const update = (partial: Partial<ReportLayoutConfig>) => onChange({ ...config, ...partial });
  const updateStyle = (key: keyof NonNullable<ReportLayoutConfig['textStyles']>, val: any) => {
    update({ textStyles: { ...(config.textStyles || {}), [key]: val } });
  };

  const toggleSection = (id: string) => {
    update({ sections: config.sections.map(s => s.id === id && !s.locked ? { ...s, visible: !s.visible } : s) });
  };
  const moveSection = (idx: number, dir: -1 | 1) => {
    const newSections = [...config.sections];
    const target = idx + dir;
    if (target < 0 || target >= newSections.length) return;
    if (newSections[idx].locked || newSections[target].locked) return;
    [newSections[idx], newSections[target]] = [newSections[target], newSections[idx]];
    update({ sections: newSections });
  };


  const templates = clinicInfo.reportTemplates || [];

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    const newTemplate = { id: Date.now().toString(), name: templateName.trim(), config: JSON.parse(JSON.stringify(config)) };
    onSaveTemplates([...templates, newTemplate]);
    setTemplateName('');
    setShowSaveTemplateModal(false);
    setSelectedTemplateId(newTemplate.id);
    alert('🎨 Layout template saved successfully! This will persist and be available whenever you return.');
  };

  const handleLoadTemplate = (id: string) => {
    if (!id) return;
    const t = templates.find(x => x.id === id);
    if (!t) return;
    onChange(t.config);
    setSelectedTemplateId(t.id);
  };

  const handleDeleteTemplate = (id: string) => {
    if (!window.confirm('Delete this template?')) return;
    onSaveTemplates(templates.filter(x => x.id !== id));
    if (selectedTemplateId === id) setSelectedTemplateId('');
  };

  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-purple-800">🎨 Report Layout Designer</h3>
        <div className="flex gap-2">
          <button onClick={() => onChange(DEFAULT_CONFIG)} className="text-xs text-purple-600 hover:text-purple-800">↺ Reset</button>
          <button onClick={onClose} className="text-purple-400 hover:text-purple-600 text-lg">×</button>
        </div>
      </div>

      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-200">
        
        {/* Templates Dropdown & Save */}
        <div className="bg-white p-3 rounded-lg border shadow-sm flex flex-col gap-2">
          <label className="block text-xs font-bold text-gray-700">💾 Saved Templates</label>
          <div className="flex gap-2">
            <select 
              value={selectedTemplateId} 
              onChange={e => handleLoadTemplate(e.target.value)} 
              className="flex-1 border rounded-lg px-2 py-1.5 text-xs focus:ring focus:ring-purple-200 outline-none"
            >
              <option value="">-- Load a template --</option>
              {templates.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {selectedTemplateId && (
              <button onClick={() => handleDeleteTemplate(selectedTemplateId)} className="text-red-500 hover:text-red-700 px-2 rounded border border-red-200 bg-red-50">
                🗑
              </button>
            )}
            <button 
              onClick={() => setShowSaveTemplateModal(true)} 
              className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 whitespace-nowrap"
            >
              + Save As
            </button>
          </div>

          {showSaveTemplateModal && (
            <div className="mt-2 flex gap-2">
              <input 
                autoFocus
                type="text" 
                placeholder="Template name..." 
                value={templateName} 
                onChange={e => setTemplateName(e.target.value)}
                className="flex-1 border rounded px-2 py-1.5 text-xs outline-none focus:border-purple-400"
                onKeyDown={e => e.key === 'Enter' && handleSaveTemplate()}
              />
              <button onClick={handleSaveTemplate} className="bg-green-600 text-white px-3 py-1.5 rounded text-xs font-bold">Save</button>
              <button onClick={() => setShowSaveTemplateModal(false)} className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded text-xs font-bold">Cancel</button>
            </div>
          )}
        </div>

        {/* Template Style */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Report Base Style</label>
          <div className="flex gap-1">
            {(['solid-basic', 'solid-dark', 'solid-boxed'] as const).map(s => {
              const label = s === 'solid-basic' ? 'Basic' : s === 'solid-dark' ? 'Dark Mode' : 'Boxed';
              return (
                <button key={s} onClick={() => update({ templateStyle: s })}
                  className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition-all ${config.templateStyle === s ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border hover:bg-purple-50'}`}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Layout Density */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Spacing Density</label>
          <div className="flex gap-1">
            {(['compact', 'standard', 'detailed'] as const).map(s => (
              <button key={s} onClick={() => update({ layoutStyle: s })}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${config.layoutStyle === s ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border hover:bg-purple-50'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Font Size */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Font Size: {config.fontSize}px</label>
          <input type="range" min="7" max="14" value={config.fontSize} onChange={e => update({ fontSize: Number(e.target.value) })}
            className="w-full accent-purple-600" />
        </div>

        {/* Font Details */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Typography & Rhythm</label>
          <div className="flex gap-2">
            <select value={config.fontFamily || 'inter'} onChange={e => update({ fontFamily: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white outline-none">
              <option value="inter">Inter (Modern)</option>
              <option value="roboto">Roboto (Clean)</option>
              <option value="serif">Serif (Classic)</option>
            </select>
            <select value={config.lineSpacing || 'normal'} onChange={e => update({ lineSpacing: e.target.value })}
              className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white outline-none">
              <option value="tight">Tight</option>
              <option value="normal">Norm</option>
              <option value="relaxed">Loose</option>
            </select>
          </div>
        </div>

        {/* Prescription Layout */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Prescription Style</label>
          <div className="flex gap-1">
            <button onClick={() => update({ prescriptionStyle: 'table' })} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${(config.prescriptionStyle || 'table') === 'table' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border hover:bg-purple-50'}`}>Table Format</button>
            <button onClick={() => update({ prescriptionStyle: 'list' })} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${config.prescriptionStyle === 'list' ? 'bg-purple-600 text-white' : 'bg-white text-gray-600 border hover:bg-purple-50'}`}>List Format</button>
          </div>
        </div>

        {/* Page Size & Orientation */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Page Layout</label>
          <div className="flex gap-2">
            <select value={config.pageSize || 'A4'} onChange={e => update({ pageSize: e.target.value as any })} className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white outline-none">
              <option value="A4">A4 Page</option>
              <option value="Letter">Letter</option>
              <option value="A5">A5 Page</option>
            </select>
            <select value={config.orientation || 'portrait'} onChange={e => update({ orientation: e.target.value as any })} className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-700 bg-white outline-none">
              <option value="portrait">Portrait</option>
              <option value="landscape">Landscape</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-4 pt-2">
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer">
            <input type="checkbox" checked={config.showLogo} onChange={e => update({ showLogo: e.target.checked })} className="accent-purple-600 w-3.5 h-3.5" /> Show Logo
          </label>
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer">
            <input type="checkbox" checked={config.showBorder} onChange={e => update({ showBorder: e.target.checked })} className="accent-purple-600 w-3.5 h-3.5" /> Show Borders
          </label>
        </div>

        {/* Logo Watermark */}
        <div className="mt-2 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-700 cursor-pointer">
              <input type="checkbox" checked={!!config.showWatermark} onChange={e => update({ showWatermark: e.target.checked })} className="accent-purple-600 w-3.5 h-3.5" />
              🖼️ Show Logo as Watermark
            </label>
          </div>
          {config.showWatermark && (
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-600">
                <span>Opacity</span>
                <span className="font-bold text-purple-600">{Math.round((config.watermarkOpacity ?? 0.05) * 100)}%</span>
              </div>
              <input
                type="range" min="1" max="30" step="1"
                value={Math.round((config.watermarkOpacity ?? 0.05) * 100)}
                onChange={e => update({ watermarkOpacity: parseInt(e.target.value) / 100 })}
                className="w-full accent-purple-600 h-1.5"
              />
              <div className="flex justify-between text-[9px] text-gray-400">
                <span>Subtle</span>
                <span>Visible</span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-600 mt-3">
                <span>Size</span>
                <span className="font-bold text-purple-600">{config.watermarkSize ?? 60}%</span>
              </div>
              <input
                type="range" min="20" max="100" step="5"
                value={config.watermarkSize ?? 60}
                onChange={e => update({ watermarkSize: parseInt(e.target.value) })}
                className="w-full accent-purple-600 h-1.5"
              />
              <div className="flex justify-between text-[9px] text-gray-400">
                <span>Small</span>
                <span>Full</span>
              </div>

              <p className="text-[10px] text-gray-400 mt-1">Uses the logo from Clinic & Logo settings. Centered behind report content.</p>
            </div>
          )}
        </div>

        {/* Color Theme */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Color Theme</label>
          <div className="flex gap-2 flex-wrap">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => update({ colorTheme: t.id })}
                className={`w-7 h-7 rounded-full border-2 ${config.colorTheme === t.id ? 'border-gray-800 scale-110 shadow-sm' : 'border-transparent'}`}
                style={{ background: t.color }} title={t.label} />
            ))}
          </div>
        </div>

        {/* Sections */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-2">Sections (Drag to Reorder)</label>
          <div className="space-y-1 bg-white p-2 rounded-lg border border-gray-200 shadow-inner">
            {config.sections.map((s, i) => (
              <div key={s.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${s.locked ? 'bg-gray-50 text-gray-400' : 'bg-white border hover:border-purple-200'}`}>
                {!s.locked && (
                  <div className="flex flex-col opacity-50 hover:opacity-100">
                    <button onClick={() => moveSection(i, -1)} className="text-gray-400 hover:text-purple-600 leading-none text-[10px]">▲</button>
                    <button onClick={() => moveSection(i, 1)} className="text-gray-400 hover:text-purple-600 leading-none text-[10px]">▼</button>
                  </div>
                )}
                {s.locked ? <span className="text-gray-300">🔒</span> : (
                  <input type="checkbox" checked={s.visible} onChange={() => toggleSection(s.id)} className="accent-purple-600 cursor-pointer" />
                )}
                <span className={s.visible || s.locked ? 'font-medium' : 'line-through opacity-50'}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ADVANCED TEXT STYLING */}
        <div className="mt-2 pt-4 border-t border-purple-200">
          <label className="block text-sm font-bold text-gray-700 mb-3">🎨 Advanced Typography & Styling</label>

          <div className="space-y-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">


                <div className="mb-4">
                  <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">Typography Color Themes</h4>
                  <div className="flex gap-2 flex-wrap mb-3">
                    {TYPO_THEMES.map(t => (
                      <button key={t.id} title={t.label}
                        onClick={() => {
                          update({
                            textStyles: {
                              ...config.textStyles,
                              globalColor: t.globalColor,
                              labelColor: t.labelColor,
                              headerColor: t.headerColor,
                            }
                          });
                        }}
                        className={`w-6 h-6 rounded-full border shadow-sm hover:scale-110 transition-transform`}
                        style={{ background: t.bg, borderColor: t.border }}
                      />
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100">
                  <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">Global Document Text</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-gray-500 mb-1">Color (Hex)</label>
                      <input type="text" className="w-full border rounded px-2 py-1" placeholder="#333333" value={config.textStyles?.globalColor || ''} onChange={e => updateStyle('globalColor', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Base Font Size Offset</label>
                      <input type="number" className="w-full border rounded px-2 py-1" placeholder="0" value={config.textStyles?.globalFontSize || ''} onChange={e => updateStyle('globalFontSize', parseInt(e.target.value) || 0)} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-gray-100">
                  <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">Meta Labels (Name, Age, ID, etc)</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <label className="block text-gray-500 mb-1">Text Color (Hex)</label>
                      <input type="text" className="w-full border rounded px-2 py-1" placeholder="#6b7280" value={config.textStyles?.labelColor || ''} onChange={e => updateStyle('labelColor', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Font Family</label>
                      <select className="w-full border rounded px-2 py-1" value={config.textStyles?.labelFont || ''} onChange={e => updateStyle('labelFont', e.target.value)}>
                        <option value="">Inherit Theme</option>
                        <option value="inter">Inter</option>
                        <option value="roboto">Roboto</option>
                        <option value="serif">Georgia (Serif)</option>
                        <option value="urdu">Jameel Noori Nastaleeq</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Font Size Adjustment</label>
                      <input type="number" className="w-full border rounded px-2 py-1" placeholder="0" value={config.textStyles?.labelFontSize ?? ''} onChange={e => updateStyle('labelFontSize', e.target.value ? parseInt(e.target.value) : undefined)} />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" className="accent-purple-600" checked={config.textStyles?.labelBold || false} onChange={e => updateStyle('labelBold', e.target.checked)} /> Bold Labels
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-2 mt-2 border-t border-gray-100">
                  <h4 className="text-[10px] uppercase font-bold text-gray-500 mb-2">Section Headers</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <label className="block text-gray-500 mb-1">Text Color (Hex)</label>
                      <input type="text" className="w-full border rounded px-2 py-1" placeholder="Default Theme" value={config.textStyles?.headerColor || ''} onChange={e => updateStyle('headerColor', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">BG Color (Hex)</label>
                      <input type="text" className="w-full border rounded px-2 py-1" placeholder="Transparent" value={config.textStyles?.headerBgColor || ''} onChange={e => updateStyle('headerBgColor', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-gray-500 mb-1">Font Size Adjustment</label>
                      <input type="number" className="w-full border rounded px-2 py-1" placeholder="+1" value={config.textStyles?.headerFontSize ?? ''} onChange={e => updateStyle('headerFontSize', e.target.value ? parseInt(e.target.value) : undefined)} />
                    </div>
                    <div className="flex items-end pb-1">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input type="checkbox" className="accent-purple-600" checked={config.textStyles?.headerBold !== false} onChange={e => updateStyle('headerBold', e.target.checked)} /> Bold Text
                      </label>
                    </div>
                  </div>
                </div>



          </div>
        </div>
      </div>
    </div>
  );
}
