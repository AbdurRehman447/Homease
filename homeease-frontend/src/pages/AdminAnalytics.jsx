import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { adminAPI } from '../services/api';

const AdminAnalytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAnalytics({ period });
      setAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      
      <div className="flex-1 ml-64">
        <div className="bg-white shadow-sm border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Analytics & Reports</h1>
              <p className="text-sm text-gray-600">Platform performance metrics</p>
            </div>
            <select 
              className="px-4 py-2 border border-gray-300 rounded-lg"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 3 Months</option>
              <option value="365">All Time</option>
            </select>
          </div>
        </div>

        <div className="p-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : analytics ? (
            <>
          {/* Revenue Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
              <p className="text-green-100 text-sm">Total Revenue</p>
              <p className="text-4xl font-bold mt-2">Rs. {analytics.revenue.total.toLocaleString()}</p>
              <p className="text-green-100 text-sm mt-2">Last {period} days</p>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
              <p className="text-blue-100 text-sm">Avg Booking Value</p>
              <p className="text-4xl font-bold mt-2">Rs. {Math.round(analytics.revenue.average || 0)}</p>
              <p className="text-blue-100 text-sm mt-2">Per booking average</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
              <p className="text-purple-100 text-sm">Platform Fee</p>
              <p className="text-4xl font-bold mt-2">Rs. {analytics.revenue.platformFee.toLocaleString()}</p>
              <p className="text-purple-100 text-sm mt-2">Total commission earned</p>
            </div>
          </div>

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue Trend</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-6xl mb-2">📈</div>
                  <p className="text-gray-600">Revenue chart visualization</p>
                  <p className="text-sm text-gray-500 mt-1">(Chart library integration needed)</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Booking Distribution</h3>
              <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-6xl mb-2">📊</div>
                  <p className="text-gray-600">Distribution chart visualization</p>
                  <p className="text-sm text-gray-500 mt-1">(Chart library integration needed)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Service Performance */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Performing Services</h3>
            <div className="space-y-4">
              {analytics.topServices && analytics.topServices.length > 0 ? (
                analytics.topServices.map((service, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{service.serviceName}</p>
                      <p className="text-sm text-gray-600">{service._count.id} bookings</p>
                    </div>
                    <div className="w-32 h-8 bg-primary-100 rounded overflow-hidden">
                      <div 
                        className="h-full bg-primary-600" 
                        style={{ width: `${Math.min((service._count.id / (analytics.topServices[0]?._count.id || 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No booking data available</p>
              )}
            </div>
          </div>

          {/* Customer Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Providers</h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-green-600 mb-2">{analytics.topProviders?.length || 0}</div>
                <p className="text-gray-600">Active providers</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Cities Served</h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-yellow-500 mb-2">{analytics.cityStats?.length || 0}</div>
                <p className="text-gray-600">Active locations</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Total Bookings</h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-blue-600 mb-2">{analytics.bookingsOverTime?.reduce((sum, b) => sum + b._count.id, 0) || 0}</div>
                <p className="text-gray-600">In selected period</p>
              </div>
            </div>
          </div>
            </>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">Failed to load analytics data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
