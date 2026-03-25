/**
 * userService.ts
 * Local mock for staff/user management (no Auth integration)
 */

import type { User } from '../types';

export interface StoredUser extends User {
  password?: string;
}

const LOCAL_STORAGE_KEY = 'medassist_users';

const DEFAULT_ADMIN: StoredUser = {
  id: 'admin-local',
  clinicId: 'clinic-local',
  name: 'Clinic Administrator',
  username: 'admin',
  email: 'admin@medassist.local',
  role: 'admin',
  status: 'active',
  pin: '1234',
  password: 'admin',
  createdAt: new Date().toISOString(),
};

function getLocalUsers(): StoredUser[] {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) return [DEFAULT_ADMIN];
  return JSON.parse(data);
}

function saveLocalUsers(users: StoredUser[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
}

export async function getUserProfile(uid: string): Promise<StoredUser | null> {
  return getLocalUsers().find(u => u.id === uid) || null;
}

export async function getClinicUsers(_clinicId: string): Promise<StoredUser[]> {
  return getLocalUsers();
}

export async function createClinicUser(
  email: string,
  password: string,
  profile: Omit<StoredUser, 'id' | 'createdAt'>
): Promise<string> {
  const users = getLocalUsers();
  const id = 'user-' + Date.now();
  const newUser: StoredUser = {
    ...profile,
    id,
    email,
    password,
    createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveLocalUsers(users);
  return id;
}

export async function updateUserProfile(
  uid: string,
  updates: Partial<StoredUser>
): Promise<void> {
  const users = getLocalUsers();
  const index = users.findIndex(u => u.id === uid);
  if (index >= 0) {
    users[index] = { ...users[index], ...updates };
    saveLocalUsers(users);
  }
}

export async function deleteClinicUser(uid: string): Promise<void> {
  const users = getLocalUsers();
  const filtered = users.filter(u => u.id !== uid);
  saveLocalUsers(filtered);
}

export async function getUserByPin(
  _clinicId: string,
  pin: string
): Promise<StoredUser | null> {
  return getLocalUsers().find(u => u.pin === pin && u.status === 'active') || null;
}

export async function ensureTestUser(): Promise<void> {
  // Logic not required locally
}

