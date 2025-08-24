"use client";

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/auth-context';

interface Centre {
  id: string;
  name: string;
  code: string;
}

interface BudgetData {
  category: string;
  monthlyBudget: number;
  actualSpend: number;
  variance: number;
  monthlyData: {
    [month: string]: number;
  };
}

interface BudgetCategory {
  id: string;
  name: string;
  description?: string;
}

interface CentreBudget {
  id: string;
  centreId: string;
  categoryId: string;
  monthlyBudget: number;
  xeroAccountCode?: string;
  centre: Centre;
  category: BudgetCategory;
}

// Map centre IDs to Xero tenant IDs (update these IDs as needed)
const CENTRE_TENANT_MAP: { [centreId: string]: string } = {
  '1': '613cb02c-c997-49f9-bf2c-7b4eebb571d2', // Papamoa Beach
  '2': '5a5addf5-dd46-4b62-bf61-afcfbde59d90', // The Boulevard
  '3': '8ee192cc-ac9d-46fd-8796-c653ded3753f', // Livingstone Drive
  '4': '63251a82-8296-433a-92ed-faf696756545', // The Bach
  '5': '08b98d52-d3b2-4c47-b4ec-ef371f58cf60', // Terrace Views
  '6': 'b39bba96-4062-4223-a917-26f9f347d9e6', // West Dune Limited
};

// Remove hardcoded sampleCentres. We'll build the centres list from loaded budgets.

