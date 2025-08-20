export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-6">
            🏫 Childcare Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Welcome to your childcare management system
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a 
              href="/budget" 
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-bold mb-2">Budget Management</h3>
              <p className="text-green-100">Set up your 2025 budgets</p>
            </a>
            
            <a 
              href="/xero" 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-4">📊</div>
              <h3 className="text-xl font-bold mb-2">Xero Integration</h3>
              <p className="text-blue-100">Budget vs Actuals</p>
            </a>
            
            <a 
              href="/admin" 
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-4">👥</div>
              <h3 className="text-xl font-bold mb-2">User Management</h3>
              <p className="text-purple-100">Manage staff access</p>
            </a>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              ✅ Server running on <strong>localhost:3005</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
