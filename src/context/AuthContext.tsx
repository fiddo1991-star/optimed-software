import React, { createContext, useContext, useState } from 'react';
import type { AuthState, User, Clinic } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginByPin: (clinicId: string, pin: string) => Promise<{ success: boolean; error?: string }>;
  getQuickUsers: () => { id: string; name: string; role: any }[];
  logout: () => void;
  isAdmin: () => boolean;
  isDoctor: () => boolean;
  isReceptionist: () => boolean;
  isTestUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DUMMY_USER: User = {
  id: 'admin-local',
  clinicId: 'clinic-local',
  name: 'Clinic Administrator',
  username: 'admin',
  email: 'admin@medassist.local',
  role: 'admin',
  status: 'active',
  createdAt: new Date().toISOString(),
};

const DUMMY_CLINIC: Clinic = {
  id: 'clinic-local',
  clinicName: 'MedAssist Clinic',
  ownerName: 'Doctor',
  phone: '',
  email: 'admin@medassist.local',
  address: '',
  createdAt: new Date().toISOString(),
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state] = useState<AuthState>({
    isAuthenticated: true,
    user: DUMMY_USER,
    clinic: DUMMY_CLINIC,
    loading: false,
    error: null,
  });

  const login = async () => ({ success: true });
  const loginByPin = async () => ({ success: true });
  const logout = () => { window.location.reload(); };
  const getQuickUsers = () => [];
  
  const isAdmin = () => true;
  const isDoctor = () => true;
  const isReceptionist = () => true;
  const isTestUser = () => false;

  return (
    <AuthContext.Provider value={{
      ...state,
      login, loginByPin, getQuickUsers,
      logout, isAdmin, isDoctor, isReceptionist, isTestUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

