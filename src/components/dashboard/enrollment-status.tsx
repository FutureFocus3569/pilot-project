"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
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

  useEffect(() => {
    fetchEnrollmentData();
  }, []);

  const fetchEnrollmentData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // For now, using mock data based on the image
      // Later we can replace this with real API calls
      const mockData: Centre[] = [
        {
          id: "centre_001",
          name: "Papamoa Beach",
          enrollmentData: {
            current: 83,
            future: 4,
            waiting: 11,
            enquiry: 0
          }
        },
        {
          id: "centre_002", 
          name: "The Boulevard",
          enrollmentData: {
            current: 64,
            future: 4,
            waiting: 2,
            enquiry: 0
          }
        },
        {
          id: "centre_003",
          name: "The Bach", 
          enrollmentData: {
            current: 49,
            future: 0,
            waiting: 7,
            enquiry: 0
          }
        },
        {
          id: "centre_004",
          name: "Terrace Views",
          enrollmentData: {
            current: 109,
            future: 0,
            waiting: 5,
            enquiry: 0
          }
        },
        {
          id: "centre_005",
          name: "Livingstone Drive",
          enrollmentData: {
            current: 60,
            future: 0,
            waiting: 4,
            enquiry: 0
          }
        },
        {
          id: "centre_006",
          name: "West Dune",
          enrollmentData: {
            current: 0,
            future: 0,
            waiting: 6,
            enquiry: 0
          }
        }
      ];

      setCentres(mockData);
    } catch (err) {
      console.error('Error fetching enrollment data:', err);
      setError('Failed to load enrollment data');
    } finally {
      setLoading(false);
    }
  };

  // Filter to only allowed centres based on centrePermissions
  const allowedCentreNames = user?.centrePermissions?.map(cp => cp.centreName) || [];
  const filteredCentres = allowedCentreNames.length > 0
    ? centres.filter(c => allowedCentreNames.includes(c.name))
    : centres;

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
            Live enrolment data - automatically updated weekdays at 5am NZT
          </p>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <RefreshCw className="h-4 w-4" />
          <span className="hidden sm:inline">Auto-Updated Daily</span>
          <div className="text-xs bg-gray-100 px-2 py-1 rounded hidden lg:block">
            Data sourced from Discover
          </div>
          <div className="text-xs bg-gray-100 px-2 py-1 rounded hidden xl:block">
            Auto-updated at 5am NZT, Mon-Fri
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCentres.map((centre) => (
          <EnrollmentCard key={centre.id} centre={centre} />
        ))}
      </div>
    </div>
  );
}
