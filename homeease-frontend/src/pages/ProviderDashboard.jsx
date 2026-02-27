import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProviderSidebar from '../components/ProviderSidebar';
import { bookingsAPI } from '../services/api';

const ProviderDashboard = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !currentUser) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  // Fetch provider bookings
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

  // Handle Accept Booking
  const handleAccept = async (bookingId) => {
    try {
      setActionLoading(prev => ({ ...prev, [bookingId]: 'accepting' }));
      await bookingsAPI.updateStatus(bookingId, 'CONFIRMED');
      
      // Update local state
      setMyBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'CONFIRMED' } : b
      ));
      
      alert('Booking accepted successfully!');
    } catch (error) {
      console.error('Error accepting booking:', error);
      alert(error.response?.data?.message || 'Failed to accept booking');
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  // Handle Decline Booking
  const handleDecline = async (bookingId) => {
    const reason = prompt('Please provide a reason for declining (optional):');
    
    try {
      setActionLoading(prev => ({ ...prev, [bookingId]: 'declining' }));
      await bookingsAPI.updateStatus(bookingId, 'REJECTED', reason || undefined);
      
      // Update local state
      setMyBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'REJECTED' } : b
      ));
      
      alert('Booking declined');
    } catch (error) {
      console.error('Error declining booking:', error);
      alert(error.response?.data?.message || 'Failed to decline booking');
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };
  
  // Don't render if no user
  if (!currentUser) {
    return null;
  }
  
  const pendingBookings = myBookings.filter(b => b.status === 'PENDING');
  const confirmedBookings = myBookings.filter(b => b.status === 'CONFIRMED');
  const completedBookings = myBookings.filter(b => b.status === 'COMPLETED');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ProviderSidebar />
      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Provider Dashboard
          </h1>
          <p className="text-gray-600">Welcome, {currentUser?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-800 mt-1">
                  {loading ? '...' : myBookings.length}
                </p>
              </div>
              <span className="text-3xl">📋</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {loading ? '...' : pendingBookings.length}
                </p>
              </div>
              <span className="text-3xl">⏳</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Confirmed</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {loading ? '...' : confirmedBookings.length}
                </p>
              </div>
              <span className="text-3xl">✅</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Earnings</p>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  {loading ? '...' : `Rs. ${totalEarnings.toLocaleString()}`}
                </p>
              </div>
              <span className="text-3xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Booking Requests</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⏳</div>
              <p className="text-gray-600">Loading your bookings...</p>
            </div>
          ) : myBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No bookings yet</h3>
              <p className="text-gray-600">Customers will see your profile when they search for services</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-800">
                          {booking.service?.name || 'Service'}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                          booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'COMPLETED' ? 'bg-blue-100 text-blue-700' :
                          booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-1">
                        Customer: {booking.customerName || 'N/A'}
                      </p>
                      <p className="text-gray-600 text-sm">
                        📅 {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                      </p>
                      <p className="text-gray-600 text-sm">
                        📍 {booking.address}
                      </p>
                      {booking.notes && (
                        <p className="text-gray-600 text-sm mt-2">
                          💬 {booking.notes}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-xl font-bold text-primary-600">Rs. {booking.totalAmount?.toLocaleString() || 'N/A'}</p>
                      {booking.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleAccept(booking.id)}
                            disabled={actionLoading[booking.id]}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[booking.id] === 'accepting' ? 'Accepting...' : 'Accept'}
                          </button>
                          <button 
                            onClick={() => handleDecline(booking.id)}
                            disabled={actionLoading[booking.id]}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[booking.id] === 'declining' ? 'Declining...' : 'Decline'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderDashboard;
