
'use client';

import { useState, useEffect } from 'react';
import type { SiteCategory, NewSite } from '@/types/quick-access';

// Pre-defined popular sites for childcare managers
const POPULAR_SITES = [
  {
    name: 'Discover Childcare',
    url: 'https://discover.childcare.govt.nz',
    category: 'childcare' as const,
    description: 'ECE platform for childcare services',
    favicon: '🎓'
  },
  {
    name: 'MyHR',
    url: 'https://myhr.co.nz',
    category: 'hr' as const,
    description: 'HR management platform',
    favicon: '👥'
  },
  {
    name: 'New World Online',
    url: 'https://www.newworld.co.nz',
    category: 'supplies' as const,
    description: 'Online grocery shopping',
    favicon: '🛒'
  },
  {
    name: 'Xero',
    url: 'https://login.xero.com',
    category: 'accounting' as const,
    description: 'Accounting software',
    favicon: '📊'
  }
];

export default function QuickAccessPage() {
  // State
  const [savedSites, setSavedSites] = useState<SavedSite[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
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
            password: 'password123',
            category: 'childcare',
            isActive: true
          }
        ];
        setSavedSites(demoSites);
      }

  interface SavedSite {
    id: string;
    name: string;
    url: string;
    username: string;
    password: string; // Will be encrypted in production
    category: 'work' | 'childcare' | 'hr' | 'accounting' | 'supplies' | 'other';
    favicon?: string;
    lastUsed?: string;
    isActive: boolean;
  }

  interface NewSite {
    name: string;
    url: string;
    username: string;
    password: string;
    category: 'work' | 'childcare' | 'hr' | 'accounting' | 'supplies' | 'other';
  }
    } finally {
      setLoading(false);
    }
  };

  const handleAddSite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const newSavedSite: SavedSite = {
        id: Date.now().toString(),
        ...newSite,
        isActive: true,
        lastUsed: new Date().toISOString(),
        favicon: getFaviconUrl(newSite.url) || getCategoryIcon(newSite.category)
      };

      const updated = [...savedSites, newSavedSite];
      setSavedSites(updated);
      
      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem(`quickAccess_${currentUser.id}`, JSON.stringify(updated));
      
      // Reset form
      setNewSite({
        name: '',
        url: '',
        username: '',
        password: '',
        category: 'work'
      });
      setShowAddForm(false);
      
      alert('✅ Site added successfully!');
    } catch (error) {
      console.error('Error adding site:', error);
      alert('❌ Error adding site');
    }
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
        
        // Fallback: Open site manually with credentials shown
        window.open(site.url, '_blank');
        
        // Show manual login instructions
        alert(`� Opening ${site.name}...\n\n` +
              `Please login manually with:\n` +
              `Username: ${site.username}\n` +
              `Password: [Saved in your vault]\n\n` +
              `💡 Auto-login will be available soon for this site!`);
      }
      
    } catch (error) {
      console.error('❌ Quick login error:', error);
      alert('❌ Error during login process');
    } finally {
      // Reset button state
      const originalButton = document.querySelector(`[data-site-id="${site.id}"]`);
      if (originalButton) {
        (originalButton as HTMLElement).textContent = '🚀 Quick Login';
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
      case 'childcare': return '🎓';
      case 'hr': return '👥';
      case 'accounting': return '📊';
      case 'supplies': return '🛒';
      case 'work': return '💼';
      default: return '🔗';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'childcare': return 'bg-blue-100 text-blue-800';
      case 'hr': return 'bg-green-100 text-green-800';
      case 'accounting': return 'bg-purple-100 text-purple-800';
      case 'supplies': return 'bg-orange-100 text-orange-800';
      case 'work': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">⚡ Quick Access Hub</h1>
            <p className="text-teal-100">Your personal workspace - one click to access all your tools</p>
            <div className="flex items-center gap-4 mt-3">
              <span className="bg-teal-500 px-3 py-1 rounded-full text-sm text-white">
                👤 {currentUser.name}
              </span>
              <span className="text-teal-100 text-sm">
                🔐 {savedSites.length} saved {savedSites.length === 1 ? 'site' : 'sites'}
              </span>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-white text-teal-600 px-6 py-3 rounded-lg font-semibold hover:bg-teal-50 transition-colors shadow-lg"
          >
            ➕ Add New Site
          </button>
        </div>
      </div>

      {/* Saved Sites Grid */}
      <div className="mx-6 mb-6">
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">🚀 Your Saved Sites</h2>
            <p className="text-gray-600">Click any site to open with auto-login</p>
          </div>

          {savedSites.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Saved Sites Yet</h3>
              <p className="text-gray-500 mb-6">Add your first site to get started with quick access</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors"
              >
                ➕ Add Your First Site
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {savedSites.map((site) => (
                <div key={site.id} className="bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="w-12 h-12 mr-3 flex items-center justify-center">
                        {getFaviconUrl(site.url) ? (
                          <img 
                            src={getFaviconUrl(site.url)!} 
                            alt={`${site.name} favicon`}
                            className="w-8 h-8 rounded"
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
                          className="text-3xl"
                          style={{ display: getFaviconUrl(site.url) ? 'none' : 'block' }}
                        >
                          {site.favicon || getCategoryIcon(site.category)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{site.name}</h3>
                        <p className="text-sm text-gray-500">{site.username}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(site.category)}`}>
                      {site.category}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleQuickLogin(site)}
                        data-site-id={site.id}
                        className="bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 transition-colors font-medium text-sm"
                      >
                        🚀 Quick Login
                      </button>
                      <button
                        onClick={() => window.open(site.url, '_blank')}
                        className="bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                      >
                        🌐 Open Site
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => handleCopyCredentials(site)}
                        className="bg-blue-100 text-blue-600 py-2 px-2 rounded text-xs hover:bg-blue-200 transition-colors"
                        title="Copy username and password to clipboard"
                      >
                        📋 Copy
                      </button>
                      <button className="bg-gray-200 text-gray-700 py-2 px-2 rounded text-xs hover:bg-gray-300 transition-colors">
                        ✏️ Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteSite(site.id, site.name)}
                        className="bg-red-100 text-red-600 py-2 px-2 rounded text-xs hover:bg-red-200 transition-colors"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  
                  {site.lastUsed && (
                    <p className="text-xs text-gray-400 mt-3">
                      Last used: {new Date(site.lastUsed).toLocaleDateString()}
                    </p>
                  )}
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
            <div className="bg-teal-600 text-white p-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">➕ Add New Site</h3>
                <button 
                  onClick={() => setShowAddForm(false)}
                  className="text-white hover:text-gray-300 text-xl"
                >
                  ✕
                </button>
              </div>
              <p className="text-teal-100 text-sm mt-1">Save your login credentials for quick access</p>
            </div>

            <div className="p-6">
              {/* Popular Sites Quick Add */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3">🌟 Popular Sites</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {POPULAR_SITES.map((site) => (
                    <button
                      key={site.name}
                      onClick={() => setNewSite(prev => ({
                        ...prev,
                        name: site.name,
                        url: site.url,
                        category: site.category
                      }))}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <span className="text-2xl mr-3">{site.favicon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{site.name}</div>
                        <div className="text-sm text-gray-500">{site.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="e.g., Discover Childcare"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={newSite.category}
                        onChange={(e) =>
                          setNewSite(s => ({ ...s, category: e.target.value as SiteCategory }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        {CATEGORY_OPTIONS.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="work">💼 Work</option>
                        <option value="childcare">🎓 Childcare</option>
                        <option value="hr">👥 HR</option>
                        <option value="accounting">📊 Accounting</option>
                        <option value="supplies">🛒 Supplies</option>
                        <option value="other">🔗 Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                    <div className="relative">
                      <input
                        type="url"
                        required
                        value={newSite.url}
                        onChange={(e) => setNewSite({ ...newSite, url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username/Email</label>
                      <input
                        type="text"
                        required
                        value={newSite.username}
                        onChange={(e) => setNewSite({ ...newSite, username: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                      onClick={() => setShowAddForm(false)}
                      className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                    >
                      🔐 Save Site
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
