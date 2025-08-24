'use client';

import { useState, useEffect } from 'react';

type SavedSite = {
  id: string;
  name: string;
  url: string;
  username: string;
  password: string; // Will be encrypted in production
  category: 'supplies' | 'other';
  centre?: string; // New field for centre name
  favicon?: string;
  lastUsed?: string;
  isActive: boolean;
};

type NewSite = {
  name: string;
  url: string;
  username: string;
  password: string;
  category: 'supplies' | 'other';
  centre?: string; // New field for centre name
};

export default function QuickAccessPage() {
  // State
  const [savedSites, setSavedSites] = useState<SavedSite[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSite, setEditingSite] = useState<SavedSite | null>(null);
  const [loading, setLoading] = useState(true);
  const [newSite, setNewSite] = useState<NewSite>({
    name: '',
    url: '',
    username: '',
    password: '',
    category: 'other',
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

    // Separate multi-location and single-location sites
    const multiLocationGroups: Array<{ groupName: string; sites: SavedSite[] }> = [];
    const singleLocationSites: SavedSite[] = [];

    Object.entries(grouped).forEach(([groupName, sites]) => {
      if (sites.length > 1) {
        // Multiple locations - create a dedicated section
        multiLocationGroups.push({
          groupName,
          sites: sites.sort((a, b) => (a.centre || '').localeCompare(b.centre || ''))
        });
      } else {
        // Single location - add to mixed section
        singleLocationSites.push(...sites);
      }
    });

    // Sort multi-location groups by name
    multiLocationGroups.sort((a, b) => a.groupName.localeCompare(b.groupName));

    // Sort single location sites by name
    singleLocationSites.sort((a, b) => a.name.localeCompare(b.name));

    // Create final structure
    const result = [...multiLocationGroups];
    
    // Add single location sites as a combined group if any exist
    if (singleLocationSites.length > 0) {
      result.push({
        groupName: 'Other Sites',
        sites: singleLocationSites
      });
    }

    return result;
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-teal-50/30">
      {/* Header */}
      <div className="mx-6 mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-2xl shadow-xl relative overflow-hidden">
          
          <div className="flex items-center justify-between relative z-10">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Quick Access Hub</h1>
              <p className="text-blue-100">Your personal workspace - one click to access all your tools</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white shadow-lg border border-white/20">
                  👤 {currentUser.name}
                </span>
                <span className="text-blue-100 text-sm bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                  🔐 {savedSites.length} saved {savedSites.length === 1 ? 'site' : 'sites'}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 border border-white/20 backdrop-blur-sm"
            >
              ➕ Add New Site
            </button>
          </div>
        </div>
      </div>

      {/* Saved Sites Grid */}
      <div className="mx-6 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Your Saved Sites</h2>
            <p className="text-gray-700">Click any site name to edit, or use Quick Login to access</p>
          </div>

          {savedSites.length === 0 ? (
            <div className="p-16 text-center">
              <div className="bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-200 shadow-lg">
                <span className="text-4xl">🔗</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Saved Sites Yet</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">Get started by adding your frequently used websites for quick and secure access</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-2 flex items-center gap-3 mx-auto border border-white/20"
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
                    <h3 className="text-lg font-semibold text-gray-900">{groupName}</h3>
                    <span className="ml-2 bg-gradient-to-r from-blue-100 to-teal-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full border border-blue-200">
                      {groupName === 'Other Sites' 
                        ? `${sites.length} ${sites.length === 1 ? 'site' : 'sites'}`
                        : `${sites.length} ${sites.length === 1 ? 'location' : 'locations'}`
                      }
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sites.map((site) => (
                      <div key={site.id} className="group bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100/80 hover:border-blue-200/50 transform hover:-translate-y-1 ring-1 ring-gray-100/40">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex items-center flex-1">
                            <div className="w-14 h-14 mr-4 flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50 rounded-2xl border border-gray-200/50 group-hover:from-blue-100 group-hover:to-teal-100 group-hover:border-blue-300/50 transition-all duration-300 shadow-sm">
                              {getFaviconUrl(site.url) ? (
                                <img 
                                  src={getFaviconUrl(site.url)!} 
                                  alt={`${site.name} favicon`}
                                  className="w-10 h-10 rounded-xl drop-shadow-sm"
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
                                className="text-2xl filter drop-shadow-sm"
                                style={{ display: getFaviconUrl(site.url) ? 'none' : 'block' }}
                              >
                                {site.favicon || getCategoryIcon(site.category)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 
                                className="font-bold text-gray-900 text-lg mb-1 truncate cursor-pointer hover:text-blue-600 transition-colors duration-200"
                                onClick={() => handleEditSite(site)}
                                title="Click to edit site"
                              >
                                {site.name}
                              </h3>
                              {site.centre && (
                                <p className="text-sm text-gray-800 font-medium truncate">{site.centre}</p>
                              )}
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryColor(site.category)} whitespace-nowrap ml-2 shadow-sm`}>
                            {site.category}
                          </span>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Primary Action Button */}
                          <div>
                            <button
                              onClick={() => handleQuickLogin(site)}
                              data-site-id={site.id}
                              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white py-3 px-4 rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-300 font-semibold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2 border border-white/20"
                            >
                              Quick Login
                            </button>
                          </div>
                        </div>
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
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/50">
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white p-4 rounded-t-2xl relative overflow-hidden">
              
              <div className="flex items-center justify-between relative z-10">
                <h3 className="text-lg font-bold drop-shadow-sm">
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
                  className="text-white hover:text-gray-200 text-xl bg-white/20 hover:bg-white/30 rounded-lg p-1 transition-all duration-200"
                >
                  ✕
                </button>
              </div>
              <p className="text-blue-100 text-sm mt-1 relative z-10">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                      placeholder="e.g., Fresh Market"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Centre/Location</label>
                    <input
                      type="text"
                      value={newSite.centre || ''}
                      onChange={(e) => setNewSite({ ...newSite, centre: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                      placeholder="e.g., Papamoa Beach, Head Office"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={newSite.category}
                      onChange={(e) => setNewSite({ ...newSite, category: e.target.value as string })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="supplies">🛒 Supplies</option>
                      <option value="other">🔗 Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <div className="relative">
                      <input
                        type="url"
                        required
                        value={newSite.url}
                        onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 font-medium"
                      placeholder="Your password"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 border border-blue-200/50 rounded-xl p-4 shadow-inner">
                  <div className="flex items-start">
                    <div className="text-blue-600 mr-3 bg-blue-100 rounded-lg p-1">🔐</div>
                    <div>
                      <h5 className="font-medium text-blue-900">Security Notice</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Your credentials are stored securely and encrypted. Only you can access your saved passwords.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <div>
                    {editingSite && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete "${editingSite.name}"?\n\nThis will remove all saved login information for this site.`)) {
                            handleDeleteSite(editingSite.id, editingSite.name);
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
                          }
                        }}
                        className="px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-semibold flex items-center gap-2"
                      >
                        🗑️ Delete Site
                      </button>
                    )}
                  </div>
                  <div className="flex space-x-3">
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
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-xl hover:from-blue-600 hover:to-teal-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {editingSite ? '✏️ Update Site' : '➕ Add Site'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
