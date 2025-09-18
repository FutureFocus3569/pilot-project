"use client";

import { useState, useEffect } from "react";
import { Users, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface Centre {
  id: string;
  name: string;
  code: string;
  capacity: number;
  occupancyData: {
    u2Count: number;
    o2Count: number;
    totalCount: number;
    date: string;
  }[];
}

// Simple donut chart component
interface DonutChartProps {
  value: number;
  total: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  label: string;
}

function DonutChart({ value, total, size = 80, strokeWidth = 8, color, label }: DonutChartProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Cap the visual percentage at 100% so the chart doesn't overflow
  const visualPercentage = Math.min(percentage, 100);
  const offset = circumference - (visualPercentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#f3f4f6"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-500 ease-in-out"
          />
        </svg>
        {/* Center text - only percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-gray-900">{percentage}%</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}

export function OccupancyCards() {
  const { user } = useAuth();
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Month navigation state - default to current month and year
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // JS months are 0-based

  // Helper function to format month/year for display
  const formatMonthYear = (month: number, year: number) => {
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Helper function to get month string in "YYYY-MM-01" format
  const getMonthString = (year: number, month: number) => {
    return `${year}-${String(month).padStart(2, '0')}-01`;
  };

  // Helper function to get occupancy data for selected month
  const getOccupancyForMonth = (centre: Centre) => {
    const targetMonthString = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`; // "YYYY-MM"
    const occupancyData = centre.occupancyData?.find((data: any) => {
      // Match by year and month only
      const dataMonth = (data.date ?? '').slice(0, 7); // "YYYY-MM"
      return dataMonth === targetMonthString;
    });
    if (occupancyData) {
      return {
        u2Count: occupancyData.u2Count ?? 0,
        o2Count: occupancyData.o2Count ?? 0,
        totalCount: occupancyData.totalCount ?? 0,
        date: occupancyData.date,
      };
    }
    return {
      u2Count: 0,
      o2Count: 0,
      totalCount: 0,
      date: `${targetMonthString}-01`,
    };
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Check if we can navigate (based on available data range: Jan 2024 - June 2025)
  // Check if we can navigate (based on available data range: Jan 2024 - Aug 2025)
  const canGoToPrevious = () => {
    return !(selectedYear === 2024 && selectedMonth === 1);
  };

  const canGoToNext = () => {
    return !(selectedYear === 2025 && selectedMonth === 8);
  };

  const fetchCentres = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all centres
      const centreRes = await fetch("/api/centres");
      if (!centreRes.ok) throw new Error("Failed to fetch centres");
      const centreList = await centreRes.json();
      // Use "YYYY-MM-01" for API query
      const apiMonthString = getMonthString(selectedYear, selectedMonth); // "YYYY-MM-01"
      // Fetch centre occupancy data for selected month from correct API
      const occRes = await fetch(`/api/centre-occupancy?month=${apiMonthString}`);
      if (!occRes.ok) throw new Error("Failed to fetch centre occupancy data");
      const occData = await occRes.json();
      // Group by centreId and filter by selected month/year
      type OccRow = {
        centreId: string;
        u2: number;
        o2: number;
        total: number;
        month: string;
      };
      const byCentreMonth: Record<string, OccRow | undefined> = {};
      (occData as OccRow[]).forEach((row: OccRow) => {
        const rowMonthPrefix = (row.month ?? '').slice(0, 7); // "YYYY-MM"
        const targetMonthPrefix = apiMonthString.slice(0, 7); // "YYYY-MM"
        if (rowMonthPrefix === targetMonthPrefix) {
          byCentreMonth[row.centreId] = {
            centreId: row.centreId,
            u2: row.u2 ?? 0,
            o2: row.o2 ?? 0,
            total: row.total ?? 0,
            month: row.month
          };
        }
      });
      // Always enforce this order for rendering
      const orderedCentreCodes = [
        "papamoa-beach",
        "the-boulevard",
        "the-bach",
        "terrace-views",
        "livingstone-drive",
        "west-dune"
      ];
      const centresOrdered = orderedCentreCodes.map(code => {
        const centre = centreList.find((c: any) => c.code === code);
        const occ = centre ? byCentreMonth[code] : undefined;
        // Use "YYYY-MM-01" for fallback date
        const fallbackDate = apiMonthString;
        return {
          id: centre?.id || code,
          name: centre?.name || code,
          code: centre?.code || code,
          capacity: centre?.capacity || 100,
          occupancyData: [occ ? {
            u2Count: occ.u2 ?? 0,
            o2Count: occ.o2 ?? 0,
            totalCount: occ.total ?? 0,
            date: occ.month,
          } : {
            u2Count: 0,
            o2Count: 0,
            totalCount: 0,
            date: fallbackDate,
          }],
        };
      });
      setCentres(centresOrdered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching occupancy data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  // Top-level returns for loading and error
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse shadow-lg">
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 px-4 py-3">
              <div className="h-4 bg-blue-200 rounded w-24"></div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center space-y-2">
                    <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error loading centres</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={fetchCentres}
            className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Filter to only allowed centres based on centrePermissions
  const allowedCentreNames = user?.centrePermissions?.map(cp => cp.centreName) || [];
  const filteredCentres = allowedCentreNames.length > 0
    ? centres.filter(c => allowedCentreNames.includes(c.name))
    : centres;

  // Always enforce this order for rendering (use codes for mapping)
  const orderedCentreCodes = [
    "papamoa-beach",
    "the-boulevard",
    "the-bach",
    "terrace-views",
    "livingstone-drive",
    "west-dune"
  ];
  const centresOrdered = orderedCentreCodes.map(code => {
    const centre = filteredCentres.find(c => c.code === code);
    return centre || {
      id: code,
      name: code,
      code,
      capacity: 100,
      occupancyData: [],
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Centre Occupancy</h2>
        <div className="flex items-center space-x-4">
          {/* Month Navigation */}
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
            <button
              onClick={goToPreviousMonth}
              disabled={!canGoToPrevious()}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>
            
            <span className="text-sm font-medium text-gray-900 min-w-[140px] text-center">
              {formatMonthYear(selectedMonth, selectedYear)}
            </span>
            
            <button
              onClick={goToNextMonth}
              disabled={!canGoToNext()}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {centresOrdered.map((centre) => {
        const currentOccupancy = getOccupancyForMonth(centre);
          return (
            <div key={centre.id} className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-200/50">
              {/* Header with centre name and navigation controls */}
              <div className="bg-gradient-to-r from-blue-500 to-teal-500 group-hover:from-blue-600 group-hover:to-teal-600 text-white px-4 py-3 transition-all duration-300">
                <h3 className="font-semibold text-sm drop-shadow-sm">{centre.name}</h3>
              </div>

              {/* Donut Charts Grid - Only U2, O2, and Total */}
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  {/* Under 2 */}
                  <div className="text-center">
                    <DonutChart
                      value={currentOccupancy.u2Count}
                      total={centre.capacity || 100}
                      color="#3b82f6"
                      label="U2"
                    />
                  </div>
                  {/* Over 2 */}
                  <div className="text-center">
                    <DonutChart
                      value={currentOccupancy.o2Count}
                      total={centre.capacity || 100}
                      color="#3b82f6"
                      label="O2"
                    />
                  </div>
                  {/* Total */}
                  <div className="text-center">
                    <DonutChart
                      value={currentOccupancy.totalCount}
                      total={centre.capacity || 100}
                      color="#3b82f6"
                      label="Total"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
