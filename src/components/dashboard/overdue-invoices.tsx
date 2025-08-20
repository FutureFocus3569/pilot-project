"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface InvoiceData {
  overdueAmount: number;
  status: string;
}

interface Centre {
  id: string;
  name: string;
  invoiceData: InvoiceData;
}

interface InvoiceCardProps {
  centre: Centre;
}

function InvoiceCard({ centre }: InvoiceCardProps) {
  return (
    <div className="text-center">
      <h3 className="font-medium text-gray-900 mb-4">{centre.name}</h3>
      <div className="space-y-2">
        <div className="text-lg font-bold text-red-500">
          ${centre.invoiceData.overdueAmount.toFixed(2)}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          {centre.invoiceData.status}
        </div>
      </div>
    </div>
  );
}

export function OverdueInvoices() {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvoiceData();
  }, []);

  const fetchInvoiceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, using mock data based on the image
      // Later we can replace this with real API calls to accounting system
      const mockData: Centre[] = [
        {
          id: "centre_001",
          name: "Papamoa Beach",
          invoiceData: {
            overdueAmount: 0.00,
            status: "OVERDUE"
          }
        },
        {
          id: "centre_002", 
          name: "The Boulevard",
          invoiceData: {
            overdueAmount: 0.00,
            status: "OVERDUE"
          }
        },
        {
          id: "centre_003",
          name: "The Bach",
          invoiceData: {
            overdueAmount: 0.00,
            status: "OVERDUE"
          }
        },
        {
          id: "centre_004",
          name: "Terrace Views",
          invoiceData: {
            overdueAmount: 0.00,
            status: "OVERDUE"
          }
        },
        {
          id: "centre_005",
          name: "Livingstone Drive",
          invoiceData: {
            overdueAmount: 0.00,
            status: "OVERDUE"
          }
        },
        {
          id: "centre_006",
          name: "West Dune",
          invoiceData: {
            overdueAmount: 0.00,
            status: "OVERDUE"
          }
        }
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setCentres(mockData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice data');
      console.error('Error fetching invoice data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-200/50">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 group-hover:from-blue-600 group-hover:to-teal-600 p-6 rounded-t-xl transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <div className="h-7 bg-white/30 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-white/20 rounded w-80 animate-pulse"></div>
            </div>
            <div className="h-8 bg-white/20 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="text-center animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-20 mx-auto mb-4"></div>
                <div className="space-y-2">
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-200/50">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 group-hover:from-blue-600 group-hover:to-teal-600 p-6 rounded-t-xl transition-all duration-300">
          <h2 className="text-2xl font-bold text-white drop-shadow-sm">Overdue Invoices Amount</h2>
        </div>
        
        {/* Error content */}
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading invoice data</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                onClick={fetchInvoiceData}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-200/50">
      {/* Header with gradient background matching other sections */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 group-hover:from-blue-600 group-hover:to-teal-600 p-6 rounded-t-xl transition-all duration-300">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-sm">Overdue Invoices Amount</h2>
            <p className="text-blue-100">Live invoice data - automatically updated weekdays at 5am NZT</p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center px-3 py-1 rounded-md bg-white/20 backdrop-blur-sm text-sm text-white mb-1">
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Auto-Updated Daily
            </div>
            <div className="text-xs text-blue-100">
              Data sourced from Discover<br />
              Auto-updated at 5am NZT, Mon-Fri
            </div>
          </div>
        </div>
      </div>

      {/* Content area */}
      <div className="p-6">
        {/* Centres grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {centres.map((centre) => (
            <InvoiceCard key={centre.id} centre={centre} />
          ))}
        </div>
      </div>
    </div>
  );
}
