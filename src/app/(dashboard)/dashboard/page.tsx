import { OccupancyCards } from "@/components/dashboard/occupancy-cards";
import { EnrollmentStatus } from "@/components/dashboard/enrollment-status";
import { OverdueInvoices } from "@/components/dashboard/overdue-invoices";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Dashboard</h1>
          <p className="text-blue-100">Occupancy overview for all 6 childcare centres</p>
        </div>
      </div>

      {/* Occupancy Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-200/50">
        <OccupancyCards />
      </div>

      {/* Enrollment Status Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-200/50">
        <EnrollmentStatus />
      </div>

      {/* Overdue Invoices Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-200/50">
        <OverdueInvoices />
      </div>
    </div>
  );
}
