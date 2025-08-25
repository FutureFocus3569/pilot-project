'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Users, Shield, Edit, Trash2, Settings, Eye, EyeOff, CheckCircle, X, Save } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'MASTER' | 'ADMIN' | 'USER';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  permissions: UserPermissions;
}

interface UserPermissions {
  dashboard: boolean;
  quickAccess: boolean;
  budget: boolean;
  dataManagement: boolean;
  xero: boolean;
  marketing: boolean;
  assistant: boolean;
  userManagement: boolean;
}

interface Centre {
  id: string;
  name: string;
  code: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPermissions, setShowPermissions] = useState<string | null>(null);
  
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'MASTER' | 'ADMIN' | 'USER',
    permissions: {
      dashboard: true,
      quickAccess: false,
      budget: false,
      dataManagement: false,
      xero: false,
      marketing: false,
      assistant: false,
      userManagement: false,
    } as UserPermissions,
    centreIds: [] as string[]
  });

  // Mock current user - replace with actual auth
  const currentUser = {
    role: 'MASTER' as 'MASTER' | 'ADMIN' | 'USER'
  };

  useEffect(() => {
    fetchUsers();
    fetchCentres();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Use the proper users API endpoint
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        // Add default permissions to users that come from the API
        const usersWithPermissions = (data.users || []).map((user: any) => ({
          ...user as User,
          permissions: (user as User).permissions || {
            dashboard: true,
            quickAccess: user.role !== 'USER',
            budget: user.role === 'MASTER' || user.role === 'ADMIN',
            dataManagement: user.role === 'MASTER',
            xero: user.role !== 'USER',
            marketing: true,
            assistant: true,
            userManagement: user.role === 'MASTER' || user.role === 'ADMIN',
          }
        }));
        setUsers(usersWithPermissions);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data if API fails
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  };

  const fetchCentres = async () => {
    try {
      const response = await fetch('/api/centres');
      if (response.ok) {
        const data = await response.json();
        setCentres(data);
      } else {
        setCentres(mockCentres);
      }
    } catch (error) {
      console.error('Error fetching centres:', error);
      setCentres(mockCentres);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      if (!newUser.name || !newUser.email || !newUser.password) {
        alert('Please fill in all required fields');
        return;
      }

      // Call the real API to create user
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          centreIds: newUser.centreIds || []
        }),
      });

      if (response.ok) {
        const createdUser = await response.json();
        console.log('✅ User created successfully:', createdUser);
        
        // Refresh the users list
        await fetchUsers();
        
        // Reset form
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'USER',
          permissions: {
            dashboard: true,
            quickAccess: false,
            budget: false,
            dataManagement: false,
            xero: false,
            marketing: false,
            assistant: false,
            userManagement: false,
          },
          centreIds: []
        });
        
        setShowAddForm(false);
        alert('✅ User created successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create user');
      }
      
    } catch (error) {
      console.error('Error creating user:', error);
      alert(`❌ Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      // In a real app, you'd make an API call here
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates, updatedAt: new Date() } : user
      ));
      
      setEditingUser(null);
      alert('✅ User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('❌ Failed to update user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    
    try {
      // Call the real API to delete user
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ User deleted successfully');
        
        // Refresh the users list
        await fetchUsers();
        alert('✅ User deleted successfully!');
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(`❌ Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handlePermissionChange = (userId: string, permission: keyof UserPermissions, value: boolean) => {
    setUsers(prev => prev.map(user => 
      user.id === userId 
        ? { 
            ...user, 
            permissions: { ...user.permissions, [permission]: value },
            updatedAt: new Date()
          } 
        : user
    ));
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MASTER': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'ADMIN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'USER': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'MASTER': return '👑';
      case 'ADMIN': return '🛡️';
      case 'USER': return '👤';
      default: return '❓';
    }
  };

  // Mock data
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Courtney Everest',
      email: 'courtney@futurefocus.co.nz',
      role: 'MASTER',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date(),
      permissions: {
        dashboard: true,
        quickAccess: true,
        budget: true,
        dataManagement: true,
        xero: true,
        marketing: true,
        assistant: true,
        userManagement: true,
      }
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@futurefocus.co.nz',
      role: 'ADMIN',
      isActive: true,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date(),
      permissions: {
        dashboard: true,
        quickAccess: true,
        budget: true,
        dataManagement: false,
        xero: true,
        marketing: true,
        assistant: true,
        userManagement: true,
      }
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@futurefocus.co.nz',
      role: 'USER',
      isActive: true,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date(),
      permissions: {
        dashboard: true,
        quickAccess: false,
        budget: false,
        dataManagement: false,
        xero: false,
        marketing: true,
        assistant: true,
        userManagement: false,
      }
    }
  ];

  const mockCentres: Centre[] = [
    { id: '1', name: 'Future Focus Hamilton East', code: 'FFHE' },
    { id: '2', name: 'Future Focus Te Rapa', code: 'FFTR' },
    { id: '3', name: 'Future Focus Chartwell', code: 'FFCH' }
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-2xl shadow-xl relative overflow-hidden mb-6">
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">👥 Staff Management</h1>
            <p className="text-white text-lg">
              Manage your team, permissions, and access controls
            </p>
          </div>
          {(currentUser.role === 'MASTER' || currentUser.role === 'ADMIN') && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-lg font-medium"
            >
              <UserPlus className="w-5 h-5" />
              Add New Staff
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Staff Directory
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                      <span className="mr-1">{getRoleIcon(user.role)}</span>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isActive 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {user.isActive ? '✅ Active' : '❌ Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => setShowPermissions(showPermissions === user.id ? null : user.id)}
                      className="text-blue-600 hover:text-blue-900 flex items-center gap-1 text-sm"
                    >
                      <Settings className="w-4 h-4" />
                      Manage
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {currentUser.role === 'MASTER' && user.role !== 'MASTER' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permissions Management */}
      {showPermissions && (
        <div className="mt-6">
          {users.filter(user => user.id === showPermissions).map(user => (
            <div key={user.id} className="bg-white rounded-xl shadow-lg p-6 border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  🔐 Permissions for {user.name}
                </h3>
                <button
                  onClick={() => setShowPermissions(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(user.permissions || {}).map(([permission, enabled]) => (
                  <label key={permission} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handlePermissionChange(user.id, permission as keyof UserPermissions, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                      disabled={user.role === 'MASTER' && permission === 'userManagement'}
                    />
                    <div>
                      <div className="font-medium text-sm capitalize">
                        {permission.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      {enabled && <div className="text-xs text-green-600">✅ Allowed</div>}
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowPermissions(null);
                    alert('✅ Permissions updated successfully!');
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add User Modal */}
      {showAddForm && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 z-[9999] overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-4 pt-16">
            <div className="bg-white rounded-lg w-full max-w-4xl shadow-2xl">
              <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 rounded-t-lg relative">
                <h3 className="text-xl font-bold">👤 Add New Staff Member</h3>
                <p className="text-blue-100">Create a new account and set permissions</p>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="absolute top-4 right-4 text-white hover:text-gray-200 p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddUser} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">👤 Personal Information</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                      <input
                        type="password"
                        required
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                        placeholder="Enter password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value as 'MASTER' | 'ADMIN' | 'USER'})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                      >
                        <option value="USER">👤 User - Basic Access</option>
                        <option value="ADMIN">🛡️ Admin - Management Access</option>
                        {currentUser.role === 'MASTER' && <option value="MASTER">👑 Master - Full Access</option>}
                      </select>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">🔐 Permissions</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {Object.entries(newUser.permissions).map(([permission, enabled]) => (
                        <label key={permission} className="flex items-center p-2 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={(e) => setNewUser({
                              ...newUser,
                              permissions: { ...newUser.permissions, [permission]: e.target.checked }
                            })}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                          />
                          <div>
                            <div className="font-medium text-sm capitalize">
                              {permission.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-xs text-gray-500">
                              Access to {permission.replace(/([A-Z])/g, ' $1').toLowerCase()} section
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 flex items-center gap-2 font-medium"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create Staff Member
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-bold">✏️ Edit Staff Member</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({...editingUser, role: e.target.value as 'MASTER' | 'ADMIN' | 'USER'})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={editingUser.role === 'MASTER' && currentUser.role !== 'MASTER'}
                >
                  <option value="USER">👤 User</option>
                  <option value="ADMIN">🛡️ Admin</option>
                  {currentUser.role === 'MASTER' && <option value="MASTER">👑 Master</option>}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingUser.isActive ? 'active' : 'inactive'}
                  onChange={(e) => setEditingUser({...editingUser, isActive: e.target.value === 'active'})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">✅ Active</option>
                  <option value="inactive">❌ Inactive</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleUpdateUser(editingUser.id, {
                      name: editingUser.name,
                      email: editingUser.email,
                      role: editingUser.role,
                      isActive: editingUser.isActive
                    });
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600"
                >
                  Update Staff Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
