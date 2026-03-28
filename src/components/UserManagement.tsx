import { useState, useEffect } from 'react';
import type { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  getClinicUsers,
  createClinicUser,
  updateUserProfile,
  deleteClinicUser,
  type StoredUser,
} from '../services/userService';

export default function UserManagement({ onClose }: { onClose: () => void }) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<StoredUser[]>([]);
  const [editingUser, setEditingUser] = useState<Partial<StoredUser> | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const fetchUsers = async () => {
    if (!currentUser) return;
    setFetching(true);
    try {
      const list = await getClinicUsers(currentUser.clinicId);
      setUsers(list);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchUsers(); }, [currentUser]);

  const handleSave = async () => {
    if (!editingUser || !currentUser) return;
    setLoading(true);
    try {
      if (editingUser.id) {
        // Update existing user
        const updates: Partial<StoredUser> = {
          full_name: editingUser.full_name,
          role: editingUser.role as UserRole,
          status: editingUser.status as 'active' | 'inactive',
          pin_code: editingUser.pin_code,
        };
        if (password) updates.password = password;
        await updateUserProfile(editingUser.id, updates);
      } else {
        // Create new user — email required
        if (!editingUser.email || !password) {
          alert('Email and password are required for new users.');
          setLoading(false);
          return;
        }
        await createClinicUser(editingUser.email, password, {
          clinicId: currentUser.clinicId,
          full_name: editingUser.full_name || editingUser.email,
          username: editingUser.email.split('@')[0],
          email: editingUser.email,
          role: (editingUser.role as UserRole) || 'doctor',
          status: 'active',
          pin_code: editingUser.pin_code,
        });
      }
      await fetchUsers();
      setEditingUser(null);
      setPassword('');
    } catch (err: any) {
      alert('Error: ' + (err.message || 'Failed to save user.'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!currentUser) return;
    if (userId === currentUser.id) { alert('You cannot delete your own account.'); return; }
    if (!confirm('Are you sure you want to permanently delete this user?')) return;
    setLoading(true);
    try {
      await deleteClinicUser(userId);
      await fetchUsers();
    } finally {
      setLoading(false);
    }
  };

  const roleColor = (role?: string) => {
    if (role === 'admin') return 'text-red-600 bg-red-50';
    if (role === 'doctor') return 'text-blue-600 bg-blue-50';
    return 'text-yellow-700 bg-yellow-50';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-800">User Management</h2>
            <p className="text-sm text-gray-500">Manage staff access and permissions · <span className="text-blue-600 font-medium">Local Database</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setEditingUser({ role: 'doctor', status: 'active' })}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-all"
            >
              + Add New User
            </button>
          </div>

          {fetching ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mr-3" />
              Loading users…
            </div>

          ) : users.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-4xl mb-3">👥</div>
              <p className="font-medium">No users yet</p>
              <p className="text-sm mt-1">Click "Add New User" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map(u => (
                <div key={u.id} className="border rounded-xl p-4 bg-white hover:border-blue-200 transition-all flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">
                        {(u.full_name || u.email || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">{u.full_name}</div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Role</span>
                        <span className={`font-semibold uppercase px-2 py-0.5 rounded-full text-[10px] ${roleColor(u.role)}`}>{u.role}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Status</span>
                        <span className={`font-medium ${u.status === 'active' ? 'text-green-600' : 'text-red-500'} uppercase`}>{u.status}</span>
                      </div>
                      {u.pin_code && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">PIN Login</span>
                          <span className="text-green-600 font-bold">✓ Enabled</span>
                        </div>
                      )}
                      {(u as any).isTestUser && (
                        <div className="text-[10px] text-amber-600 bg-amber-50 rounded px-2 py-0.5 font-medium">🧪 Demo Account</div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingUser(u); setPassword(''); }}
                      className="flex-1 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-all">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(u.id)}
                      className="py-2 px-3 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all"
                      title="Delete User">
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit / Add Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
              <h3 className="text-lg font-bold mb-4">{editingUser.id ? 'Edit User' : 'Add New User'}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Full Name</label>
                  <input type="text" value={editingUser.full_name || ''}
                    onChange={e => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                    Email {!editingUser.id && <span className="text-red-500">*</span>}
                  </label>
                  <input type="text" value={editingUser.email || ''}
                    onChange={e => setEditingUser({ ...editingUser, email: e.target.value })}
                    disabled={!!editingUser.id}
                    className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-400" />
                  {!editingUser.id && <p className="text-[10px] text-gray-400 mt-1">Used for login. e.g. <span className="font-bold text-blue-600">dr_khan</span> or doctor@clinic.com</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Role</label>
                    <select value={editingUser.role || 'doctor'}
                      onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 outline-none">
                      <option value="doctor">Doctor</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Status</label>
                    <select value={editingUser.status || 'active'}
                      onChange={e => setEditingUser({ ...editingUser, status: e.target.value as 'active' | 'inactive' })}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 outline-none">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">
                      {editingUser.id ? 'Change Password (Optional)' : 'Password *'}
                    </label>
                    <input type="password" value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">4-Digit PIN (Optional)</label>
                    <input type="password" maxLength={4}
                      value={editingUser.pin_code || ''}
                      onChange={e => setEditingUser({ ...editingUser, pin_code: e.target.value.replace(/\D/g, '') })}
                      className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-blue-500 outline-none"
                      placeholder="1234" />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button onClick={() => { setEditingUser(null); setPassword(''); }}
                  className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={loading}
                  className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50">
                  {loading ? 'Saving…' : 'Save User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
