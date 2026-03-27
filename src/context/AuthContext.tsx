import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { getUserProfile, getUserByPin, getProfilesByClinic } from '../services/userService';
import { getClinic } from '../services/clinicService';
import type { AuthState, Clinic, UserProfile } from '../types';

interface AuthContextType extends AuthState {
  activeProfile: UserProfile | null;
  profiles: UserProfile[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  unlockWithPin: (pin: string) => Promise<{ success: boolean; error?: string }>;
  switchProfile: () => void;
  logout: () => Promise<void>;
  isAdmin: () => boolean;
  isDoctor: () => boolean;
  isReceptionist: () => boolean;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    clinic: null,
    loading: true,
    error: null,
  });

  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);


  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserData(session.user);
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }

    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await fetchUserData(session.user);
      } else if (event === 'SIGNED_OUT') {

        setState({
          isAuthenticated: false,
          user: null,
          clinic: null,
          loading: false,
          error: null,
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserData = async (sUser: any) => {
    try {
      const profile = await getUserProfile(sUser.id);

      if (profile) {
        const clinicData = await getClinic(profile.clinicId);
        
        // Map DB record to Clinic type
        const clinic: Clinic = {
          id: clinicData.id,
          clinicName: clinicData.clinic_info?.clinicName || clinicData.clinicName,
          ownerName: clinicData.ownerName || '',
          phone: clinicData.clinic_info?.phone || clinicData.phone || '',
          email: clinicData.clinic_info?.email || clinicData.email || '',
          address: clinicData.clinic_info?.address || clinicData.address || '',
          createdAt: clinicData.created_at || new Date().toISOString(),
        };

        const profiles = await getProfilesByClinic(profile.clinicId);
        setProfiles(profiles);

        // If only one profile exists, or searching for a specific flow, we could auto-select
        // But for now, we leave it to PIN overlay
        
        setState({
          isAuthenticated: true,
          user: profile,
          sessionUser: sUser,
          clinic,
          loading: false,
          error: null,
        });

      } else {
        setState(prev => ({ ...prev, loading: false, sessionUser: sUser }));
      }

    } catch (err) {
      console.error('Error fetching user data:', err);
      setState(prev => ({ ...prev, loading: false, error: 'Failed to load user profile' }));
    }
  };

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }));
      return { success: false, error: error.message };
    }
    
    return { success: true };
  };

  const unlockWithPin = async (pin: string) => {
    if (!state.clinic?.id) return { success: false, error: 'Clinic not loaded' };
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    const profile = await getUserByPin(state.clinic.id, pin);
    
    if (profile) {
      setActiveProfile(profile);
      setState(prev => ({ ...prev, loading: false }));
      return { success: true };
    }
    
    setState(prev => ({ ...prev, loading: false, error: 'Invalid PIN' }));
    return { success: false, error: 'Invalid PIN' };
  };

  const switchProfile = () => {
    setActiveProfile(null);
  };


  const logout = async () => {
    await supabase.auth.signOut();
    setActiveProfile(null);
  };
  
  const isAdmin = () => (activeProfile?.role || state.user?.role) === 'admin';
  const isDoctor = () => (activeProfile?.role || state.user?.role) === 'doctor';
  const isReceptionist = () => (activeProfile?.role || state.user?.role) === 'receptionist';


  return (
    <AuthContext.Provider value={{
      ...state,
      activeProfile,
      profiles,
      login, 
      unlockWithPin,
      switchProfile,
      logout, 
      isAdmin, 
      isDoctor, 
      isReceptionist, 
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



