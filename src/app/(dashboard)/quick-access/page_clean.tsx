'use client';


import { useState, useEffect } from 'react';
import type { SiteCategory, NewSite } from '@/types/quick-access';

type SavedSite = {
  id: string;
  name: string;
  url: string;
  username: string;
  password: string; // Will be encrypted in production
  category: SiteCategory;
  centre?: string; // New field for centre name
  favicon?: string;
  lastUsed?: string;
  isActive: boolean;
};

export default function QuickAccessPage() {
  // State
  const [savedSites, setSavedSites] = useState<SavedSite[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSite, setEditingSite] = useState<SavedSite | null>(null);
  const [loading, setLoading] = useState(true);
  const CATEGORY_OPTIONS: SiteCategory[] = [
    'work', 'hr', 'childcare', 'accounting', 'supplies', 'other',
  ];

  const [newSite, setNewSite] = useState<NewSite>({
    name: '',
    url: '',
    username: '',
    password: '',
    category: 'supplies',
    centre: ''
  });

  // Current user (mock for now)
  const currentUser = {
    id: '1',
    name: 'Courtney Everest',
    email: 'courtney@futurefocus.co.nz'
  };

  // Load saved sites
  useEffect(() => {
    loadSavedSites();
  }, []);

  const loadSavedSites = async () => {
    try {
      // For now, we'll use localStorage, but in production this would be an API call
      const saved = localStorage.getItem(`quickAccess_${currentUser.id}`);
      if (saved) {
        setSavedSites(JSON.parse(saved));
      } else {
        // Demo data for first time users
        const demoSites: SavedSite[] = [
          {
            id: '1',
            name: 'Discover Childcare',
            url: 'https://discover.childcare.govt.nz',
            username: 'demo@futurefocus.co.nz',
            password: '••••••••',
            category: 'other',
            centre: 'Head Office',
            favicon: '🎓',
            lastUsed: new Date().toISOString(),
            isActive: true
          },
          {
            id: '2',
            name: 'MyHR',
            url: 'https://myhr.co.nz',
            username: 'courtney.manager',
            password: '••••••••',
            category: 'other',
            centre: 'Papamoa Beach',
            favicon: '👥',
            isActive: true
          }
        ];
        setSavedSites(demoSites);
      }
    } catch (error) {
      console.error('Error loading saved sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingSite) {
        // Update existing site
        const updatedSite: SavedSite = {
          ...editingSite,
          ...newSite,
          favicon: getFaviconUrl(newSite.url) || getCategoryIcon(newSite.category)
        };

        const updated = savedSites.map(s => 
          s.id === editingSite.id ? updatedSite : s
        );
        setSavedSites(updated);
        localStorage.setItem(`quickAccess_${currentUser.id}`, JSON.stringify(updated));
        alert('✅ Site updated successfully!');
      } else {
        // Add new site
        const newSavedSite: SavedSite = {
          id: Date.now().toString(),
          ...newSite,
          isActive: true,
          lastUsed: new Date().toISOString(),
          favicon: getFaviconUrl(newSite.url) || getCategoryIcon(newSite.category)
        };

        const updated = [...savedSites, newSavedSite];
        setSavedSites(updated);
        localStorage.setItem(`quickAccess_${currentUser.id}`, JSON.stringify(updated));
        alert('✅ Site added successfully!');
      }
      
      // Reset form
      setNewSite({
        name: '',
        url: '',
        username: '',
        password: '',
        category: 'other',
        centre: ''
      });
      setShowAddForm(false);
      setEditingSite(null);
      
    } catch (error) {
      console.error('Error saving site:', error);
      alert('❌ Error saving site');
    }
  };

  const handleEditSite = (site: SavedSite) => {
    setEditingSite(site);
    setNewSite({
      name: site.name,
      url: site.url,
      username: site.username,
      password: site.password,
      category: site.category,
      centre: site.centre || ''
    });
    setShowAddForm(true);
  };

  const handleQuickLogin = async (site: SavedSite) => {
    try {
      console.log('🚀 Starting quick login for:', site.name);
      
      // Update last used
      const updated = savedSites.map(s => 
        s.id === site.id ? { ...s, lastUsed: new Date().toISOString() } : s
      );
      setSavedSites(updated);
      localStorage.setItem(`quickAccess_${currentUser.id}`, JSON.stringify(updated));
      
      // Show loading state
      const originalButton = document.querySelector(`[data-site-id="${site.id}"]`);
      if (originalButton) {
        (originalButton as HTMLElement).textContent = '🔄 Logging in...';
        (originalButton as HTMLElement).style.pointerEvents = 'none';
      }
      
      // Try backend auto-login first
      try {
        console.log('🔐 Attempting backend auto-login...');
        const response = await fetch('/api/auto-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteUrl: site.url,
            username: site.username,
            password: 'decrypted-password-here', // In production, decrypt the password
            userId: currentUser.id
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Backend auto-login successful');
          
          // Open the site (already logged in)
          window.open(result.redirectUrl || site.url, '_blank');
          
          // Show success message
          alert(`✅ Successfully logged into ${site.name}!\n\nOpening in new tab...`);
        } else {
          console.log('⚠️ Backend auto-login failed, falling back to manual');
          throw new Error(result.error || 'Auto-login failed');
        }
        
      } catch (autoLoginError) {
        console.log('🔄 Auto-login failed, opening site manually:', autoLoginError);
        
        // Get the actual password (in production, this would be decrypted)
        const actualPassword = site.password.replace(/•/g, ''); // Remove masking if present
        
        // Copy credentials to clipboard for easy pasting
        const credentialsText = `Username: ${site.username}\nPassword: ${actualPassword}`;
        
        try {
          await navigator.clipboard.writeText(credentialsText);
          console.log('✅ Credentials copied to clipboard');
        } catch (clipboardError) {
          console.log('⚠️ Could not copy to clipboard:', clipboardError);
        }
        
        // Open site in new tab
        window.open(site.url, '_blank');
        
        // Show detailed manual login instructions with actual password
        const instructions = `🌐 Opening ${site.name}...\n\n` +
              `Your login credentials:\n` +
              `📧 Username: ${site.username}\n` +
              `🔑 Password: ${actualPassword}\n\n` +
              `✅ Credentials have been copied to your clipboard!\n` +
              `Just paste them into the login form.\n\n` +
              `💡 Full auto-login coming soon for this site!`;
        
        alert(instructions);
      }
      
    } catch (error) {
      console.error('❌ Quick login error:', error);
      alert('❌ Error during login process');
    } finally {
      // Reset button state
      const originalButton = document.querySelector(`[data-site-id="${site.id}"]`);
      if (originalButton) {
        (originalButton as HTMLElement).textContent = 'Quick Login';
        (originalButton as HTMLElement).style.pointerEvents = 'auto';
      }
    }
  };

  const handleDeleteSite = async (siteId: string, siteName: string) => {
    if (confirm(`Are you sure you want to delete "${siteName}"?\n\nThis will remove all saved login information for this site.`)) {
      try {
        console.log('🗑️ Deleting site:', siteName);
        
        // Remove from state
        const updated = savedSites.filter(s => s.id !== siteId);
        setSavedSites(updated);
        
        // Update localStorage
        localStorage.setItem(`quickAccess_${currentUser.id}`, JSON.stringify(updated));
        
        alert(`✅ Successfully deleted "${siteName}"`);
      } catch (error) {
        console.error('❌ Error deleting site:', error);
        alert('❌ Error deleting site');
      }
    }
  };

  const handleCopyCredentials = async (site: SavedSite) => {
    try {
      const actualPassword = site.password.replace(/•/g, ''); // Remove masking if present
      const credentialsText = `Username: ${site.username}\nPassword: ${actualPassword}`;
      
      await navigator.clipboard.writeText(credentialsText);
      
      alert(`📋 Credentials copied for ${site.name}!\n\n` +
            `Username: ${site.username}\n` +
            `Password: ${actualPassword}\n\n` +
            `You can now paste these into the login form.`);
    } catch (error) {
      console.error('❌ Error copying credentials:', error);
      // Fallback: show credentials in alert
      const actualPassword = site.password.replace(/•/g, '');
      alert(`📋 ${site.name} Credentials:\n\n` +
            `Username: ${site.username}\n` +
            `Password: ${actualPassword}\n\n` +
            `(Could not copy to clipboard - please copy manually)`);
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      // Try multiple favicon sources
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
      return null;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'supplies': return '🛒';
      case 'other': return '🔗';
      default: return '🔗';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'supplies': return 'bg-orange-100 text-orange-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Group sites by name for better organization
  const getGroupedSites = () => {
    const grouped = savedSites.reduce((acc, site) => {
      // Extract base name (e.g., "Fresh Market" from "Fresh Market", "New World" from "New World Online")
      const baseName = site.name.replace(/\s+(Online|NZ|New Zealand)$/i, '').trim();
      
      if (!acc[baseName]) {
        acc[baseName] = [];
      }
      acc[baseName].push(site);
      return acc;
    }, {} as Record<string, SavedSite[]>);

    // Sort groups by name, then sort sites within each group by centre
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([groupName, sites]) => ({
        groupName,
        sites: sites.sort((a, b) => (a.centre || '').localeCompare(b.centre || ''))
      }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Quick Access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Quick Access Hub</h1>
            <p className="text-blue-100">Your personal workspace - one click to access all your tools</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="bg-blue-600 px-3 py-1 rounded-full text-sm text-white">
                👤 {currentUser.name}
              </span>
              <span className="text-blue-100 text-sm">
                🔐 {savedSites.length} saved {savedSites.length === 1 ? 'site' : 'sites'}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
          >
            ➕ Add New Site
          </button>
        </div>
      </div>

      {/* Saved Sites Grid */}
      <div className="mx-6 mb-6">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Your Saved Sites</h2>
            <p className="text-gray-600">Click any site to open with auto-login</p>
          </div>

          {savedSites.length === 0 ? (
            <div className="p-16 text-center">
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-100">
                <span className="text-4xl">🔗</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-3">No Saved Sites Yet</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Get started by adding your frequently used websites for quick and secure access</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-3 mx-auto"
              >
                <span className="text-lg">➕</span>
                Add Your First Site
              </button>
            </div>
          ) : (
            <div className="p-6">
              {getGroupedSites().map(({ groupName, sites }) => (
                <div key={groupName} className="mb-8 last:mb-0">
                  <div className="flex items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">{groupName}</h3>
                    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                      {sites.length} {sites.length === 1 ? 'location' : 'locations'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sites.map((site) => (
                      <div key={site.id} className="bg-white rounded-xl p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-blue-200 group">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center flex-1">
                            <div className="w-14 h-14 mr-4 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 group-hover:from-blue-50 group-hover:to-blue-100 group-hover:border-blue-200 transition-all duration-200">
                              {getFaviconUrl(site.url) ? (
                                <img 
                                  src={getFaviconUrl(site.url)!} 
                                  alt={`${site.name} favicon`}
                                  className="w-10 h-10 rounded-lg"
                                  onError={(e) => {
                                    // Fallback to emoji if favicon fails to load
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling!.textContent = site.favicon || getCategoryIcon(site.category);
                                    (target.nextElementSibling as HTMLElement)!.style.display = 'block';
                                  }}
                                />
                              ) : null}
                              <span 
                                className="text-2xl"
                                style={{ display: getFaviconUrl(site.url) ? 'none' : 'block' }}
                              >
                                {site.favicon || getCategoryIcon(site.category)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{site.name}</h3>
                              {site.centre && (
                                <p className="text-sm text-gray-600 font-medium truncate">{site.centre}</p>
                              )}
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(site.category)} whitespace-nowrap ml-2`}>
                            {site.category}
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Primary Action Button */}
                          <div>
                            <button
                              onClick={() => handleQuickLogin(site)}
                              data-site-id={site.id}
                              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-200 font-semibold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                              Quick Login
                            </button>
                          </div>
                          
                          {/* Secondary Action Buttons */}
                          <div className="grid grid-cols-2 gap-2">
                            <button 
                              onClick={() => handleEditSite(site)}
                              className="bg-gray-50 text-gray-700 py-2.5 px-3 rounded-lg text-xs font-medium hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:border-gray-300 flex items-center justify-center gap-1.5"
                            >
                              <span className="text-sm">✏️</span>
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteSite(site.id, site.name)}
                              className="bg-red-50 text-red-700 py-2.5 px-3 rounded-lg text-xs font-medium hover:bg-red-100 transition-all duration-200 border border-red-200 hover:border-red-300 flex items-center justify-center gap-1.5"
                            >
                              <span className="text-sm">🗑️</span>
                              Delete
                            </button>
                          </div>
                        </div>
                        
                        {/* Footer with last used info */}
                        {site.lastUsed && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <span>🕒</span>
                                Last used: {new Date(site.lastUsed).toLocaleDateString()}
                              </p>
                              <div className="w-2 h-2 bg-green-400 rounded-full" title="Active site"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Site Modal */}
      {showAddForm && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  {editingSite ? '✏️ Edit Site' : '➕ Add New Site'}
                </h3>
                <button 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingSite(null);
                    setNewSite({
                      name: '',
                      url: '',
                      username: '',
                      password: '',
                      category: 'other',
                      centre: ''
                    });
                  }}
                  className="text-white hover:text-gray-300 text-xl"
                >
                  ✕
                </button>
              </div>
              <p className="text-blue-100 text-sm mt-1">
                {editingSite ? 'Update your login credentials' : 'Save your login credentials for quick access'}
              </p>
            </div>

            <div className="p-6">
              <h4 className="font-semibold text-gray-800 mb-4">📝 Site Details</h4>
              
              <form onSubmit={handleAddSite} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
                    <input
                      type="text"
                      required
                      value={newSite.name}
                      onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Fresh Market"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Centre/Location</label>
                    <input
                      type="text"
                      value={newSite.centre || ''}
                      onChange={(e) => setNewSite({ ...newSite, centre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Papamoa Beach, Head Office"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newSite.category}
                      onChange={(e) => setNewSite(s => ({ ...s, category: e.target.value as SiteCategory }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORY_OPTIONS.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                        required
                        value={newSite.url}
                        onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                      {newSite.url && getFaviconUrl(newSite.url) && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <img 
                            src={getFaviconUrl(newSite.url)!} 
                            alt="Site favicon preview"
                            className="w-5 h-5 rounded"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                    </div>
                    {newSite.url && (
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Site logo will be automatically detected
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username/Email</label>
                    <input
                      type="text"
                      required
                      value={newSite.username}
                      onChange={(e) => setNewSite({ ...newSite, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your username or email"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      value={newSite.password}
                      onChange={(e) => setNewSite({ ...newSite, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your password"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="text-blue-600 mr-3">🔐</div>
                    <div>
                      <h5 className="font-medium text-blue-900">Security Notice</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Your credentials are stored securely and encrypted. Only you can access your saved passwords.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingSite(null);
                      setNewSite({
                        name: '',
                        url: '',
                        username: '',
                        password: '',
                        category: 'other',
                        centre: ''
                      });
                    }}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md hover:from-blue-600 hover:to-teal-600 transition-all duration-200 font-semibold"
                  >
                    {editingSite ? '✏️ Update Site' : '➕ Add Site'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
