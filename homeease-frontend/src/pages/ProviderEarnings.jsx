import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProviderSidebar from '../components/ProviderSidebar';
import { bookingsAPI } from '../services/api';

const ProviderEarnings = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Fetch earnings statistics
  useEffect(() => {
    const fetchStats = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Calculate date range based on filter
        let params = {};
        const today = new Date();
        
        if (timeFilter === 'today') {
          params.startDate = today.toISOString().split('T')[0];
          params.endDate = today.toISOString().split('T')[0];
        } else if (timeFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          params.startDate = weekAgo.toISOString().split('T')[0];
          params.endDate = today.toISOString().split('T')[0];
        } else if (timeFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          params.startDate = monthAgo.toISOString().split('T')[0];
          params.endDate = today.toISOString().split('T')[0];
        }
        
        const response = await bookingsAPI.getStatistics(params);
        setStats(response.data.data || null);
      } catch (error) {
        console.error('Error fetching earnings:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser, timeFilter]);
  
  // Don't render if no user
  if (!currentUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ProviderSidebar />
      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Earnings
            </h1>
            <p className="text-gray-600">Track your income and financial performance</p>
          </div>

          {/* Time Filter */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setTimeFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeFilter === 'all'
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Time
              </button>
              <button
                onClick={() => setTimeFilter('today')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeFilter === 'today'
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeFilter === 'week'
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  timeFilter === 'month'
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Last 30 Days
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Loading earnings data...</p>
            </div>
          ) : !stats ? (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No earnings data available</h3>
              <p className="text-gray-600">Complete bookings to start earning</p>
            </div>
          ) : (
            <>
              {/* Earnings Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Total Earnings</h3>
                    <span className="text-3xl">💰</span>
                  </div>
                  <p className="text-4xl font-bold mb-1">
                    Rs. {stats.revenue?.providerEarnings?.toLocaleString() || 0}
                  </p>
                  <p className="text-green-100 text-sm">From completed bookings</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Total Bookings</h3>
                    <span className="text-3xl">📋</span>
                  </div>
                  <p className="text-4xl font-bold text-gray-800 mb-1">
                    {stats.total || 0}
                  </p>
                  <p className="text-gray-500 text-sm">All time bookings</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Completed</h3>
                    <span className="text-3xl">✅</span>
                  </div>
                  <p className="text-4xl font-bold text-green-600 mb-1">
                    {stats.byStatus?.COMPLETED || 0}
                  </p>
                  <p className="text-gray-500 text-sm">Successfully completed</p>
                </div>
              </div>

              {/* Booking Status Breakdown */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Booking Status Breakdown</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {stats.byStatus?.PENDING || 0}
                    </p>
                  </div>
                  <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Confirmed</p>
                    <p className="text-3xl font-bold text-blue-600">
                      {stats.byStatus?.CONFIRMED || 0}
                    </p>
                  </div>
                  <div className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">In Progress</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {stats.byStatus?.IN_PROGRESS || 0}
                    </p>
                  </div>
                  <div className="border border-red-200 bg-red-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Cancelled</p>
                    <p className="text-3xl font-bold text-red-600">
                      {stats.byStatus?.CANCELLED || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Total Booking Value</span>
                    <span className="text-lg font-semibold text-gray-800">
                      Rs. {stats.revenue?.total?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-200">
                    <span className="text-gray-600">Platform Fee (10%)</span>
                    <span className="text-lg font-semibold text-red-600">
                      - Rs. {((stats.revenue?.total || 0) - (stats.revenue?.providerEarnings || 0)).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-green-50 rounded-lg px-4">
                    <span className="text-gray-800 font-semibold">Your Net Earnings</span>
                    <span className="text-2xl font-bold text-green-600">
                      Rs. {stats.revenue?.providerEarnings?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderEarnings;
