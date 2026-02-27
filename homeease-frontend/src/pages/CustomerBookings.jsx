import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CustomerSidebar from '../components/CustomerSidebar';
import { bookingsAPI } from '../services/api';

const CustomerBookings = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState({});

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
        setBookings(response.data.data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  // Handle Cancel Booking
  const handleCancelBooking = async (bookingId) => {
    const reason = prompt('Please provide a reason for cancellation (optional):');
    
    try {
      setActionLoading(prev => ({ ...prev, [bookingId]: 'cancelling' }));
      await bookingsAPI.updateStatus(bookingId, 'CANCELLED', reason || undefined);
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'CANCELLED' } : b
      ));
      
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  // Handle Mark as Completed
  const handleMarkCompleted = async (bookingId) => {
    const confirm = window.confirm('Mark this booking as completed? This action confirms that the service was successfully delivered.');
    if (!confirm) return;
    
    try {
      setActionLoading(prev => ({ ...prev, [bookingId]: 'completing' }));
      await bookingsAPI.updateStatus(bookingId, 'COMPLETED');
      
      // Update local state
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'COMPLETED' } : b
      ));
      
      alert('Booking marked as completed!');
    } catch (error) {
      console.error('Error marking booking as completed:', error);
      alert(error.response?.data?.message || 'Failed to mark booking as completed');
    } finally {
      setActionLoading(prev => ({ ...prev, [bookingId]: null }));
    }
  };

  // Handle View Details
  const handleViewDetails = (booking) => {
    alert(`Booking Details:

Booking ID: ${booking.id}
Service: ${booking.service?.name || booking.serviceName}
Provider: ${booking.provider?.name || 'N/A'}
Status: ${booking.status}
Date: ${new Date(booking.date).toLocaleDateString()}
Time: ${booking.timeSlot}
Location: ${booking.address}
Total Amount: Rs. ${booking.totalAmount}`);
  };

  // Don't render if no user
  if (!currentUser) {
    return null;
  }

  // Filter bookings based on status
  const filteredBookings = activeFilter === 'all' 
    ? bookings 
    : bookings.filter(b => {
        if (activeFilter === 'upcoming') return b.status === 'PENDING' || b.status === 'CONFIRMED';
        if (activeFilter === 'completed') return b.status === 'COMPLETED';
        if (activeFilter === 'cancelled') return b.status === 'CANCELLED';
        return true;
      });

  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'CONFIRMED': return 'bg-green-100 text-green-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      case 'CANCELLED': return 'bg-red-100 text-red-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CustomerSidebar />
      <div className="flex-1 ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              My Bookings
            </h1>
            <p className="text-gray-600">View and manage all your service bookings</p>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeFilter === 'all'
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Bookings ({bookings.length})
              </button>
              <button
                onClick={() => setActiveFilter('upcoming')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeFilter === 'upcoming'
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Upcoming ({bookings.filter(b => b.status === 'PENDING' || b.status === 'CONFIRMED').length})
              </button>
              <button
                onClick={() => setActiveFilter('completed')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeFilter === 'completed'
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Completed ({bookings.filter(b => b.status === 'COMPLETED').length})
              </button>
              <button
                onClick={() => setActiveFilter('cancelled')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  activeFilter === 'cancelled'
                    ? 'bg-gray-900 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancelled ({bookings.filter(b => b.status === 'CANCELLED').length})
              </button>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-4xl mb-4">⏳</div>
                <p className="text-gray-600">Loading your bookings...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {activeFilter === 'all' ? 'No bookings yet' : `No ${activeFilter} bookings`}
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeFilter === 'all' 
                    ? 'Start by browsing our services' 
                    : 'Try changing the filter or create a new booking'}
                </p>
                {activeFilter === 'all' && (
                  <button
                    onClick={() => navigate('/select-city')}
                    className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Browse Services
                  </button>
                )}
              </div>
            ) : (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-6"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Side - Booking Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-800">
                          {booking.service?.name || booking.serviceName || 'Service'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <span className="font-medium w-24">Booking ID:</span>
                          <span className="font-mono text-gray-800">{booking.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-24">Provider:</span>
                          <span className="text-gray-800">{booking.provider?.name || 'N/A'}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-24">Date:</span>
                          <span className="text-gray-800">
                            📅 {new Date(booking.date).toLocaleDateString()} at {booking.timeSlot}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-medium w-24">Location:</span>
                          <span className="text-gray-800">📍 {booking.address}</span>
                        </div>
                        {booking.jobDescription && (
                          <div className="flex items-start mt-2">
                            <span className="font-medium w-24">Description:</span>
                            <span className="text-gray-800 flex-1">{booking.jobDescription}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Side - Price & Actions */}
                    <div className="flex flex-col items-end gap-3 min-w-[200px]">
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-2xl font-bold text-primary-600">
                          Rs. {booking.totalAmount?.toLocaleString() || 'N/A'}
                        </p>
                      </div>

                      <div className="flex flex-col gap-2 w-full">
                        <button 
                          onClick={() => handleViewDetails(booking)}
                          className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                          View Details
                        </button>
                        {booking.status === 'CONFIRMED' && (
                          <button 
                            onClick={() => handleMarkCompleted(booking.id)}
                            disabled={actionLoading[booking.id]}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[booking.id] === 'completing' ? 'Completing...' : 'Mark Completed'}
                          </button>
                        )}
                        {booking.status === 'COMPLETED' && (
                          <button className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-medium">
                            Rate Service
                          </button>
                        )}
                        {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                          <button 
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={actionLoading[booking.id]}
                            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {actionLoading[booking.id] === 'cancelling' ? 'Cancelling...' : 'Cancel Booking'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerBookings;
