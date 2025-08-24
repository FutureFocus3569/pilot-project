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
  const [expandedCentres, setExpandedCentres] = useState<Set<string>>(new Set(['1'])); // Start with first centre expanded
  const [centres, setCentres] = useState<Centre[]>(sampleCentres);
  const [budgetData, setBudgetData] = useState<{ [centreId: string]: BudgetData[] }>(sampleBudgetData);
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-2xl shadow-xl relative overflow-hidden mb-6">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Xero Integration - 2025</h1>
          <p className="text-blue-100">Budget vs Actuals - Selected expense categories. Budget set in admin, actuals updated daily from Xero.</p>
          <div className="mt-3 flex items-center gap-4">
            <span className="bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm text-white shadow-lg border border-white/20">
              📊 Data Source: {hasAnyBudgetData() ? 'Budget Management System' : 'Demo Data'}
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
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-400 p-6 text-left hover:from-teal-600 hover:to-cyan-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-inset"
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
              2025 Demo Data
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This page now shows budgets from your Budget Management system with simulated actuals data. 
                Once connected to Xero, the &quot;Actual YTD&quot; and monthly columns will show real spending data from your Xero account. 
                Sep-Dec show as blank until data is available.
              </p>
              <p className="mt-2 font-medium">
                💡 Update budgets in the Budget Management page and click &quot;Refresh Data&quot; to see changes here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