const sampleBudgetData: { [centreId: string]: BudgetData[] } = {
  '1': [ // Papamoa Beach
    {
      category: 'Art and Messy Play',
      monthlyBudget: 300,
      actualSpend: 228,
      variance: 72,
      monthlyData: { 'JAN': 18, 'FEB': 20, 'MAR': 19, 'APR': 21, 'MAY': 20, 'JUN': 19, 'JUL': 18, 'AUG': 20, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
    {
      category: 'Centre Purchases',
      monthlyBudget: 500,
      actualSpend: 460,
      variance: 40,
      monthlyData: { 'JAN': 35, 'FEB': 40, 'MAR': 38, 'APR': 42, 'MAY': 39, 'JUN': 37, 'JUL': 36, 'AUG': 41, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
  ],
  '2': [ // The Boulevard
    {
      category: 'Food Costs',
      monthlyBudget: 3200,
      actualSpend: 3180,
      variance: 20,
      monthlyData: { 'JAN': 195, 'FEB': 205, 'MAR': 200, 'APR': 210, 'MAY': 215, 'JUN': 195, 'JUL': 205, 'AUG': 210, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
  ],
  '3': [ // Livingstone Drive
    {
      category: 'Cleaning Supplies',
      monthlyBudget: 800,
      actualSpend: 780,
      variance: 20,
      monthlyData: { 'JAN': 95, 'FEB': 100, 'MAR': 98, 'APR': 102, 'MAY': 99, 'JUN': 96, 'JUL': 94, 'AUG': 101, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
  ]
};


export default function XeroPage() {
  const { user } = useAuth();
  const [expandedCentres, setExpandedCentres] = useState<Set<string>>(new Set());
  const [centres, setCentres] = useState<Centre[]>([]);
  const [budgetData, setBudgetData] = useState<{ [centreId: string]: BudgetData[] }>(sampleBudgetData);
  const [selectedYear] = useState(2025);
  const [isXeroConnected, setIsXeroConnected] = useState(false);
  const [xeroConnectionStatus, setXeroConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Load budget data from localStorage
  useEffect(() => {
    // Check for access_token in URL (after Xero OAuth)
    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get('access_token');
    if (accessToken) {
      localStorage.setItem('xero_access_token', accessToken);
      localStorage.setItem('xero_connected', 'true');
      localStorage.setItem('xero_last_sync', new Date().toISOString());
      setIsXeroConnected(true);
      setXeroConnectionStatus('connected');
      setLastSyncTime(new Date());
      // Remove token from URL for cleanliness
      url.searchParams.delete('access_token');
      window.history.replaceState({}, document.title, url.pathname);
    }
    loadBudgetData();
    checkXeroConnection();
  }, []);

  const checkXeroConnection = () => {
    const connected = localStorage.getItem('xero_connected') === 'true';
    const lastSync = localStorage.getItem('xero_last_sync');
    
    if (connected) {
      setIsXeroConnected(true);
      setXeroConnectionStatus('connected');
      if (lastSync) {
        setLastSyncTime(new Date(lastSync));
      }
    }
  };
  
  const loadBudgetData = () => {
    try {
      // Load saved budgets from localStorage
      const budgetKey = `budgets_${selectedYear}`;
      const storedBudgets = localStorage.getItem(budgetKey);
      if (storedBudgets) {
        const budgets: CentreBudget[] = JSON.parse(storedBudgets);
        // Build unique centres from budgets
        const uniqueCentres: { [id: string]: Centre } = {};
        budgets.forEach(b => {
          if (b.centre && b.centre.id) {
            uniqueCentres[b.centre.id] = b.centre;
          }
        });
        setCentres(Object.values(uniqueCentres));
        // Only set up empty budgetData structure; do not generate random/mock data
        const convertedData: { [centreId: string]: BudgetData[] } = {};
        Object.keys(uniqueCentres).forEach(centreId => {
          const centreBudgets = budgets.filter(b => b.centreId === centreId);
          convertedData[centreId] = centreBudgets.map(budget => ({
            category: budget.category.name,
            monthlyBudget: budget.monthlyBudget,
            actualSpend: 0,
            variance: 0,
            monthlyData: {
              JAN: 0, FEB: 0, MAR: 0, APR: 0, MAY: 0, JUN: 0, JUL: 0, AUG: 0, SEP: 0, OCT: 0, NOV: 0, DEC: 0
            }
          }));
        });
        setBudgetData(convertedData);
        // Expand all centres by default if not already set
        if (Object.keys(uniqueCentres).length > 0 && expandedCentres.size === 0) {
          setExpandedCentres(new Set(Object.keys(uniqueCentres)));
        }
      } else {
        setBudgetData(sampleBudgetData);
        setCentres([
          { id: '1', name: 'Papamoa Beach', code: 'PB1' },
          { id: '2', name: 'The Boulevard', code: 'TB1' },
          { id: '3', name: 'Livingstone Drive', code: 'LIV' },
        ]);
      }
    } catch (error) {
      console.error('Error loading budget data:', error);
      setBudgetData(sampleBudgetData);
    }
  };

  // Helper function to generate realistic actual spend data
  const generateActualSpend = (monthlyBudget: number): number => {
    // Generate between 70-120% of budget
    const variance = 0.7 + Math.random() * 0.5;
    return Math.round(monthlyBudget * variance * 8); // 8 months of data
  };

  // Helper function to generate monthly data
  const generateMonthlyData = (monthlyBudget: number): { [month: string]: number } => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'];
    const monthlyData: { [month: string]: number } = {};
    
    // Generate data for first 8 months, 0 for remaining
    months.forEach(month => {
      // Add some variance to monthly spending (80-120% of average)
      const variance = 0.8 + Math.random() * 0.4;
      monthlyData[month] = Math.round(monthlyBudget * variance);
    });
    
    // Future months show 0
    ['SEP', 'OCT', 'NOV', 'DEC'].forEach(month => {
      monthlyData[month] = 0;
    });
    
    return monthlyData;
  };

  // Xero Connection Functions
  const connectToXero = () => {
    if (user?.role !== 'MASTER') {
      alert('Only MASTER users can connect to Xero');
      return;
    }

    // Build the Xero OAuth2 URL
    const clientId = process.env.NEXT_PUBLIC_XERO_CLIENT_ID || '7C578E320B63424296114FEEA7272E56';
    const redirectUri = process.env.NEXT_PUBLIC_XERO_REDIRECT_URI || 'http://localhost:3001/api/xero/callback';
    const scope = 'openid profile email accounting.transactions accounting.reports.read accounting.journals.read accounting.settings accounting.contacts.read offline_access';
    const state = Math.random().toString(36).substring(2); // random state for security

    const authUrl = `https://login.xero.com/identity/connect/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${state}`;

    window.location.href = authUrl;
  };

  const disconnectFromXero = async () => {
    if (user?.role !== 'MASTER') {
      alert('Only MASTER users can disconnect from Xero');
      return;
    }

    if (!confirm('Are you sure you want to disconnect from Xero? This will stop live data updates.')) {
      return;
    }

    setIsXeroConnected(false);
    setXeroConnectionStatus('disconnected');
    setLastSyncTime(null);
    
    // Clear stored connection data
    localStorage.removeItem('xero_connected');
    localStorage.removeItem('xero_last_sync');
    localStorage.removeItem('xero_access_token');
    
    console.log('Disconnected from Xero');
    
    // Reload with sample data
    loadBudgetData();
  };

  // Fetch actuals for all centres from backend API and update UI
  const fetchXeroData = async () => {
    if (!isXeroConnected) return;
    try {
      const accessToken = localStorage.getItem('xero_access_token');
      if (!accessToken) throw new Error('No Xero access token found');
      const year = selectedYear;
      const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
      const updatedBudgetData = { ...budgetData };
      for (const centre of centres) {
        const tenantId = CENTRE_TENANT_MAP[centre.id];
        if (!tenantId) continue;
        // Build category->accountCode mapping for this centre from budgets
        const centreBudgets = (budgetData[centre.id] || []);
        // Find the original budget objects to get xeroAccountCode
        const budgetKey = `budgets_${year}`;
        const storedBudgets = localStorage.getItem(budgetKey);
  const categoryAccountCodes: Record<string, string> = {};
        if (storedBudgets) {
          const allBudgets = JSON.parse(storedBudgets);
          for (const b of allBudgets) {
            if (b.centreId === centre.id && b.xeroAccountCode && b.category && b.category.name) {
              categoryAccountCodes[b.category.name] = b.xeroAccountCode;
            }
          }
        }
        // Only fetch if at least one category has an account code
        if (Object.keys(categoryAccountCodes).length === 0) continue;
        const res = await fetch('/api/xero/actuals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, year, tenantId, categoryAccountCodes }),
        });
        const { results } = await res.json();
        if (!results) continue;
        updatedBudgetData[centre.id] = updatedBudgetData[centre.id].map(item => {
          const categoryActuals = results[item.category] || {};
          const monthlyData: { [month: string]: number } = {};
          months.forEach((m, idx) => {
            const dateKey = `${year}-${String(idx+1).padStart(2,'0')}-01`;
            monthlyData[m] = categoryActuals[dateKey] || 0;
          });
          const actualSpend = months.reduce((sum, m) => sum + (monthlyData[m] || 0), 0);
          return {
            ...item,
            actualSpend,
            monthlyData,
            variance: (item.monthlyBudget * 12) - actualSpend,
          };
        });
      }
      setBudgetData(updatedBudgetData);
      setLastSyncTime(new Date());
      console.log('Xero data updated for all centres');
    } catch (error) {
      console.error('Error fetching Xero data:', error);
    }
  };

  // Generate more realistic live data (less random)
  const generateLiveActualSpend = (monthlyBudget: number): number => {
    // Actual spending tends to be 85-110% of budget
    const variance = 0.85 + Math.random() * 0.25;
    return Math.round(monthlyBudget * variance * 8); // 8 months of data
  };

  const generateLiveMonthlyData = (monthlyBudget: number): { [month: string]: number } => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG'];
    const monthlyData: { [month: string]: number } = {};
    
    months.forEach(month => {
      // Live data has less variance (90-110% of average)
      const variance = 0.9 + Math.random() * 0.2;
      monthlyData[month] = Math.round(monthlyBudget * variance);
    });
    
    // Future months show 0
    ['SEP', 'OCT', 'NOV', 'DEC'].forEach(month => {
      monthlyData[month] = 0;
    });
    
    return monthlyData;
  };

  const toggleCentre = (centreId: string) => {
    const newExpanded = new Set(expandedCentres);
    if (newExpanded.has(centreId)) {
      newExpanded.delete(centreId);
    } else {
      newExpanded.add(centreId);
    }
    setExpandedCentres(newExpanded);
  };

  const expandAll = () => {
    setExpandedCentres(new Set(centres.map(c => c.id)));
  };

  const collapseAll = () => {
    setExpandedCentres(new Set());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
    }).format(amount);
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getCentreTotals = (centreId: string) => {
    const centreBudgets = budgetData[centreId] || [];
    const totalBudget = centreBudgets.reduce((sum, item) => sum + item.monthlyBudget, 0);
    const totalActual = centreBudgets.reduce((sum, item) => sum + item.actualSpend, 0);
    const totalVariance = totalBudget - totalActual;
    return { totalBudget, totalActual, totalVariance };
  };

  const hasAnyBudgetData = () => {
    return Object.keys(budgetData).some(centreId => 
      budgetData[centreId] && budgetData[centreId].length > 0
    );
  };

  // Get Xero access and refresh tokens from localStorage (client-side only)
  const [xeroAccessToken, setXeroAccessToken] = useState<string | null>(null);
  const [xeroRefreshToken, setXeroRefreshToken] = useState<string | null>(null);
  useEffect(() => {
    if (user?.role === 'MASTER') {
      setXeroAccessToken(localStorage.getItem('xero_access_token'));
      setXeroRefreshToken(localStorage.getItem('xero_refresh_token'));
    }
  }, [user]);

  return (
    <div className="p-6">
      {/* Header */}
  <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-2xl shadow-xl relative overflow-hidden mb-6">
        {/* Xero Access/Refresh Token Display for MASTER users */}
        {user?.role === 'MASTER' && xeroAccessToken && (
          <div className="mt-4 bg-gray-900/80 text-green-300 p-4 rounded-lg break-all text-xs shadow-inner border border-green-400/30">
            <strong>Xero Access Token:</strong>
            <div className="mt-1 select-all">{xeroAccessToken}</div>
            <div className="mt-1 text-yellow-200">(This token is sensitive. Do not share or expose publicly.)</div>
          </div>
        )}
        {user?.role === 'MASTER' && xeroRefreshToken && (
          <div className="mt-4 bg-gray-900/80 text-blue-300 p-4 rounded-lg break-all text-xs shadow-inner border border-blue-400/30">
            <strong>Xero Refresh Token:</strong>
            <div className="mt-1 select-all">{xeroRefreshToken}</div>
            <div className="mt-1 text-yellow-200">(This token is sensitive. Do not share or expose publicly.)</div>
          </div>
        )}
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Xero Integration - 2025</h1>
          <p className="text-blue-100">Budget vs Actuals - Selected expense categories. Budget set in admin, actuals updated daily from Xero.</p>
          <div className="mt-3 flex items-center gap-4 flex-wrap">
            <span className="bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white shadow-lg border border-white/20">
              📊 Data Source: {hasAnyBudgetData() ? 'Budget Management System' : 'Demo Data'}
            </span>
            
            {/* Xero Connection Status */}
            <span className={`backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white shadow-lg border border-white/20 ${
              isXeroConnected ? 'bg-green-600/80' : 'bg-orange-600/80'
            }`}>
              {isXeroConnected ? '🔗 Xero: Connected' : '⚠️ Xero: Disconnected'}
            </span>
            
            {lastSyncTime && (
              <span className="bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white shadow-lg border border-white/20">
                🕒 Last Sync: {lastSyncTime.toLocaleTimeString()}
              </span>
            )}
          </div>
          
          {/* Xero Connection Controls - Only for MASTER users */}
          {user?.role === 'MASTER' && (
            <div className="mt-4 flex gap-3">
              {!isXeroConnected ? (
                <button
                  onClick={connectToXero}
                  disabled={xeroConnectionStatus === 'connecting'}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border border-white/30 shadow-lg"
                >
                  {xeroConnectionStatus === 'connecting' ? '🔄 Connecting...' : '🔗 Connect to Xero'}
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={fetchXeroData}
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all duration-300 border border-white/30 shadow-lg"
                  >
                    🔄 Sync Now
                  </button>
                  <button
                    onClick={disconnectFromXero}
                    className="bg-red-500/20 hover:bg-red-500/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition-all duration-300 border border-white/30 shadow-lg"
                  >
                    🔌 Disconnect
                  </button>
                </div>
              )}
            </div>
          )}
          
          {/* Connection Status Messages */}
          {xeroConnectionStatus === 'error' && (
            <div className="mt-3 bg-red-500/20 backdrop-blur-sm border border-red-300/30 text-white px-4 py-2 rounded-lg">
              ❌ Failed to connect to Xero. Please try again.
            </div>
          )}
          
          {!isXeroConnected && user?.role !== 'MASTER' && (
            <div className="mt-3 bg-orange-500/20 backdrop-blur-sm border border-orange-300/30 text-white px-4 py-2 rounded-lg">
              ℹ️ Only MASTER users can connect to Xero for live data.
            </div>
          )}
        </div>
      </div>

      {/* Expand/Collapse Controls */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Centre Budget Analysis</h2>
        <div className="space-x-2">
          <button
            onClick={expandAll}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Centre Accordions */}
      {!hasAnyBudgetData() ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <div className="bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-200 shadow-lg">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Budget Data Found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Set up your budgets in the Budget Management page first, then they&apos;ll appear here for comparison with Xero actuals.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => window.location.href = '/budget-management'}
              className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-2xl hover:from-blue-700 hover:to-teal-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3"
            >
              <span className="text-lg">💰</span>
              Go to Budget Management
            </button>
            <button
              onClick={loadBudgetData}
              className="bg-gray-600 text-white px-8 py-4 rounded-2xl hover:bg-gray-700 transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3"
            >
              <span className="text-lg">🔄</span>
              Refresh Data
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {centres.map((centre) => {
            const isExpanded = expandedCentres.has(centre.id);
            const centreBudgets = budgetData[centre.id] || [];
            const { totalBudget, totalActual, totalVariance } = getCentreTotals(centre.id);

            // Skip centres with no budget data
            if (centreBudgets.length === 0) return null;

            return (
              <div key={centre.id} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                {/* Accordion Header */}
                <button
                  onClick={() => toggleCentre(centre.id)}
                  className="w-full bg-gradient-to-r from-blue-500 to-teal-500 p-6 text-left hover:from-blue-600 hover:to-teal-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="text-xl font-bold text-white drop-shadow-sm">{centre.name}</h3>
                        <p className="text-teal-100">Code: {centre.code}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="text-sm text-teal-100">Total Budget</div>
                        <div className="text-lg font-bold text-white">{formatCurrency(totalBudget)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-teal-100">Actual YTD</div>
                        <div className="text-lg font-bold text-white">{formatCurrency(totalActual)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-teal-100">Variance</div>
                        <div className={`text-lg font-bold ${totalVariance >= 0 ? 'text-green-100' : 'text-red-200'}`}>
                          {formatCurrency(totalVariance)}
                        </div>
                      </div>
                      <div className="text-white">
                        {isExpanded ? (
                          <ChevronUpIcon className="h-6 w-6" />
                        ) : (
                          <ChevronDownIcon className="h-6 w-6" />
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monthly Budget
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actual YTD
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Variance
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            JAN
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            FEB
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            MAR
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            APR
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            MAY
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            JUN
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            JUL
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            AUG
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            SEP
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            OCT
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            NOV
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            DEC
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {centreBudgets.map((item, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {item.category}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">
                              {formatCurrency(item.monthlyBudget)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {formatCurrency(item.actualSpend)}
                            </td>
                            <td className={`px-4 py-4 whitespace-nowrap text-sm text-right font-semibold ${getVarianceColor(item.variance)}`}>
                              {formatCurrency(item.variance)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                              {item.monthlyData['JAN'] ? formatCurrency(item.monthlyData['JAN']) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                              {item.monthlyData['FEB'] ? formatCurrency(item.monthlyData['FEB']) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                              {item.monthlyData['MAR'] ? formatCurrency(item.monthlyData['MAR']) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                              {item.monthlyData['APR'] ? formatCurrency(item.monthlyData['APR']) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                              {item.monthlyData['MAY'] ? formatCurrency(item.monthlyData['MAY']) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                              {item.monthlyData['JUN'] ? formatCurrency(item.monthlyData['JUN']) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                              {item.monthlyData['JUL'] ? formatCurrency(item.monthlyData['JUL']) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                              {item.monthlyData['AUG'] ? formatCurrency(item.monthlyData['AUG']) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                              {item.monthlyData['SEP'] ? formatCurrency(item.monthlyData['SEP']) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                              {item.monthlyData['OCT'] ? formatCurrency(item.monthlyData['OCT']) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                              {item.monthlyData['NOV'] ? formatCurrency(item.monthlyData['NOV']) : '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                              {item.monthlyData['DEC'] ? formatCurrency(item.monthlyData['DEC']) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr className="font-semibold">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            Centre Total
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-right">
                            {formatCurrency(totalBudget)}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 text-right">
                            {formatCurrency(totalActual)}
                          </td>
                          <td className={`px-4 py-4 text-sm text-right ${getVarianceColor(totalVariance)}`}>
                            {formatCurrency(totalVariance)}
                          </td>
                          <td colSpan={12} className="px-4 py-4 text-sm text-gray-500 text-center">
                            Total variance: {totalVariance >= 0 ? 'Under budget' : 'Over budget'}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Demo Notice */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 border border-blue-200/50 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start">
          <div className="text-blue-600 mr-4 bg-blue-100 rounded-lg p-2">💡</div>
          <div>
            <h3 className="font-bold text-blue-900 text-lg mb-2">
              Xero Integration - Live Data
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This page shows budgets from your Budget Management system. {isXeroConnected ? 
                'Live spending data is being pulled from your Xero account.' : 
                'Currently showing simulated data - connect to Xero above for live spending data.'}
              </p>
              <div className="mt-3 space-y-2">
                <p><strong>📊 Budget Data:</strong> Set in Budget Management page with Xero account codes</p>
                <p><strong>💰 Actual Spending:</strong> {isXeroConnected ? 
                  'Live data from Xero, updated automatically' : 
                  'Simulated data until Xero connection is established'}</p>
                <p><strong>📈 Variance Analysis:</strong> Automatic calculation of budget vs actual spending</p>
                {user?.role === 'MASTER' && !isXeroConnected && (
                  <p><strong>🔗 Next Step:</strong> Click &quot;Connect to Xero&quot; above to enable live data</p>
                )}
                {user?.role !== 'MASTER' && !isXeroConnected && (
                  <p><strong>ℹ️ Note:</strong> Contact your MASTER user to connect Xero for live data</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
