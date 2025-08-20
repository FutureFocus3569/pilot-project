'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Plus, Edit, Save, X, Calculator, Trash2 } from 'lucide-react';

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

export default function BudgetPage() {
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
  const [showEditCategory, setShowEditCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<BudgetCategory | null>(null);
  const [editCategoryData, setEditCategoryData] = useState({ name: '', description: '' });

  // Load initial data
  useEffect(() => {
    loadData();
  }, [selectedYear]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Use fallback data directly - no API calls
      const fallbackCentres = [
        { id: '1', name: 'Papamoa Beach', code: 'PB1' },
        { id: '2', name: 'The Boulevard', code: 'TB1' },
        { id: '3', name: 'The Bach', code: 'BCH' },
        { id: '4', name: 'Terrace Views', code: 'TER' },
        { id: '5', name: 'Livingstone Drive', code: 'LIV' },
        { id: '6', name: 'West Dune', code: 'WD1' },
      ];
      
      const fallbackCategories = [
        { id: 'art-messy-play', name: 'Art and Messy Play', description: 'Art supplies, craft materials' },
        { id: 'food-costs', name: 'Food Costs', description: 'Food and beverage purchases' },
        { id: 'cleaning-supplies', name: 'Cleaning Supplies', description: 'Cleaning products' },
        { id: 'nappies-wipes', name: 'Nappies and Wipes', description: 'Hygiene supplies' },
        { id: 'centre-purchases', name: 'Centre Purchases', description: 'General centre equipment and supplies' },
        { id: 'educational-resources', name: 'Educational Resources', description: 'Books, educational toys, learning materials' },
      ];

      setCentres(fallbackCentres);
      
      // Load custom categories from localStorage or use fallback
      const customCategories = localStorage.getItem('budget_categories');
      const allCategories = customCategories ? JSON.parse(customCategories) : fallbackCategories;
      setCategories(allCategories);

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

  const saveBudget = async (centreId: string, categoryId: string) => {
    try {
      setSaving(true);
      const amount = parseFloat(editValue) || 0;
      
      // Find centre and category
      const centre = centres.find(c => c.id === centreId);
      const category = categories.find(c => c.id === categoryId);
      
      if (!centre || !category) return;

      // Update budgets array
      const newBudgets = [...budgets];
      const existingIndex = newBudgets.findIndex(b => b.centreId === centreId && b.categoryId === categoryId);
      
      if (existingIndex >= 0) {
        newBudgets[existingIndex] = {
          ...newBudgets[existingIndex],
          monthlyBudget: amount
        };
      } else {
        newBudgets.push({
          id: `${centreId}-${categoryId}`,
          centreId,
          categoryId,
          monthlyBudget: amount,
          centre,
          category
        });
      }
      
      setBudgets(newBudgets);
      
      // Save to localStorage
      const budgetKey = `budgets_${selectedYear}`;
      localStorage.setItem(budgetKey, JSON.stringify(newBudgets));
      
      setEditingBudget(null);
      setEditValue('');
    } catch (error) {
      console.error('Error saving budget:', error);
    } finally {
      setSaving(false);
    }
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
      
      // Find centre and category
      const centre = centres.find(c => c.id === centreId);
      const category = categories.find(c => c.id === categoryId);
      
      if (!centre || !category) return;

      // Update budgets array
      const newBudgets = [...budgets];
      const existingIndex = newBudgets.findIndex(b => b.centreId === centreId && b.categoryId === categoryId);
      
      if (existingIndex >= 0) {
        newBudgets[existingIndex] = {
          ...newBudgets[existingIndex],
          xeroAccountCode: editAccountValue
        };
      } else {
        newBudgets.push({
          id: `${centreId}-${categoryId}`,
          centreId,
          categoryId,
          monthlyBudget: 0,
          xeroAccountCode: editAccountValue,
          centre,
          category
        });
      }
      
      setBudgets(newBudgets);
      
      // Save to localStorage
      const budgetKey = `budgets_${selectedYear}`;
      localStorage.setItem(budgetKey, JSON.stringify(newBudgets));
      
      setEditingAccountCode(null);
      setEditAccountValue('');
    } catch (error) {
      console.error('Error saving account code:', error);
    } finally {
      setSaving(false);
    }
  };

  const addCategory = async () => {
    if (!newCategory.name.trim()) return;
    
    try {
      const newCat: BudgetCategory = {
        id: `custom-${Date.now()}`,
        name: newCategory.name.trim(),
        description: newCategory.description.trim()
      };
      
      const updatedCategories = [...categories, newCat];
      setCategories(updatedCategories);
      
      // Save custom categories to localStorage
      localStorage.setItem('budget_categories', JSON.stringify(updatedCategories));
      
      setNewCategory({ name: '', description: '' });
      setShowAddCategory(false);
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category? This will also remove all associated budgets.')) {
      return;
    }
    
    try {
      // Remove category from categories array
      const updatedCategories = categories.filter(cat => cat.id !== categoryId);
      setCategories(updatedCategories);
      
      // Remove all budgets associated with this category
      const updatedBudgets = budgets.filter(budget => budget.categoryId !== categoryId);
      setBudgets(updatedBudgets);
      
      // Save updated data to localStorage
      localStorage.setItem('budget_categories', JSON.stringify(updatedCategories));
      const budgetKey = `budgets_${selectedYear}`;
      localStorage.setItem(budgetKey, JSON.stringify(updatedBudgets));
      
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const startEditCategory = (category: BudgetCategory) => {
    setEditingCategory(category);
    setEditCategoryData({ name: category.name, description: category.description || '' });
    setShowEditCategory(true);
  };

  const cancelEditCategory = () => {
    setShowEditCategory(false);
    setEditingCategory(null);
    setEditCategoryData({ name: '', description: '' });
  };

  const saveEditCategory = async () => {
    if (!editingCategory || !editCategoryData.name.trim()) return;
    
    try {
      // Update category in categories array
      const updatedCategories = categories.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, name: editCategoryData.name.trim(), description: editCategoryData.description.trim() }
          : cat
      );
      setCategories(updatedCategories);
      
      // Update category in budgets array (for display purposes)
      const updatedBudgets = budgets.map(budget => 
        budget.categoryId === editingCategory.id
          ? { 
              ...budget, 
              category: { 
                ...budget.category, 
                name: editCategoryData.name.trim(), 
                description: editCategoryData.description.trim() 
              }
            }
          : budget
      );
      setBudgets(updatedBudgets);
      
      // Save updated data to localStorage
      localStorage.setItem('budget_categories', JSON.stringify(updatedCategories));
      const budgetKey = `budgets_${selectedYear}`;
      localStorage.setItem(budgetKey, JSON.stringify(updatedBudgets));
      
      cancelEditCategory();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const deleteCategoryFromEdit = async () => {
    if (!editingCategory) return;
    
    if (!confirm('Are you sure you want to delete this category? This will also remove all associated budgets.')) {
      return;
    }
    
    cancelEditCategory();
    await deleteCategory(editingCategory.id);
  };

  const calculateTotalBudget = () => {
    return budgets.reduce((total, budget) => total + budget.monthlyBudget, 0);
  };

  const calculateCentreTotalBudget = (centreId: string) => {
    return budgets
      .filter(budget => budget.centreId === centreId)
      .reduce((total, budget) => total + budget.monthlyBudget, 0);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading budget data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-white mr-3" />
              <div>
                <h2 className="text-2xl font-bold text-white">Budget Management</h2>
                <p className="text-green-100">Set monthly budgets for each centre and category</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Year Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="bg-white border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
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

          {/* Budget Table */}
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
                        {/* Make all category names clickable for editing */}
                        <div 
                          onClick={() => startEditCategory(category)}
                          className="text-sm font-medium text-gray-800 cursor-pointer hover:text-blue-600 hover:underline transition-colors"
                          title="Click to edit this category"
                        >
                          {category.name}
                        </div>
                        {category.description && (
                          <div className="text-sm text-gray-600">{category.description}</div>
                        )}
                      </div>
                    </td>
                    {centres.map((centre) => {
                      const budget = getBudgetForCentreCategory(centre.id, category.id);
                      const isEditing = editingBudget === `${centre.id}-${category.id}`;
                      const isEditingAccount = editingAccountCode === `${centre.id}-${category.id}`;

                      return (
                        <td key={`${centre.id}-${category.id}`} className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            {/* Budget Amount Editing */}
                            {isEditing ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900"
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
                                  ${budget?.monthlyBudget?.toFixed(2) || '0.00'}
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

                            {/* Xero Account Code Editing */}
                            {isEditingAccount ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={editAccountValue}
                                  onChange={(e) => setEditAccountValue(e.target.value)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                  placeholder="4-1234"
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
                                  Xero code: {budget?.xeroAccountCode || 'Not set'}
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

                {/* Total Row */}
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calculator className="h-4 w-4 mr-2" />
                      Total Monthly Budget
                    </div>
                  </td>
                  {centres.map((centre) => (
                    <td key={centre.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${calculateCentreTotalBudget(centre.id).toFixed(2)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-lg font-semibold text-green-900">
                  Total Budget for {selectedYear}:
                </span>
              </div>
              <span className="text-2xl font-bold text-green-900">
                ${calculateTotalBudget().toFixed(2)} /month
              </span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              Annual total: ${(calculateTotalBudget() * 12).toFixed(2)}
            </p>
          </div>

          {/* Help Text */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 mb-2">💡 How to use:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click the edit icon next to any budget amount to modify it</li>
              <li>• Click the edit icon next to "Xero code" to set the chart of account number for each centre/category</li>
              <li>• <strong>Click on any category name</strong> to edit its name, description, or delete it</li>
              <li>• Use "Add New Category" to create custom budget categories</li>
              <li>• Xero account codes help link budgets to actual spending when integrating with Xero</li>
              <li>• Changes are saved immediately when you click the save icon</li>
              <li>• These budgets will be used in the Xero page for variance reporting</li>
            </ul>
          </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-800 text-gray-900"
                    placeholder="Enter category name"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-800 text-gray-900"
                    placeholder="Enter description"
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
                  disabled={!newCategory.name.trim()}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md hover:from-blue-600 hover:to-teal-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Modal */}
        {showEditCategory && editingCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Budget Category</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={editCategoryData.name}
                    onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-800 text-gray-900"
                    placeholder="Enter category name"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={editCategoryData.description}
                    onChange={(e) => setEditCategoryData({ ...editCategoryData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-800 text-gray-900"
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={deleteCategoryFromEdit}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Delete Category
                </button>
                <div className="flex space-x-3">
                  <button
                    onClick={cancelEditCategory}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEditCategory}
                    disabled={!editCategoryData.name.trim()}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-md hover:from-blue-600 hover:to-teal-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
