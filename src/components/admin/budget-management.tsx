'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Save, X, Calculator } from 'lucide-react';

interface Centre {
  id: string;
  name: string;
  code: string;
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
  xeroAccountCode?: string; // Xero chart of account number
  centre: Centre;
  category: BudgetCategory;
}

interface BudgetManagementProps {
  onClose?: () => void;
}

export default function BudgetManagement({ onClose }: BudgetManagementProps) {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [budgets, setBudgets] = useState<CentreBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editingAccountCode, setEditingAccountCode] = useState<string | null>(null);
  const [editAccountValue, setEditAccountValue] = useState<string>('');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });

  // Load initial data
  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Start with fallback data
      const fallbackCentres = [
        { id: '1', name: 'Papamoa Beach', code: 'PB1' },
        { id: '2', name: 'The Boulevard', code: 'TB1' },
        { id: '3', name: 'Livingstone Drive', code: 'LIV' },
      ];
      
      const fallbackCategories = [
        { id: 'art-messy-play', name: 'Art and Messy Play', description: 'Art supplies, craft materials' },
        { id: 'food-costs', name: 'Food Costs', description: 'Food and beverage purchases' },
        { id: 'cleaning-supplies', name: 'Cleaning Supplies', description: 'Cleaning products' },
        { id: 'nappies-wipes', name: 'Nappies and Wipes', description: 'Hygiene supplies' },
        { id: 'centre-purchases', name: 'Centre Purchases', description: 'General centre equipment and supplies' },
        { id: 'educational-resources', name: 'Educational Resources', description: 'Books, educational toys, learning materials' },
      ];

      // Try to load centres from API first
      try {
        const centresResponse = await fetch('/api/centres');
        if (centresResponse.ok) {
          const centresData = await centresResponse.json();
          setCentres(Array.isArray(centresData) ? centresData : fallbackCentres);
        } else {
          setCentres(fallbackCentres);
        }
      } catch {
        setCentres(fallbackCentres);
      }

      // Try to load categories from API, but merge with any custom ones from localStorage
      try {
        const categoriesResponse = await fetch('/api/budget/categories');
  const apiCategories = [];
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          apiCategories = Array.isArray(categoriesData) ? categoriesData : [];
        }
        
        // Load any custom categories from localStorage
        const customCategories = localStorage.getItem('budget_categories');
        const localCategories = customCategories ? JSON.parse(customCategories) : [];
        
        // Combine API categories with local custom ones, preferring local if there are any
        const allCategories = localCategories.length > 0 ? localCategories : (apiCategories.length > 0 ? apiCategories : fallbackCategories);
        setCategories(allCategories);
      } catch {
        // Load custom categories from localStorage or use fallback
        const customCategories = localStorage.getItem('budget_categories');
        const allCategories = customCategories ? JSON.parse(customCategories) : fallbackCategories;
        setCategories(allCategories);
      }

      // Load existing budgets from localStorage
      const budgetKey = `budgets_${selectedYear}`;
      const storedBudgets = localStorage.getItem(budgetKey);
      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets));
      } else {
        setBudgets([]);
      }

    } catch (error) {
      console.error('Error loading budget data:', error);
      // Final fallback
      const fallbackCentres = [
        { id: '1', name: 'Papamoa Beach', code: 'PB1' },
        { id: '2', name: 'The Boulevard', code: 'TB1' },
        { id: '3', name: 'Livingstone Drive', code: 'LIV' },
      ];
      const fallbackCategories = [
        { id: 'art-messy-play', name: 'Art and Messy Play', description: 'Art supplies, craft materials' },
        { id: 'food-costs', name: 'Food Costs', description: 'Food and beverage purchases' },
        { id: 'cleaning-supplies', name: 'Cleaning Supplies', description: 'Cleaning products' },
        { id: 'nappies-wipes', name: 'Nappies and Wipes', description: 'Hygiene supplies' },
      ];
      setCentres(fallbackCentres);
      setCategories(fallbackCategories);
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const getBudgetForCentreCategory = (centreId: string, categoryId: string): CentreBudget | undefined => {
    return budgets.find(b => b.centreId === centreId && b.categoryId === categoryId);
  };

  const startEdit = (centreId: string, categoryId: string) => {
    const budget = getBudgetForCentreCategory(centreId, categoryId);
    const key = `${centreId}-${categoryId}`;
    setEditingBudget(key);
    setEditValue(budget?.monthlyBudget?.toString() || '0');
  };

  const cancelEdit = () => {
    setEditingBudget(null);
    setEditValue('');
  };

  const startEditAccountCode = (centreId: string, categoryId: string) => {
    const budget = getBudgetForCentreCategory(centreId, categoryId);
    const key = `${centreId}-${categoryId}`;
    setEditingAccountCode(key);
    setEditAccountValue(budget?.xeroAccountCode || '');
  };

  const cancelEditAccountCode = () => {
    setEditingAccountCode(null);
    setEditAccountValue('');
  };

  const saveAccountCode = async (centreId: string, categoryId: string) => {
    try {
      setSaving(true);
      const accountCode = editAccountValue.trim();

      // Find existing budget or create new one
      const existingBudgetIndex = budgets.findIndex(
        b => b.centreId === centreId && b.categoryId === categoryId
      );

      const centre = centres.find(c => c.id === centreId);
      const category = categories.find(c => c.id === categoryId);

      if (!centre || !category) {
        alert('Invalid centre or category');
        return;
      }

      const existingBudget = budgets.find(b => b.centreId === centreId && b.categoryId === categoryId);

      const updatedBudget: CentreBudget = {
        id: `${centreId}-${categoryId}`,
        centreId,
        categoryId,
        monthlyBudget: existingBudget?.monthlyBudget || 0,
        xeroAccountCode: accountCode,
        centre,
        category
      };

      const newBudgets = [...budgets];
      if (existingBudgetIndex >= 0) {
        newBudgets[existingBudgetIndex] = updatedBudget;
      } else {
        newBudgets.push(updatedBudget);
      }

      setBudgets(newBudgets);

      // Save to localStorage
      const budgetKey = `budgets_${selectedYear}`;
      localStorage.setItem(budgetKey, JSON.stringify(newBudgets));

      setEditingAccountCode(null);
      setEditAccountValue('');

      // Show success message
      alert(`✅ Xero account code saved!\n${centre.name} - ${category.name}: ${accountCode || 'No code set'}`);

    } catch (error) {
      console.error('Error saving account code:', error);
      alert('❌ Error saving account code');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = async () => {
    try {
      if (!newCategory.name.trim()) {
        alert('Please enter a category name');
        return;
      }

      setSaving(true);

      // Create new category
      const categoryId = newCategory.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const category: BudgetCategory = {
        id: categoryId,
        name: newCategory.name.trim(),
        description: newCategory.description.trim() || undefined
      };

      // Check if category already exists
      if (categories.find(c => c.id === categoryId)) {
        alert('A category with this name already exists');
        return;
      }

      const updatedCategories = [...categories, category];
      setCategories(updatedCategories);

      // Save to localStorage (in production, this would be an API call)
      localStorage.setItem('budget_categories', JSON.stringify(updatedCategories));

      setNewCategory({ name: '', description: '' });
      setShowAddCategory(false);

      alert(`✅ Category "${category.name}" added successfully!`);

    } catch (error) {
      console.error('Error adding category:', error);
      alert('❌ Error adding category');
    } finally {
      setSaving(false);
    }
  };

  const saveBudget = async (centreId: string, categoryId: string) => {
    try {
      setSaving(true);
      const monthlyBudget = parseFloat(editValue) || 0;

      // Find existing budget or create new one
      const existingBudgetIndex = budgets.findIndex(
        b => b.centreId === centreId && b.categoryId === categoryId
      );

      const centre = centres.find(c => c.id === centreId);
      const category = categories.find(c => c.id === categoryId);

      if (!centre || !category) {
        alert('Invalid centre or category');
        return;
      }

      const existingBudget = budgets.find(b => b.centreId === centreId && b.categoryId === categoryId);

      const updatedBudget: CentreBudget = {
        id: `${centreId}-${categoryId}`,
        centreId,
        categoryId,
        monthlyBudget,
        xeroAccountCode: existingBudget?.xeroAccountCode || '', // Preserve existing account code
        centre,
        category
      };

  const newBudgets = [...budgets];
      if (existingBudgetIndex >= 0) {
        newBudgets[existingBudgetIndex] = updatedBudget;
      } else {
        newBudgets.push(updatedBudget);
      }

      setBudgets(newBudgets);

      // Save to localStorage
      const budgetKey = `budgets_${selectedYear}`;
      localStorage.setItem(budgetKey, JSON.stringify(newBudgets));

      setEditingBudget(null);
      setEditValue('');

      // Show success message
      alert(`✅ Budget saved successfully!\n${centre.name} - ${category.name}: ${formatCurrency(monthlyBudget)}/month`);

    } catch (error) {
      console.error('Error saving budget:', error);
      alert('Error saving budget');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateTotals = () => {
    const totals = centres.map(centre => {
      const centreBudgets = budgets.filter(b => b.centreId === centre.id);
      const total = centreBudgets.reduce((sum, budget) => sum + budget.monthlyBudget, 0);
      return { centre, total };
    });

    const grandTotal = totals.reduce((sum, item) => sum + item.total, 0);
    return { totals, grandTotal };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading budget data...</span>
      </div>
    );
  }

  const { totals, grandTotal } = calculateTotals();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-white mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-white">Budget Management</h2>
              <p className="text-green-100">Set monthly budgets for each centre and category</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {/* Year Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Budget Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>

        {/* Add Category Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddCategory(true)}
            className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Category
          </button>
        </div>

        {/* Budget Grid */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                {centres.map((centre) => (
                  <th key={centre.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {centre.name}
                    <br />
                    <span className="text-gray-400 normal-case">({centre.code})</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      {category.description && (
                        <div className="text-sm text-gray-500">{category.description}</div>
                      )}
                    </div>
                  </td>
                  {centres.map((centre) => {
                    const budget = getBudgetForCentreCategory(centre.id, category.id);
                    const budgetEditKey = `${centre.id}-${category.id}`;
                    const accountEditKey = `${centre.id}-${category.id}`;
                    const isBudgetEditing = editingBudget === budgetEditKey;
                    const isAccountEditing = editingAccountCode === accountEditKey;

                    return (
                      <td key={`${centre.id}-${category.id}`} className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                          {/* Budget Amount */}
                          {isBudgetEditing ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="0"
                                min="0"
                                step="0.01"
                              />
                              <button
                                onClick={() => saveBudget(centre.id, category.id)}
                                disabled={saving}
                                className="text-green-600 hover:text-green-800 disabled:opacity-50"
                              >
                                <Save className="h-4 w-4" />
                              </button>
                              <button
                                onClick={cancelEdit}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-semibold text-gray-900">
                                {budget ? formatCurrency(budget.monthlyBudget) : formatCurrency(0)}
                              </span>
                              <button
                                onClick={() => startEdit(centre.id, category.id)}
                                className="text-gray-400 hover:text-green-600"
                                title="Edit budget amount"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          )}

                          {/* Xero Account Code */}
                          {isAccountEditing ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editAccountValue}
                                onChange={(e) => setEditAccountValue(e.target.value)}
                                className="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="401"
                                maxLength={10}
                              />
                              <button
                                onClick={() => saveAccountCode(centre.id, category.id)}
                                disabled={saving}
                                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                              >
                                <Save className="h-3 w-3" />
                              </button>
                              <button
                                onClick={cancelEditAccountCode}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                {budget?.xeroAccountCode ? `Xero: ${budget.xeroAccountCode}` : 'No Xero code'}
                              </span>
                              <button
                                onClick={() => startEditAccountCode(centre.id, category.id)}
                                className="text-gray-400 hover:text-blue-600"
                                title="Edit Xero account code"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {/* Totals Row */}
              <tr className="bg-gray-100 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    <Calculator className="h-4 w-4 mr-2" />
                    Monthly Totals
                  </div>
                </td>
                {totals.map(({ centre, total }) => (
                  <td key={centre.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(total)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Grand Total */}
        <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-lg font-semibold text-green-900">
                Total Monthly Budget ({selectedYear})
              </span>
            </div>
            <span className="text-2xl font-bold text-green-900">
              {formatCurrency(grandTotal)}
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Annual Budget: {formatCurrency(grandTotal * 12)}
          </p>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">💡 How to use:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click the edit icon next to any budget amount to modify it</li>
            <li>• Click the edit icon next to &quot;Xero code&quot; to set the chart of account number for each centre/category</li>
            <li>• Use &quot;Add New Category&quot; to create custom budget categories</li>
            <li>• Xero account codes help link budgets to actual spending when integrating with Xero</li>
            <li>• Changes are saved immediately when you click the save icon</li>
            <li>• These budgets will be used in the Xero page for variance reporting</li>
          </ul>
        </div>

        {/* Add Category Modal */}
        {showAddCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Budget Category</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Educational Resources"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of what this category covers"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddCategory(false);
                    setNewCategory({ name: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addCategory}
                  disabled={saving || !newCategory.name.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md hover:from-blue-600 hover:to-teal-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                >
                  {saving ? 'Adding...' : 'Add Category'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
