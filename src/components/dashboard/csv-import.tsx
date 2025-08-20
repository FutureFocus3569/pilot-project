"use client";

import { useState } from "react";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";

interface ImportResult {
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

export function CSVImport() {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Please select a valid CSV file');
      setFile(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/occupancy', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Import Historical Occupancy Data
        </h3>
        <p className="text-sm text-gray-600">
          Upload a CSV file with columns: centre_name, month_year, u2, o2, total
        </p>
      </div>

      {/* CSV Format Example */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Expected CSV Format:</h4>
        <div className="text-xs font-mono text-gray-600">
          <div>centre_name,month_year,u2,o2,total</div>
          <div>Sunshine Kids Centre,Jan 2024,12,28,40</div>
          <div>Rainbow Learning Centre,Jan 2024,15,35,50</div>
        </div>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select CSV File
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <FileSpreadsheet className="h-4 w-4" />
              <span>{file.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={!file || importing}
        className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Upload className={`h-4 w-4 ${importing ? 'animate-spin' : ''}`} />
        <span>{importing ? 'Importing...' : 'Import Data'}</span>
      </button>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Import Failed</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Success Display */}
      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Import Completed</span>
          </div>
          <div className="text-sm text-green-700 space-y-1">
            <p>Total rows processed: {result.totalRows}</p>
            <p>Successful imports: {result.successCount}</p>
            {result.errorCount > 0 && (
              <p>Errors encountered: {result.errorCount}</p>
            )}
          </div>
          
          {result.errors.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-red-800 mb-2">Errors:</p>
              <div className="text-xs text-red-700 max-h-32 overflow-y-auto">
                {result.errors.map((error, index) => (
                  <div key={index} className="mb-1">{error}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
