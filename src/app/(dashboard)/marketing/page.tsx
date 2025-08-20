export default function MarketingPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6 rounded-2xl shadow-xl relative overflow-hidden mb-6">
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Marketing</h1>
          <p className="text-blue-100">Marketing campaigns and analytics for all centres</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Overview */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Active Campaigns
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Summer Enrollment Drive</h4>
                <p className="text-sm text-gray-600">All centres • Ends Aug 31</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                Active
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">Open House Events</h4>
                <p className="text-sm text-gray-600">CC1, CC3, CC5 • Weekly</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                Scheduled
              </span>
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Marketing Analytics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Website Visits</span>
              <span className="font-semibold">2,840</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Inquiries Generated</span>
              <span className="font-semibold">156</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tours Booked</span>
              <span className="font-semibold">89</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Conversion Rate</span>
              <span className="font-semibold">5.5%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-4">
        <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          Create Campaign
        </button>
        <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
          View Analytics
        </button>
      </div>
    </div>
  );
}
