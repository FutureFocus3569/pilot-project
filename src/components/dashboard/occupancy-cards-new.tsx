"use client";

import { useState, useEffect } from "react";
import { Users, RefreshCw } from "lucide-react";

interface Centre {
  id: string;
  name: string;
  code: string;
  capacity: number;
  occupancyData: {
    u2Count: number;
    o2Count: number;
    totalOccupancy: number;
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
  count: number;
}

function DonutChart({ value, total, size = 80, strokeWidth = 8, color, label, count }: DonutChartProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

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
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{count}</span>
          <span className="text-xs font-medium text-gray-600">{percentage}%</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}

export function OccupancyCards() {
  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCentres = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/centres');
      
      if (!response.ok) {
        throw new Error('Failed to fetch centres');
      }
      
      const data = await response.json();
      setCentres(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
      console.error('Error fetching centres:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentres();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center space-y-2">
                  <div className="h-20 w-20 bg-gray-200 rounded-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </div>
              ))}
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Centre Occupancy</h2>
        <button
          onClick={fetchCentres}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg transition-colors duration-200"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {centres.map((centre) => {
          const currentOccupancy = centre.occupancyData[0] || {
            u2Count: 0,
            o2Count: 0,
            totalOccupancy: 0,
          };

          const totalPercentage = centre.capacity > 0 ? Math.round((currentOccupancy.totalOccupancy / centre.capacity) * 100) : 0;

          return (
            <div key={centre.id} className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{centre.name}</h3>
                  <p className="text-sm text-gray-500">{centre.code}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>

              {/* Donut Charts Grid */}
              <div className="grid grid-cols-4 gap-4">
                {/* Under 2 */}
                <DonutChart
                  value={currentOccupancy.u2Count}
                  total={centre.capacity || 100}
                  color="#3b82f6"
                  label="U2"
                  count={currentOccupancy.u2Count}
                />

                {/* Over 2 */}
                <DonutChart
                  value={currentOccupancy.o2Count}
                  total={centre.capacity || 100}
                  color="#10b981"
                  label="O2"
                  count={currentOccupancy.o2Count}
                />

                {/* Total */}
                <DonutChart
                  value={currentOccupancy.totalOccupancy}
                  total={centre.capacity || 100}
                  color="#8b5cf6"
                  label="Total"
                  count={currentOccupancy.totalOccupancy}
                />

                {/* Capacity */}
                <DonutChart
                  value={currentOccupancy.totalOccupancy}
                  total={centre.capacity || 100}
                  color="#f59e0b"
                  label="Capacity"
                  count={centre.capacity || 0}
                />
              </div>

              {/* Footer with overall percentage */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Overall Occupancy</span>
                  <span className={`text-lg font-bold ${
                    totalPercentage >= 90 ? 'text-red-600' : 
                    totalPercentage >= 75 ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {totalPercentage}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
