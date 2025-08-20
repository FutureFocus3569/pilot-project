'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Users, Shield, Edit, Trash2, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'MASTER' | 'ADMIN' | 'USER';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface Centre {
  id: string;
  name: string;
  code: string;
}

interface PagePermission {
  page: string;
  enabled: boolean;
  requiresCentreSelection?: boolean;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'MASTER' | 'ADMIN' | 'USER',
    pagePermissions: [
      { page: 'DASHBOARD', enabled: true, requiresCentreSelection: true },
      { page: 'XERO', enabled: false, requiresCentreSelection: true },
      { page: 'MARKETING', enabled: false, requiresCentreSelection: false },
      { page: 'DATA_MANAGEMENT', enabled: false, requiresCentreSelection: false },
      { page: 'ADMIN', enabled: false, requiresCentreSelection: false },
      { page: 'ASSISTANT', enabled: false, requiresCentreSelection: false },
    ] as PagePermission[],
    centreIds: [] as string[]
  });
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isUsingDatabase, setIsUsingDatabase] = useState(false);

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
      const response = await fetch('/api/admin/users?organizationId=cm1f9zr5g0001xjr5l5h8fvzm');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setIsUsingDatabase(true);
      } else {
        // Fallback to mock data
        setUsers([
          {
            id: '1',
            name: 'Courtney Everest',
            email: 'courtney@futurefocus.co.nz',
            role: 'MASTER',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            id: '2', 
            name: 'Jane Smith',
            email: 'jane@futurefocus.co.nz',
            role: 'ADMIN',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Fallback to mock data
      setUsers([
        {
          id: '1',
          name: 'Courtney Everest',
          email: 'courtney@futurefocus.co.nz',
          role: 'MASTER',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);
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
      }
    } catch (error) {
      console.error('Error fetching centres:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newUser,
          organizationId: 'cm1f9zr5g0001xjr5l5h8fvzm'
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User created successfully:', userData);
        alert(`✅ User created successfully! ID: ${userData.id}`);
        
        setShowAddForm(false);
        setNewUser({
          name: '',
          email: '',
          password: '',
          role: 'USER',
          pagePermissions: [
            { page: 'DASHBOARD', enabled: true, requiresCentreSelection: true },
            { page: 'XERO', enabled: false, requiresCentreSelection: true },
            { page: 'MARKETING', enabled: false, requiresCentreSelection: false },
            { page: 'DATA_MANAGEMENT', enabled: false, requiresCentreSelection: false },
            { page: 'ADMIN', enabled: false, requiresCentreSelection: false },
            { page: 'ASSISTANT', enabled: false, requiresCentreSelection: false },
          ],
          centreIds: []
        });
        fetchUsers();
      } else {
        const error = await response.json();
        console.error('❌ Server error:', error);
        alert(`❌ Failed to create user: ${error.error}`);
      }
    } catch (error) {
      console.error('❌ Network error creating user:', error);
      alert('❌ Failed to create user - network error');
    }
  };

  const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        alert('✅ User updated successfully!');
        setEditingUser(null);
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`❌ Failed to update user: ${error.error}`);
      }
    } catch (error) {
      console.error('❌ Error updating user:', error);
      alert('❌ Failed to update user - network error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('✅ User deleted successfully!');
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`❌ Failed to delete user: ${error.error}`);
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert('❌ Failed to delete user - network error');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MASTER': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      case 'USER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
            <h1 className="text-3xl font-bold text-white mb-2">👥 User Management</h1>
            <p className="text-white text-lg">
              Manage staff accounts and permissions
              {!isUsingDatabase && (
                <span className="ml-2 px-2 py-1 bg-yellow-400 text-yellow-900 text-xs rounded">
                  DEMO MODE
                </span>
              )}
            </p>
          </div>
          {currentUser.role === 'MASTER' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg"
            >
              <UserPlus className="w-4 h-4" />
              Add New User
            </button>
          )}
        </div>
      </div>

      {/* Add User Form */}
      {showAddForm && currentUser.role === 'MASTER' && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 z-[9999] overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-4 pt-16">
            <div className="bg-white rounded-lg w-full max-w-4xl shadow-2xl">
              <div className="bg-blue-600 text-white p-4 rounded-t-lg relative">
                <h3 className="text-xl font-bold">👤 Add New Staff Member</h3>
                <p className="text-blue-100">Complete the form below to create a new staff account</p>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="absolute top-4 right-4 text-white hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleAddUser} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">👤 Personal Information</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={newUser.name}
                        onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={newUser.email}
                        onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={newUser.password}
                        onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter password"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <select
                        value={newUser.role}
                        onChange={(e) => setNewUser({...newUser, role: e.target.value as 'MASTER' | 'ADMIN' | 'USER'})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="USER">👤 User</option>
                        <option value="ADMIN">👑 Admin</option>
                        <option value="MASTER">🔑 Master</option>
                      </select>
                    </div>
                  </div>

                  {/* Centre Access */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800 border-b pb-2">🏢 Centre Access</h4>
                    <div className="max-h-40 overflow-y-auto border rounded-lg p-3">
                      {centres.map((centre) => (
                        <label key={centre.id} className="flex items-center space-x-2 mb-2">
                          <input
                            type="checkbox"
                            checked={newUser.centreIds.includes(centre.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setNewUser({
                                  ...newUser,
                                  centreIds: [...newUser.centreIds, centre.id]
                                });
                              } else {
                                setNewUser({
                                  ...newUser,
                                  centreIds: newUser.centreIds.filter(id => id !== centre.id)
                                });
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-sm">{centre.name} ({centre.code})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Page Permissions */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800 border-b pb-2 mb-4">🔐 Page Permissions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {newUser.pagePermissions.map((permission, index) => (
                      <div key={permission.page} className="border rounded-lg p-3">
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={permission.enabled}
                            onChange={(e) => {
                              const updatedPermissions = [...newUser.pagePermissions];
                              updatedPermissions[index].enabled = e.target.checked;
                              setNewUser({...newUser, pagePermissions: updatedPermissions});
                            }}
                            className="rounded"
                          />
                          <span className="font-medium">{permission.page}</span>
                        </label>
                        {permission.requiresCentreSelection && (
                          <p className="text-xs text-gray-500 mt-1">Requires centre selection</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Staff Members ({users.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {currentUser.role === 'MASTER' && user.role !== 'MASTER' && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-2xl">
            <div className="bg-blue-600 text-white p-4 rounded-t-lg">
              <h3 className="text-lg font-bold">✏️ Edit User</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-200"
              >
                ✕
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
                >
                  <option value="USER">👤 User</option>
                  <option value="ADMIN">👑 Admin</option>
                  <option value="MASTER">🔑 Master</option>
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
                      role: editingUser.role
                    });
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Update User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
