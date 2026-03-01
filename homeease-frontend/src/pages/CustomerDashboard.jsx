import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomerSidebar from '../components/CustomerSidebar';
import { bookingsAPI } from '../services/api';

// Format booking date and time from API (date + timeSlot)
function formatBookingDateTime(date, timeSlot) {
  if (!date) return { dateStr: '—', timeStr: timeSlot || '—' };
  const d = new Date(date);
  if (isNaN(d.getTime())) return { dateStr: '—', timeStr: timeSlot || '—' };
  const dateStr = d.toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  return { dateStr, timeStr: timeSlot || '—' };
}

const CustomerDashboard = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailsBooking, setDetailsBooking] = useState(null);

  const triggerChat = (booking) => {
    window.dispatchEvent(new CustomEvent('open_chat', { detail: { bookingId: booking.id } }));
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Fetch bookings
  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        const response = await bookingsAPI.getAll();
        setMyBookings(response.data.data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setMyBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  // Don't render if no user
  if (!currentUser) {
    return null;
  }

  const upcomingBookings = myBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING');
  const completedBookings = myBookings.filter(b => b.status === 'COMPLETED');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CustomerSidebar />
      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              Welcome back, {currentUser?.name}!
            </h1>
            <p className="text-gray-600">Manage your bookings and explore services</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Bookings</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    {loading ? '...' : myBookings.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Upcoming</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    {loading ? '...' : upcomingBookings.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⏰</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Completed</p>
                  <p className="text-3xl font-bold text-gray-800 mt-1">
                    {loading ? '...' : completedBookings.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/select-city"
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition"
              >
                <span className="text-3xl mb-2">🔍</span>
                <span className="text-sm font-medium text-gray-700">Browse Services</span>
              </Link>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition">
                <span className="text-3xl mb-2">⭐</span>
                <span className="text-sm font-medium text-gray-700">Rate Service</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition">
                <span className="text-3xl mb-2">💬</span>
                <span className="text-sm font-medium text-gray-700">Support</span>
              </button>
              <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition">
                <span className="text-3xl mb-2">👤</span>
                <span className="text-sm font-medium text-gray-700">Profile</span>
              </button>
            </div>
          </div>

          {/* Bookings List */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">My Bookings</h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600">Loading your bookings...</p>
              </div>
            ) : myBookings.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-6">Start by browsing our services</p>
                <Link
                  to="/select-city"
                  className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  Browse Services
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((booking) => {
                  const { dateStr, timeStr } = formatBookingDateTime(booking.date, booking.timeSlot);
                  return (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition"
                    >
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-gray-800">
                              {booking.serviceName || booking.service?.name || 'Service'}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                  booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                                    booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-700'
                              }`}>
                              {booking.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm mb-1">
                            Provider: {booking.provider?.name || 'N/A'}
                          </p>
                          <p className="text-gray-600 text-sm">
                            📅 {dateStr} at {timeStr}
                          </p>
                          <p className="text-gray-600 text-sm">
                            📍 {booking.address || `${booking.area || ''}, ${booking.city || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || 'N/A'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <p className="text-xl font-bold text-primary-600">Rs. {(booking.totalAmount ?? booking.price)?.toLocaleString() || 'N/A'}</p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setDetailsBooking(booking)}
                              className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                            >
                              View Details
                            </button>
                            {booking.status !== 'CANCELLED' && (
                              <button
                                onClick={() => triggerChat(booking)}
                                className="px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center gap-2"
                              >
                                <span>💬</span> Chat
                              </button>
                            )}
                            {booking.status === 'COMPLETED' && (
                              <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition">
                                Rate
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {detailsBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetailsBooking(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">Booking Details</h3>
              <button
                type="button"
                onClick={() => setDetailsBooking(null)}
                className="text-gray-500 hover:text-gray-700 p-1"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Service</p>
                <p className="text-gray-800 font-medium">{detailsBooking.serviceName || detailsBooking.service?.name || 'Service'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${detailsBooking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                    detailsBooking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      detailsBooking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                        detailsBooking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                  }`}>{detailsBooking.status}</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Booking ID</p>
                <p className="text-gray-800 font-mono text-sm">{detailsBooking.bookingNumber || detailsBooking.id?.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Provider</p>
                <p className="text-gray-800">{detailsBooking.provider?.name || 'N/A'}</p>
                {detailsBooking.provider?.phone && <p className="text-sm text-gray-600">{detailsBooking.provider.phone}</p>}
                {detailsBooking.provider?.email && <p className="text-sm text-gray-600">{detailsBooking.provider.email}</p>}
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Date & Time</p>
                <p className="text-gray-800">{formatBookingDateTime(detailsBooking.date, detailsBooking.timeSlot).dateStr} at {formatBookingDateTime(detailsBooking.date, detailsBooking.timeSlot).timeStr}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Location</p>
                <p className="text-gray-800">{detailsBooking.address || `${detailsBooking.area || ''}, ${detailsBooking.city || ''}`.replace(/^,\s*|,\s*$/g, '').trim() || 'N/A'}</p>
              </div>
              {detailsBooking.jobDescription && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Job Description</p>
                  <p className="text-gray-800 whitespace-pre-wrap">{detailsBooking.jobDescription}</p>
                </div>
              )}
              {detailsBooking.notes && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Notes</p>
                  <p className="text-gray-800">{detailsBooking.notes}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Total Amount</p>
                <p className="text-xl font-bold text-primary-600">Rs. {(detailsBooking.totalAmount ?? detailsBooking.price)?.toLocaleString() || 'N/A'}</p>
              </div>
              {detailsBooking.status !== 'CANCELLED' && (
                <button
                  onClick={() => {
                    triggerChat(detailsBooking);
                    setDetailsBooking(null);
                  }}
                  className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
                >
                  <span>💬</span> Continue to Chat
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;
