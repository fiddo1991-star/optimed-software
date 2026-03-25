import type { SavedPatientRecord } from '../types';

interface Props {
    patientId: string;
    allRecords: SavedPatientRecord[];
    onClose: () => void;
    onLoadRecord: (record: SavedPatientRecord) => void;
    onLoadRecordAsNew: (record: SavedPatientRecord) => void;
}

export default function PatientDashboard({ patientId, allRecords, onClose, onLoadRecord, onLoadRecordAsNew }: Props) {
    const history = allRecords.filter(r => r.patientData.patientId === patientId).sort((a, b) => new Date(a.savedAt).getTime() - new Date(b.savedAt).getTime());

    if (history.length === 0) return null;

    const latest = history[history.length - 1];
    const vs = latest.patientData?.vitalSigns || {} as any;

    // BP data for chart
    const bpData = history.map(r => {
        const bp = r.patientData?.vitalSigns?.bloodPressure;
        let sys = 120, dia = 80;
        if (bp && bp.includes('/')) {
            const [s, d] = bp.split('/');
            sys = parseInt(s) || 120;
            dia = parseInt(d) || 80;
        }
        return { date: new Date(r.savedAt).toLocaleDateString(), sys, dia };
    });
    const maxSys = Math.max(...bpData.map(d => d.sys), 160);

    // Weight data for trend
    const weightData = history.map(r => ({
        date: new Date(r.savedAt).toLocaleDateString(),
        weight: parseFloat(r.patientData?.vitalSigns?.weight) || 0,
    })).filter(d => d.weight > 0);
    const maxWeight = weightData.length > 0 ? Math.max(...weightData.map(d => d.weight)) : 100;
    const minWeight = weightData.length > 0 ? Math.min(...weightData.map(d => d.weight)) : 40;
    const weightRange = Math.max(maxWeight - minWeight, 10);

    // HR data for trend
    const hrData = history.map(r => ({
        date: new Date(r.savedAt).toLocaleDateString(),
        hr: parseInt(r.patientData?.vitalSigns?.heartRate) || 0,
    })).filter(d => d.hr > 0);
    const maxHR = hrData.length > 0 ? Math.max(...hrData.map(d => d.hr)) : 120;

    // BMI calculation
    const heightInches = parseFloat(vs.heightInches || '0') || 0;
    const weightKg = parseFloat(vs.weight || '0') || 0;
    const bmi = heightInches > 0 && weightKg > 0 ? (weightKg / ((heightInches * 0.0254) ** 2)).toFixed(1) : null;
    const bmiCategory = bmi ? (parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Normal' : parseFloat(bmi) < 30 ? 'Overweight' : 'Obese') : null;
    const bmiColor = bmiCategory === 'Normal' ? 'text-green-600 bg-green-50' : bmiCategory === 'Underweight' ? 'text-blue-600 bg-blue-50' : bmiCategory === 'Overweight' ? 'text-orange-600 bg-orange-50' : 'text-red-600 bg-red-50';

    // All diagnoses across visits
    const allDiagnoses = history.flatMap(r =>
        (r.recommendations?.diagnoses || []).map(d => ({
            ...d,
            date: new Date(r.savedAt).toLocaleDateString(),
            complaint: r.patientData?.chiefComplaint,
        }))
    ).reverse();

    // Current medications from latest visit
    const currentMeds = latest.prescriptions || [];

    // Visit stats
    const firstVisit = new Date(history[0].savedAt);
    const lastVisit = new Date(latest.savedAt);
    const daysBetween = Math.max(1, Math.floor((lastVisit.getTime() - firstVisit.getTime()) / 86400000));
    const avgInterval = history.length > 1 ? Math.round(daysBetween / (history.length - 1)) : 0;

    // Medical history
    const pmh = latest.patientData.medicalHistory || [];
    const allergies = latest.patientData.allergies || '';

    return (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-gray-50 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="bg-white px-4 md:px-6 py-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 relative">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-lg md:text-xl font-bold shadow-md shrink-0">
                            {latest.patientData.patientName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-800">{latest.patientData.patientName}</h2>
                            <p className="text-xs md:text-sm text-gray-500 line-clamp-1">
                                ID: {patientId} • {latest.patientData.age}y • {latest.patientData.gender}
                                {latest.patientData.phoneNumber && ` • 📞 ${latest.patientData.phoneNumber}`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-left sm:text-right text-[10px] md:text-xs text-gray-400">
                            <div>{history.length} visit{history.length !== 1 ? 's' : ''}</div>
                            <div>Since {firstVisit.toLocaleDateString()}</div>
                        </div>
                        <button onClick={onClose} className="absolute right-3 top-3 sm:static text-gray-400 hover:text-gray-600 text-2xl md:text-3xl bg-white rounded-full w-8 h-8 flex items-center justify-center -mt-1 sm:mt-0 shadow-sm sm:shadow-none">&times;</button>
                    </div>
                </div>

                {/* Allergy & PMH Banner */}
                {(allergies && allergies !== 'NKDA' && allergies !== 'None') && (
                    <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <div className="text-xs font-bold text-red-700 uppercase tracking-wide">Known Allergies</div>
                            <div className="text-sm font-semibold text-red-800">{allergies}</div>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Stats Row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                            <div className="text-red-500 text-xs font-medium mb-1">❤️ Heart Rate</div>
                            <div className="text-lg font-bold text-red-700">{vs.heartRate || '--'} <span className="text-xs font-normal">bpm</span></div>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                            <div className="text-blue-500 text-xs font-medium mb-1">🩸 Blood Press.</div>
                            <div className="text-lg font-bold text-blue-700">{vs.bloodPressure || '--'}</div>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                            <div className="text-orange-500 text-xs font-medium mb-1">🌡️ Temp</div>
                            <div className="text-lg font-bold text-orange-700">{vs.temperature || '--'} <span className="text-xs font-normal">°F</span></div>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                            <div className="text-green-500 text-xs font-medium mb-1">💨 SpO2</div>
                            <div className="text-lg font-bold text-green-700">{vs.oxygenSaturation || '--'} <span className="text-xs font-normal">%</span></div>
                        </div>
                        <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
                            <div className="text-purple-500 text-xs font-medium mb-1">⚖️ Weight</div>
                            <div className="text-lg font-bold text-purple-700">{vs.weight || '--'} <span className="text-xs font-normal">kg</span></div>
                        </div>
                        {bmi && (
                            <div className={`rounded-xl p-3 border shadow-sm ${bmiColor}`}>
                                <div className="text-xs font-medium mb-1">📐 BMI</div>
                                <div className="text-lg font-bold">{bmi} <span className="text-xs font-normal">{bmiCategory}</span></div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Charts */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* BP Chart */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="text-red-500">❤️</span> Blood Pressure History
                                </h3>
                                {bpData.length > 1 ? (
                                    <>
                                        <div className="flex items-end gap-3 h-40 border-b border-l border-gray-200 p-2 pt-6 relative">
                                            <div className="absolute left-[-24px] top-[0%] text-[10px] text-gray-400">{maxSys}</div>
                                            <div className="absolute left-[-24px] top-[50%] text-[10px] text-gray-400">{Math.round(maxSys / 2)}</div>
                                            <div className="absolute left-[-15px] bottom-0 text-[10px] text-gray-400">0</div>
                                            {bpData.map((d, i) => (
                                                <div key={i} className="flex-1 flex flex-col items-center justify-end relative group">
                                                    <div style={{ height: `${(d.sys / maxSys) * 100}%` }} className="w-full max-w-[28px] bg-blue-100 rounded-t-sm relative flex items-end">
                                                        <div style={{ height: `${(d.dia / d.sys) * 100}%` }} className="w-full bg-blue-600 rounded-t-sm"></div>
                                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                                            {d.sys}/{d.dia}
                                                        </div>
                                                    </div>
                                                    <span className="text-[9px] text-gray-500 mt-1.5 rotate-45 origin-left truncate w-10">{d.date}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 flex gap-4 text-xs text-gray-500 justify-center">
                                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 rounded-sm"></div> Systolic</div>
                                            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-600 rounded-sm"></div> Diastolic</div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-8 text-gray-400 text-sm">Need multiple visits to show trend</div>
                                )}
                            </div>

                            {/* Weight Trend */}
                            {weightData.length > 0 && (
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-purple-500">⚖️</span> Weight Trend
                                    </h3>
                                    {weightData.length > 1 ? (
                                        <div className="flex items-end gap-3 h-32 border-b border-l border-gray-200 p-2 pt-4 relative">
                                            <div className="absolute left-[-30px] top-[0%] text-[10px] text-gray-400">{Math.round(maxWeight)}kg</div>
                                            <div className="absolute left-[-30px] bottom-0 text-[10px] text-gray-400">{Math.round(minWeight)}kg</div>
                                            {weightData.map((d, i) => {
                                                const pct = weightRange > 0 ? ((d.weight - minWeight) / weightRange) * 80 + 20 : 50;
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center justify-end relative group">
                                                        <div style={{ height: `${pct}%` }} className="w-full max-w-[28px] bg-purple-200 rounded-t-sm relative">
                                                            <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                                                {d.weight}kg
                                                            </div>
                                                        </div>
                                                        <span className="text-[9px] text-gray-500 mt-1.5 rotate-45 origin-left truncate w-10">{d.date}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 text-gray-400 text-sm">
                                            Latest: <span className="font-semibold text-purple-700">{weightData[0].weight}kg</span> — need more visits for trend
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Heart Rate Trend */}
                            {hrData.length > 1 && (
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <span className="text-red-500">💓</span> Heart Rate Trend
                                    </h3>
                                    <div className="flex items-end gap-3 h-28 border-b border-l border-gray-200 p-2 pt-4 relative">
                                        <div className="absolute left-[-30px] top-[0%] text-[10px] text-gray-400">{maxHR}</div>
                                        <div className="absolute left-[-15px] bottom-0 text-[10px] text-gray-400">0</div>
                                        {hrData.map((d, i) => (
                                            <div key={i} className="flex-1 flex flex-col items-center justify-end relative group">
                                                <div style={{ height: `${(d.hr / maxHR) * 100}%` }} className="w-full max-w-[28px] bg-red-200 rounded-t-sm relative">
                                                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                                        {d.hr} bpm
                                                    </div>
                                                </div>
                                                <span className="text-[9px] text-gray-500 mt-1.5 rotate-45 origin-left truncate w-10">{d.date}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Diagnosis History Timeline */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <span>🩺</span> Diagnosis History
                                </h3>
                                {allDiagnoses.length > 0 ? (
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {allDiagnoses.map((d, i) => (
                                            <div key={i} className="flex items-start gap-3 p-2.5 bg-gray-50 rounded-lg">
                                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-sm font-medium text-gray-800">{d.name}</span>
                                                        {d.icdCode && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-mono">{d.icdCode}</span>}
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${d.confidence === 'High' ? 'bg-green-100 text-green-700' : d.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>{d.confidence}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-0.5">{d.date} — {d.complaint}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 text-gray-400 text-sm">No diagnoses recorded</div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Info Cards */}
                        <div className="space-y-6">
                            {/* Visit Statistics */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-800 mb-3">📊 Visit Statistics</h3>
                                <div className="space-y-2.5">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Total Visits</span>
                                        <span className="font-semibold text-gray-800">{history.length}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">First Visit</span>
                                        <span className="font-semibold text-gray-800">{firstVisit.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Last Visit</span>
                                        <span className="font-semibold text-gray-800">{lastVisit.toLocaleDateString()}</span>
                                    </div>
                                    {avgInterval > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Avg. Interval</span>
                                            <span className="font-semibold text-gray-800">{avgInterval} days</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Medical History (PMH) */}
                            {pmh.length > 0 && (
                                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-800 mb-3">🏥 Medical History</h3>
                                    <div className="flex flex-wrap gap-1.5">
                                        {pmh.map((h, i) => (
                                            <span key={i} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-lg">{h}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Current Medications */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-800 mb-3">💊 Current Medications</h3>
                                {currentMeds.length > 0 ? (
                                    <div className="space-y-2">
                                        {currentMeds.map((m, i) => (
                                            <div key={i} className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
                                                <div className="font-medium text-sm text-gray-800">{m.medicineName}</div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    {m.dosage} • {[
                                                        m.morning !== '0' && `${m.morning} morn`,
                                                        m.noon !== '0' && `${m.noon} noon`,
                                                        m.evening !== '0' && `${m.evening} eve`,
                                                        m.night !== '0' && `${m.night} night`,
                                                    ].filter(Boolean).join(', ') || 'As needed'} • {m.duration}
                                                </div>
                                                {m.instructions && <div className="text-[11px] text-blue-600 mt-0.5">💡 {m.instructions}</div>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-4 text-gray-400 text-xs">No active medications</div>
                                )}
                            </div>

                            {/* Upcoming Follow-up */}
                            {latest.recommendations?.followUpDate && (
                                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white shadow-md">
                                    <h3 className="text-xs font-medium text-indigo-100 mb-1 flex items-center gap-2">📅 NEXT APPOINTMENT</h3>
                                    <div className="text-lg font-bold mt-2">{latest.recommendations.followUpDate}</div>
                                </div>
                            )}

                            {/* Recent Visits */}
                            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                                <h3 className="text-sm font-bold text-gray-800 mb-3">📋 Recent Visits</h3>
                                <div className="space-y-2">
                                    {history.slice(-5).reverse().map((r, i) => (
                                        <div key={i} className="flex items-start gap-2.5 p-2.5 bg-gray-50 rounded-lg">
                                            <div className="mt-0.5 text-blue-500 text-xs">🗓️</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[11px] font-semibold text-gray-500">{new Date(r.savedAt).toLocaleDateString()}</div>
                                                <div className="text-xs font-medium text-gray-800 truncate">{r.patientData.chiefComplaint || 'No complaint'}</div>
                                                <div className="text-[10px] text-gray-500 mt-0.5 flex gap-1 flex-wrap">
                                                    {(r.recommendations?.diagnoses || []).slice(0, 2).map(d => (
                                                        <span key={d.name} className="bg-purple-100 text-purple-700 px-1 py-0.5 rounded">{d.name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1 items-end shrink-0">
                                                <button onClick={() => { onLoadRecord(r); onClose(); }} className="text-[10px] bg-white border border-gray-200 px-2 py-1 rounded hover:bg-gray-100 w-full text-center">Load</button>
                                                <button onClick={() => { onLoadRecordAsNew(r); onClose(); }} className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-1 rounded hover:bg-purple-100 w-full text-center">New Visit</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
