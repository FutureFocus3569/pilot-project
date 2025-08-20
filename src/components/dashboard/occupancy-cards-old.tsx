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

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (current < previous) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return "text-green-600";
    if (current < previous) return "text-red-600";
    return "text-gray-500";
  };

  const getOccupancyRate = (current: number, capacity: number) => {
    return Math.round((current / capacity) * 100);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.346 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchCentres}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (centres.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <div className="text-center">
          <div className="text-gray-400 mb-4">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No centres found</h3>
          <p className="text-gray-600">Please set up your childcare centres first or import data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {centres.map((centre) => {
        const currentOccupancy = centre.occupancyData[0] || {
          u2Count: 0,
          o2Count: 0,
          totalOccupancy: 0,
        };
        
        const occupancyRate = getOccupancyRate(currentOccupancy.totalOccupancy, centre.capacity);
        const previousOccupancy = 35; // This could be calculated from historical data
        const trend = currentOccupancy.totalOccupancy - previousOccupancy;
        
        return (
          <div
            key={centre.id}
            className="bg-white rounded-lg shadow border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {centre.name}
                </h3>
                <p className="text-sm text-gray-500">{centre.code}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>

            {/* Main metrics */}
            <div className="space-y-3">
              {/* Total occupancy */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Total</span>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {currentOccupancy.totalOccupancy}
                  </span>
                  <span className="text-sm text-gray-500">
                    / {centre.capacity}
                  </span>
                </div>
              </div>

              {/* U2 and O2 breakdown */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Under 2</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {currentOccupancy.u2Count}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Over 2</p>
                  <p className="text-lg font-semibold text-green-600">
                    {currentOccupancy.o2Count}
                  </p>
                </div>
              </div>

              {/* Occupancy rate and trend */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-1">
                  {getTrendIcon(currentOccupancy.totalOccupancy, previousOccupancy)}
                  <span className={`text-sm font-medium ${getTrendColor(currentOccupancy.totalOccupancy, previousOccupancy)}`}>
                    {trend > 0 ? '+' : ''}{trend}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">
                    {occupancyRate}%
                  </span>
                  <p className="text-xs text-gray-500">capacity</p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    occupancyRate >= 90
                      ? 'bg-red-500'
                      : occupancyRate >= 75
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(occupancyRate, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
