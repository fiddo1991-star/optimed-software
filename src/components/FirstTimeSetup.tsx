import { useState } from 'react';
import type { ClinicInfo, DoctorProfile } from '../types';

interface Props {
  onComplete: (clinicInfo: ClinicInfo) => void;
}

export default function FirstTimeSetup({ onComplete }: Props) {
  const [step, setStep] = useState<'clinic' | 'doctor'>('clinic');

  // Clinic fields
  const [clinicName, setClinicName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Doctor fields
  const [doctorName, setDoctorName] = useState('');
  const [doctorTitle, setDoctorTitle] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');

  const handleClinicNext = () => {
    if (!clinicName.trim()) {
      alert('Please enter your clinic name.');
      return;
    }
    setStep('doctor');
  };

  const handleFinish = () => {
    if (!doctorName.trim()) {
      alert('Please enter your name.');
      return;
    }

    const docId = 'doc-' + Date.now();
    const doctor: DoctorProfile = {
      id: docId,
      doctorName: doctorName.trim(),
      doctorTitle: doctorTitle.trim() || 'Dr.',
      specialization: specialization.trim() || 'General Practice',
      currentDesignation: '',
      licenseNumber: licenseNumber.trim(),
    };

    const clinicInfo: ClinicInfo = {
      clinicName: clinicName.trim(),
      address: address.trim(),
      phone: phone.trim(),
      email: email.trim(),
      logoDataUrl: '',
      headerSubtitle: '',
      footerText: 'CONFIDENTIAL — This document is for professional medical use only.',
      doctors: [doctor],
      activeDoctorId: docId,
      reportTemplates: [],
      splashSettings: {
        title: 'MedAssist',
        subtitle: 'Clinical Practice Management',
        loadingText: 'Initializing Healthcare Engine',
        showSplash: true
      }
    };

    onComplete(clinicInfo);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg">
            M
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome to MedAssist</h1>
          <p className="text-gray-500 mt-1">Let's set up your clinic in 2 quick steps</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex-1 h-1.5 rounded-full transition-all ${step === 'clinic' || step === 'doctor' ? 'bg-blue-500' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-1.5 rounded-full transition-all ${step === 'doctor' ? 'bg-blue-500' : 'bg-gray-200'}`} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'clinic' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-xl">🏥</div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Clinic Information</h2>
                  <p className="text-xs text-gray-400">Step 1 of 2 — Your practice details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Clinic Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={clinicName}
                    onChange={e => setClinicName(e.target.value)}
                    placeholder="e.g. City Medical Clinic"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="123 Main Street, City"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-sm transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+92 300 0000000"
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="clinic@example.com"
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-sm transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleClinicNext}
                className="w-full mt-6 h-12 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-md"
              >
                Continue →
              </button>
            </>
          )}

          {step === 'doctor' && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-xl">👨‍⚕️</div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Doctor Profile</h2>
                  <p className="text-xs text-gray-400">Step 2 of 2 — Your professional details</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Full Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={doctorName}
                    onChange={e => setDoctorName(e.target.value)}
                    placeholder="Dr. Ahmed Khan"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-sm transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                    <input
                      type="text"
                      value={doctorTitle}
                      onChange={e => setDoctorTitle(e.target.value)}
                      placeholder="MBBS, MD"
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Specialization</label>
                    <input
                      type="text"
                      value={specialization}
                      onChange={e => setSpecialization(e.target.value)}
                      placeholder="General Practice"
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-sm transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">License / PMDC Number</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={e => setLicenseNumber(e.target.value)}
                    placeholder="PMDC-XXXXX"
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-3 focus:border-blue-500 outline-none text-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep('clinic')}
                  className="h-12 px-6 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
                >
                  ← Back
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 h-12 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 active:scale-95 transition-all shadow-md"
                >
                  🚀 Launch My Clinic
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          You can update all this information later in ⚙️ Settings
        </p>
      </div>
    </div>
  );
}
