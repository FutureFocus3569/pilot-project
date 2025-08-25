import React, { useState, useEffect } from 'react';
import { UserPlus, Building2, CheckSquare, Square } from 'lucide-react';

interface Centre {
  id: string;
  name: string;
  code: string;
  address?: string;
  capacity?: number;
}

interface PagePermission {
  page: string;
  enabled: boolean;
  centreIds: string[];
}

interface EnhancedUserFormProps {
  onSubmit: (userData: unknown) => void;
  onCancel: () => void;
  centres: Centre[];
}

export function EnhancedUserForm({ onSubmit, onCancel, centres }: EnhancedUserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'MASTER' | 'ADMIN' | 'USER',
  });

  // Type guard for userData
  function isUserData(data: unknown): data is typeof formData {
    return (
      typeof data === 'object' && data !== null &&
      'name' in data && 'email' in data && 'password' in data && 'role' in data
    );
  }

  const [pagePermissions, setPagePermissions] = useState<PagePermission[]>([
    { page: 'DASHBOARD', enabled: true, centreIds: [] },
    { page: 'XERO', enabled: false, centreIds: [] },
    { page: 'MARKETING', enabled: false, centreIds: [] },
    { page: 'DATA_MANAGEMENT', enabled: false, centreIds: [] },
    { page: 'ADMIN', enabled: false, centreIds: [] },
    { page: 'ASSISTANT', enabled: false, centreIds: [] },
  ]);

  const pageDescriptions = {
    DASHBOARD: 'View and manage daily operations, occupancy, and reports',
    XERO: 'Access financial data, invoicing, and accounting features',
    MARKETING: 'Manage marketing campaigns and communications',
    DATA_MANAGEMENT: 'Access to data exports and analytics',
    ADMIN: 'User management and system administration',
    ASSISTANT: 'AI assistant for support and automation'
  };

  const handlePagePermissionChange = (pageIndex: number, enabled: boolean) => {
    const updated = [...pagePermissions];
    updated[pageIndex].enabled = enabled;
    if (!enabled) {
      updated[pageIndex].centreIds = []; // Clear centres if page is disabled
    }
    setPagePermissions(updated);
  };

  const handleCentreToggle = (pageIndex: number, centreId: string) => {
    const updated = [...pagePermissions];
    const centreIds = updated[pageIndex].centreIds;
    
    if (centreIds.includes(centreId)) {
      updated[pageIndex].centreIds = centreIds.filter(id => id !== centreId);
    } else {
      updated[pageIndex].centreIds = [...centreIds, centreId];
    }
    
    setPagePermissions(updated);
  };

  const handleSelectAllCentres = (pageIndex: number) => {
    const updated = [...pagePermissions];
    updated[pageIndex].centreIds = centres.map(c => c.id);
    setPagePermissions(updated);
  };

  const handleClearAllCentres = (pageIndex: number) => {
    const updated = [...pagePermissions];
    updated[pageIndex].centreIds = [];
    setPagePermissions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData = {
      ...formData,
      organizationId: 'org_futurefocus', // Default org
      pagePermissions: pagePermissions.filter(p => p.enabled)
    };
    
    onSubmit(userData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as string })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USER">User - Limited access</option>
                  <option value="ADMIN">Admin - Management access</option>
                  <option value="MASTER">Master - Full access</option>
                </select>
              </div>
            </div>

            {/* Page Permissions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Page Access & Centre Permissions</h3>
              <div className="space-y-6">
                {pagePermissions.map((permission, pageIndex) => (
                  <div key={permission.page} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <button
                        type="button"
                        onClick={() => handlePagePermissionChange(pageIndex, !permission.enabled)}
                        className="mt-1"
                      >
                        {permission.enabled ? (
                          <CheckSquare className="h-5 w-5 text-blue-600" />
                        ) : (
                          <Square className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{permission.page}</h4>
                        <p className="text-sm text-gray-600">
                          {pageDescriptions[permission.page as keyof typeof pageDescriptions]}
                        </p>
                      </div>
                    </div>

                    {permission.enabled && (
                      <div className="ml-8 border-t pt-3">
                        <div className="flex items-center justify-between mb-3">
                          <h5 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Select Centres for {permission.page}
                          </h5>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleSelectAllCentres(pageIndex)}
                              className="text-xs text-blue-600 hover:text-blue-800"
                            >
                              Select All
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClearAllCentres(pageIndex)}
                              className="text-xs text-red-600 hover:text-red-800"
                            >
                              Clear All
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {centres.map((centre) => (
                            <label
                              key={centre.id}
                              className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                                permission.centreIds.includes(centre.id)
                                  ? 'bg-blue-50 border-blue-200'
                                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={permission.centreIds.includes(centre.id)}
                                onChange={() => handleCentreToggle(pageIndex, centre.id)}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-900">{centre.name}</div>
                                <div className="text-xs text-gray-500">{centre.code}</div>
                              </div>
                            </label>
                          ))}
                        </div>

                        <div className="mt-2 text-xs text-gray-600">
                          {permission.centreIds.length} of {centres.length} centres selected
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
