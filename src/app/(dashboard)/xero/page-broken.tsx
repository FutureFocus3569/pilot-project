"use client";

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

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

// Sample data - this will come from API in final version
const sampleCentres: Centre[] = [
  { id: '1', name: 'Papamoa Beach', code: 'PB1' },
  { id: '2', name: 'The Boulevard', code: 'TB1' },
  { id: '3', name: 'Livingstone Drive', code: 'LIV' },
];

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
    {
      category: 'Cleaning Supplies',
      monthlyBudget: 1000,
      actualSpend: 1220,
      variance: -220,
      monthlyData: { 'JAN': 118, 'FEB': 120, 'MAR': 115, 'APR': 122, 'MAY': 119, 'JUN': 117, 'JUL': 116, 'AUG': 121, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
    {
      category: 'Food Costs',
      monthlyBudget: 3750,
      actualSpend: 2630,
      variance: 1120,
      monthlyData: { 'JAN': 210, 'FEB': 220, 'MAR': 215, 'APR': 225, 'MAY': 230, 'JUN': 210, 'JUL': 220, 'AUG': 225, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
    {
      category: 'Nappies and Wipes',
      monthlyBudget: 800,
      actualSpend: 755,
      variance: 45,
      monthlyData: { 'JAN': 78, 'FEB': 80, 'MAR': 79, 'APR': 82, 'MAY': 81, 'JUN': 79, 'JUL': 78, 'AUG': 81, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
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
    {
      category: 'Cleaning Supplies',
      monthlyBudget: 900,
      actualSpend: 892,
      variance: 8,
      monthlyData: { 'JAN': 108, 'FEB': 115, 'MAR': 110, 'APR': 118, 'MAY': 112, 'JUN': 105, 'JUL': 108, 'AUG': 116, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
    {
      category: 'Art and Messy Play',
      monthlyBudget: 250,
      actualSpend: 264,
      variance: -14,
      monthlyData: { 'JAN': 32, 'FEB': 35, 'MAR': 33, 'APR': 36, 'MAY': 34, 'JUN': 31, 'JUL': 32, 'AUG': 35, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
  ],
  '3': [ // Livingstone Drive
    {
      category: 'Art and Messy Play',
      monthlyBudget: 280,
      actualSpend: 295,
      variance: -15,
      monthlyData: { 'JAN': 28, 'FEB': 32, 'MAR': 30, 'APR': 35, 'MAY': 33, 'JUN': 29, 'JUL': 31, 'AUG': 34, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
    {
      category: 'Food Costs',
      monthlyBudget: 3100,
      actualSpend: 2890,
      variance: 210,
      monthlyData: { 'JAN': 185, 'FEB': 195, 'MAR': 190, 'APR': 200, 'MAY': 205, 'JUN': 185, 'JUL': 195, 'AUG': 200, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
    {
      category: 'Centre Purchases',
      monthlyBudget: 450,
      actualSpend: 520,
      variance: -70,
      monthlyData: { 'JAN': 40, 'FEB': 45, 'MAR': 43, 'APR': 48, 'MAY': 44, 'JUN': 42, 'JUL': 41, 'AUG': 46, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
    {
      category: 'Cleaning Supplies',
      monthlyBudget: 850,
      actualSpend: 815,
      variance: 35,
      monthlyData: { 'JAN': 95, 'FEB': 102, 'MAR': 98, 'APR': 105, 'MAY': 99, 'JUN': 96, 'JUL': 98, 'AUG': 103, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
    {
      category: 'Educational Resources',
      monthlyBudget: 400,
      actualSpend: 385,
      variance: 15,
      monthlyData: { 'JAN': 35, 'FEB': 42, 'MAR': 38, 'APR': 45, 'MAY': 40, 'JUN': 36, 'JUL': 39, 'AUG': 43, 'SEP': 0, 'OCT': 0, 'NOV': 0, 'DEC': 0 }
    },
  ]
};

export default function XeroPage() {
  const [expandedCentres, setExpandedCentres] = useState<Set<string>>(new Set(['1'])); // Start with first centre expanded
  const [centres, setCentres] = useState<Centre[]>(sampleCentres);
  const [budgetData, setBudgetData] = useState<{ [centreId: string]: BudgetData[] }>({});
  const [selectedYear] = useState(2025);

  // Load budget data from localStorage
  useEffect(() => {
    loadBudgetData();
  }, [selectedYear]);

  const loadBudgetData = () => {
    try {
      // Load saved budgets from localStorage
      const budgetKey = `budgets_${selectedYear}`;
      const storedBudgets = localStorage.getItem(budgetKey);
      
      if (storedBudgets) {
        const budgets: CentreBudget[] = JSON.parse(storedBudgets);
        
        // Convert budget format to match Xero page expectations
        const convertedData: { [centreId: string]: BudgetData[] } = {};
        
        centres.forEach(centre => {
          const centreBudgets = budgets.filter(b => b.centreId === centre.id);
          
          convertedData[centre.id] = centreBudgets.map(budget => ({
            category: budget.category.name,
            monthlyBudget: budget.monthlyBudget,
            actualSpend: generateActualSpend(budget.monthlyBudget), // Generate sample actuals
            variance: 0, // Will be calculated
            monthlyData: generateMonthlyData(budget.monthlyBudget) // Generate sample monthly data
          }));
          
          // Calculate variances
          convertedData[centre.id].forEach(item => {
            item.variance = item.monthlyBudget - item.actualSpend;
          });
        });
        
        setBudgetData(convertedData);
      } else {
        // Fallback to sample data if no budgets saved
        setBudgetData(sampleBudgetData);
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
    setExpandedCentres(new Set(sampleCentres.map(c => c.id)));
  };

  const collapseAll = () => {
    setExpandedCentres(new Set());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-2xl shadow-xl relative overflow-hidden mb-6">
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Xero Integration - 2025</h1>
          <p className="text-blue-100">Budget vs Actuals - Selected expense categories. Budget set in admin, actuals updated daily from Xero.</p>
          <div className="mt-3 flex items-center gap-4">
            <span className="bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white shadow-lg border border-white/20">
              📊 Data Source: {Object.keys(budgetData).length > 0 ? 'Budget Management System' : 'Demo Data'}
            </span>
            <button
              onClick={loadBudgetData}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white shadow-lg border border-white/20 transition-all duration-200"
            >
              🔄 Refresh Data
            </button>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Controls */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Centre Budget Analysis</h2>
        <div className="space-x-2">
          <button
            onClick={expandAll}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium"
          >
            Expand All
          </button>
          <button
            onClick={collapseAll}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm font-medium"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Centre Accordions */}
      {Object.keys(budgetData).length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
          <div className="bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-200 shadow-lg">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">No Budget Data Found</h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Set up your budgets in the Budget Management page first, then they'll appear here for comparison with Xero actuals.
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

          return (
            <div key={centre.id} className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Accordion Header */}
              <button
                onClick={() => toggleCentre(centre.id)}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-400 p-6 text-left hover:from-teal-600 hover:to-cyan-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {centre.name}
                      </h2>
                      <p className="text-teal-100 text-sm">
                        Budget: {formatCurrency(totalBudget)} • Actual: {formatCurrency(totalActual)} • 
                        <span className={totalVariance >= 0 ? 'text-green-200' : 'text-red-200'}>
                          {' '}Variance: {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {/* Quick Status Indicator */}
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      totalVariance >= 0 
                        ? 'bg-green-200 text-green-800' 
                        : 'bg-red-200 text-red-800'
                    }`}>
                      {totalVariance >= 0 ? 'Under Budget' : 'Over Budget'}
                    </div>
                    
                    {/* Expand/Collapse Icon */}
                    <div className="bg-white/20 rounded-lg p-2">
                      {isExpanded ? (
                        <ChevronUpIcon className="h-5 w-5 text-white" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-white" />
                      )}
                    </div>
                  </div>
                </div>
              </button>

              {/* Accordion Content */}
              {isExpanded && (
                <div className="bg-white">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monthly Budget
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
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actual Spend
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Variance
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
                              {item.monthlyData.JAN}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.monthlyData.FEB}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.monthlyData.MAR}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.monthlyData.APR}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.monthlyData.MAY}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.monthlyData.JUN}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.monthlyData.JUL}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.monthlyData.AUG}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.monthlyData.SEP || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.monthlyData.OCT || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.monthlyData.NOV || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                              {item.monthlyData.DEC || '-'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-semibold bg-blue-50">
                              {formatCurrency(item.actualSpend)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${getVarianceColor(item.variance)}`}>
                              {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <tr>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            Centre Total
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                            {formatCurrency(totalBudget)}
                          </td>
                          <td colSpan={12} className="px-4 py-4"></td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right bg-blue-100">
                            {formatCurrency(totalActual)}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right ${getVarianceColor(totalVariance)}`}>
                            {totalVariance >= 0 ? '+' : ''}{formatCurrency(totalVariance)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                  
                  <div className="px-6 py-4 bg-gray-50 border-t">
                    <p className="text-xs text-gray-500">
                      * Variance = Budget - Actual. Positive values indicate underspend, negative values indicate overspend.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      2025 Budget data synced from Xero • Last updated: Today at 8:00 AM
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

      {/* Demo Notice */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 border border-blue-200/50 rounded-2xl p-6 shadow-lg">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              2025 Demo Data
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This page now shows budgets from your Budget Management system with simulated actuals data. 
                Once connected to Xero, the "Actual YTD" and monthly columns will show real spending data from your Xero account. 
                Sep-Dec show as blank until data is available.
              </p>
              <p className="mt-2 font-medium">
                💡 Update budgets in the Budget Management page and click "Refresh Data" to see changes here.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <div className="mt-6 bg-gradient-to-br from-blue-50 via-teal-50 to-blue-100 border border-blue-200/50 rounded-2xl p-6 shadow-lg">
        <div className="flex items-start">
          <div className="text-blue-600 mr-4 bg-blue-100 rounded-lg p-2">💡</div>
          <div>
            <h3 className="font-bold text-blue-900 text-lg mb-2">
              2025 Demo Data
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This page now shows budgets from your Budget Management system with simulated actuals data. 
                Once connected to Xero, the "Actual YTD" and monthly columns will show real spending data from your Xero account. 
                Sep-Dec show as blank until data is available.
              </p>
              <p className="mt-2 font-medium">
                💡 Update budgets in the Budget Management page and click "Refresh Data" to see changes here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
