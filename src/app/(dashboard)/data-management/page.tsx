'use client';

import { CSVImport } from "@/components/dashboard/csv-import";
import { Database, Upload, Download, Trash2, AlertTriangle } from "lucide-react";

export default function DataManagementPage() {
  // TODO: Replace with real user data from your auth system
  const currentUser = {
    role: 'MASTER' // You are the MASTER user with full access
  };

  // Check if user has permission to access this page
  if (currentUser.role !== 'MASTER') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-red-600">You don&apos;t have permission to access the Data Management page.</p>
          <p className="text-red-600 mt-2">Only MASTER users can manage system data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-2xl shadow-xl relative overflow-hidden mb-6">
        
        <div className="flex items-center relative z-10">
          <Database className="h-8 w-8 text-white mr-3 drop-shadow-lg" />
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Data Management</h1>
            <p className="text-blue-100">Import, export, and manage your childcare centre data</p>
          </div>
        </div>
      </div>

      {/* Data Import Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-2">
            <Upload className="h-5 w-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Import Data</h2>
          </div>
          <p className="text-gray-600">Upload CSV files to import occupancy data, staff hours, and centre information</p>
        </div>
        <div className="p-6">
          <CSVImport />
        </div>
      </div>

      {/* Data Export Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-2">
            <Download className="h-5 w-5 text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Export Data</h2>
          </div>
          <p className="text-gray-600">Download your data for backup, analysis, or integration with other systems</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg p-4 text-left transition-colors">
              <h3 className="font-medium text-green-900 mb-2">Occupancy Data</h3>
              <p className="text-sm text-green-700">Export all occupancy records by centre and date range</p>
            </button>
            <button className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 text-left transition-colors">
              <h3 className="font-medium text-blue-900 mb-2">Financial Reports</h3>
              <p className="text-sm text-blue-700">Export invoice and payment data for accounting</p>
            </button>
            <button className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg p-4 text-left transition-colors">
              <h3 className="font-medium text-purple-900 mb-2">Centre Information</h3>
              <p className="text-sm text-purple-700">Export centre details and capacity information</p>
            </button>
          </div>
        </div>
      </div>

      {/* Database Management Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-2">
            <Trash2 className="h-5 w-5 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Database Management</h2>
          </div>
          <p className="text-gray-600">Advanced database operations - use with caution</p>
        </div>
        <div className="p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-yellow-800 font-medium">Warning:</span>
            </div>
            <p className="text-yellow-700 mt-1">These operations cannot be undone. Always backup your data before proceeding.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button className="bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-4 text-left transition-colors">
              <h3 className="font-medium text-red-900 mb-2">Clear Occupancy Data</h3>
              <p className="text-sm text-red-700">Remove all occupancy records (keeps centres intact)</p>
            </button>
            <button className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-lg p-4 text-left transition-colors">
              <h3 className="font-medium text-orange-900 mb-2">Reset Test Data</h3>
              <p className="text-sm text-orange-700">Replace all data with fresh demo data</p>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <button className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors">
            View Import History
          </button>
          <button className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors">
            Database Backup
          </button>
          <button className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors">
            Data Validation
          </button>
          <button className="bg-white hover:bg-gray-50 border border-gray-300 rounded-md px-4 py-2 text-sm font-medium text-gray-700 transition-colors">
            System Health Check
          </button>
        </div>
      </div>
    </div>
  );
}
