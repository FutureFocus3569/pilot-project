"use client";

import { useState, useEffect } from "react";
import { RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface EnrollmentData {
  current: number;
  future: number;
  waiting: number;
  enquiry: number;
}

interface Centre {
  id: string;
  name: string;
  enrollmentData: EnrollmentData;
}

interface EnrollmentCardProps {
  centre: Centre;
}

function EnrollmentCard({ centre }: EnrollmentCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:border-blue-200/50">
      {/* Header with centre name */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 group-hover:from-blue-600 group-hover:to-teal-600 text-white px-4 py-3 transition-all duration-300">
        <h3 className="font-semibold text-sm drop-shadow-sm">{centre.name}</h3>
      </div>
      
      {/* Stats grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Current */}
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-green-600 mb-1">
              {centre.enrollmentData.current}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">
              Current
            </div>
          </div>
          
          {/* Future */}
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-blue-500 mb-1">
              {centre.enrollmentData.future}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">
              Future
            </div>
          </div>
          
          {/* Waiting */}
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-yellow-500 mb-1">
              {centre.enrollmentData.waiting}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">
              Waiting
            </div>
          </div>
          
          {/* Enquiry */}
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-gray-500 mb-1">
              {centre.enrollmentData.enquiry}
            </div>
            <div className="text-xs text-gray-600 uppercase tracking-wide">
              Enquiry
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EnrollmentStatus() {
  const { user } = useAuth();

  const [centres, setCentres] = useState<Centre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);


  const fetchEnrollmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch all centres
      const centreRes = await fetch("/api/centres");
      if (!centreRes.ok) throw new Error("Failed to fetch centres");
      const centreList = await centreRes.json();
      // Calculate start and end date for selected month
      const startDate = new Date(selectedYear, selectedMonth - 1, 1);
      const endDate = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999);
      // Fetch occupancy data for selected month
      const occRes = await fetch(`/api/occupancy?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
      if (!occRes.ok) throw new Error("Failed to fetch occupancy data");
      const occData = await occRes.json();
      // Group by centreId, keep only latest record per centre in month
      const latestByCentre: Record<string, any> = {};
      occData.forEach((row: any) => {
        const cid = row.centreId;
        if (!latestByCentre[cid] || new Date(row.date) > new Date(latestByCentre[cid].date)) {
          latestByCentre[cid] = row;
        }
      });
      // Always enforce this order for rendering
      const orderedCentres = [
        "Papamoa Beach",
        "The Boulevard",
        "The Bach",
        "Terrace Views",
        "Livingstone Drive",
        "West Dune"
      ];
      const centresOrdered: Centre[] = orderedCentres.map(name => {
        const centre = centreList.find((c: any) => c.name === name);
        const occ = centre ? latestByCentre[centre.id] : undefined;
        return {
          id: centre?.id || name,
          name,
          enrollmentData: {
            current: occ?.currentChildren ?? 0,
            future: occ?.futureChildren ?? 0,
            waiting: occ?.waitingChildren ?? 0,
            enquiry: occ?.enquiryChildren ?? 0,
          },
        };
      });
      setCentres(centresOrdered);
    } catch (err) {
      console.error("Error fetching enrollment data:", err);
      setError("Failed to load enrollment data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollmentData();
  }, [selectedYear, selectedMonth]);
  // Month navigation controls
  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };
  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  // Always show all six centres in the specified order
  const filteredCentres = centres;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
        <div className="flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          <span className="ml-2 text-gray-600">Loading enrollment data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-lg">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchEnrollmentData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enrolment Status</h2>
          <p className="text-sm text-gray-600 mt-1">
              Live enrolment data - automatically updated weekdays at 11pm NZT
          </p>
        </div>
        {/* Month navigation */}
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevMonth} className="p-2 rounded hover:bg-gray-100">
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <span className="font-medium text-gray-700">
            {new Date(selectedYear, selectedMonth - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })}
          </span>
          <button onClick={handleNextMonth} className="p-2 rounded hover:bg-gray-100">
            <ChevronRight className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Cards Grid - always render in specified order, mobile friendly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {centres.map((centre) => (
          <EnrollmentCard key={centre.id} centre={centre} />
        ))}
      </div>
    </div>
  );
}
