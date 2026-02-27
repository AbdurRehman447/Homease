import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Phone, Mail, FileText, AlertCircle } from 'lucide-react';
import { bookingsAPI } from '../services/api';

const BookingModal = ({ provider, onClose, selectedCity }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState({
    jobDescription: '',
    serviceType: '',
    date: '',
    timeSlot: '',
    area: '',
    address: '',
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    notes: ''
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create booking via API
      const response = await bookingsAPI.create({
        providerId: provider.id,
        serviceId: provider.services?.[0]?.serviceId || null,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        city: selectedCity || provider.location,
        area: bookingData.area,
        address: bookingData.address,
        jobDescription: bookingData.jobDescription,
        notes: bookingData.notes || undefined,
      });

      const createdBooking = response.data.data.booking;
      setBookingId(createdBooking.id);
      setBookingConfirmed(true);
    } catch (err) {
      console.error('Error creating booking:', err);
      setError(err.response?.data?.message || 'Failed to create booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate estimated pricing
  const baseCharge = provider.price;
  const platformFee = Math.round(baseCharge * 0.1); // 10% platform fee
  const totalEstimate = baseCharge + platformFee;

  if (bookingConfirmed) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
          {/* Success Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-2">
              Booking Confirmed!
            </h3>
            <p className="text-lg text-gray-600 mb-1">
              Booking ID: <span className="font-mono font-semibold text-blue-600">{bookingId}</span>
            </p>
          </div>

          {/* Success Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-800">
                <p className="font-semibold mb-1">Booking Created Successfully</p>
                <p>Your booking request has been sent to the provider. They will confirm within 2-4 hours.</p>
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-gray-800 mb-4">Booking Summary</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Provider:</span>
                <span className="font-medium text-gray-800">{provider.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium text-gray-800">{provider.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-gray-800">{bookingData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium text-gray-800">{bookingData.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-800">{bookingData.area}, {selectedCity || provider.location}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 pt-3">
                <span className="text-gray-600">Total Estimate:</span>
                <span className="font-bold text-blue-600 text-lg">Rs. {totalEstimate.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">Pending Provider Confirmation</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Close
            </button>
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Go to My Bookings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Book Service</h2>
            <p className="text-sm text-gray-600 mt-1">Complete the form to confirm your booking</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <svg className="w-6 h-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <div className="flex items-center space-x-2 text-sm text-red-800">
              <AlertCircle className="w-4 h-4" />
              <p><strong>Error:</strong> {error}</p>
            </div>
          </div>
        )}

        {/* Provider Summary - Read Only */}
        <div className="px-6 py-5 bg-gradient-to-r from-primary-50 to-blue-50 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Selected Provider</h3>
          <div className="flex items-start space-x-4">
            <img
              src={provider.image}
              alt={provider.name}
              className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-bold text-gray-800">{provider.name}</h3>
                {provider.verified && (
                  <span className="text-green-500 text-sm flex items-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                  </span>
                )}
              </div>
              <p className="text-gray-700 font-medium mb-2">{provider.serviceName}</p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  <span className="font-semibold text-gray-800">{provider.rating}</span>
                  <span className="ml-1">({provider.reviews} reviews)</span>
                </div>
                <span>•</span>
                <span>From <strong className="text-blue-600">Rs. {provider.price.toLocaleString()}</strong></span>
                <span>•</span>
                <span>Response: ~2-4 hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          {/* Section 1: Service Requirement Details */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Service Requirement Details
            </h3>
            
            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                required
                value={bookingData.jobDescription}
                onChange={(e) => setBookingData({ ...bookingData, jobDescription: e.target.value })}
                rows="4"
                placeholder="Please describe the work you need done. Be specific about the issue or requirements..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              ></textarea>
            </div>
          </div>

          {/* Section 2: Date & Time Selection */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-600" />
              Date & Time Selection
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Service Date *
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={bookingData.date}
                  onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Time Slot *
                </label>
                <select
                  required
                  value={bookingData.timeSlot}
                  onChange={(e) => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Select time slot</option>
                  <option value="09:00 AM">9:00 AM - Morning</option>
                  <option value="10:00 AM">10:00 AM - Morning</option>
                  <option value="11:00 AM">11:00 AM - Late Morning</option>
                  <option value="12:00 PM">12:00 PM - Noon</option>
                  <option value="01:00 PM">1:00 PM - Afternoon</option>
                  <option value="02:00 PM">2:00 PM - Afternoon</option>
                  <option value="03:00 PM">3:00 PM - Afternoon</option>
                  <option value="04:00 PM">4:00 PM - Evening</option>
                  <option value="05:00 PM">5:00 PM - Evening</option>
                  <option value="06:00 PM">6:00 PM - Evening</option>
                  <option value="07:00 PM">7:00 PM - Late Evening</option>
                  <option value="08:00 PM">8:00 PM - Night</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Location Details */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Location Details
            </h3>
            
            {/* Selected City (Read-only) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                value={selectedCity || provider.location}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>

            {/* Area/Neighborhood */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area or Neighborhood *
              </label>
              <input
                type="text"
                required
                value={bookingData.area}
                onChange={(e) => setBookingData({ ...bookingData, area: e.target.value })}
                placeholder="e.g., Gulshan-e-Iqbal, DHA Phase 5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Full Address */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Service Address *
              </label>
              <input
                type="text"
                required
                value={bookingData.address}
                onChange={(e) => setBookingData({ ...bookingData, address: e.target.value })}
                placeholder="House/Flat No., Street Name, Landmark"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Use Current Location Button (Demo) */}
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center opacity-50 cursor-not-allowed"
              disabled
            >
              <MapPin className="w-4 h-4 mr-1" />
              Use current location (Demo - Not functional)
            </button>
          </div>

          {/* Section 4: Customer Contact Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Customer Contact Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={bookingData.fullName}
                  onChange={(e) => setBookingData({ ...bookingData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={bookingData.phone}
                  onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                  placeholder="+92 300 1234567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Email */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={bookingData.email}
                  onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Estimated Price Breakdown */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            Estimated Price Breakdown
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Base Service Charge</span>
                <span className="font-medium text-gray-800">Rs. {baseCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Estimated Service Cost</span>
                <span className="font-medium text-gray-800">Rs. {baseCharge.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Platform Fee (10%)</span>
                <span className="font-medium text-gray-800">Rs. {platformFee.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-300 pt-3 flex justify-between">
                <span className="font-semibold text-gray-800">Total Estimated Amount</span>
                <span className="font-bold text-blue-600 text-xl">Rs. {totalEstimate.toLocaleString()}</span>
              </div>
              <p className="text-xs text-gray-500 italic mt-2">
                * Final price may vary after provider inspection
              </p>
            </div>
          </div>

          {/* Section 6: Additional Notes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Notes (Optional)</h3>
            <textarea
              value={bookingData.notes}
              onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
              rows="3"
              placeholder="Any special instructions for the provider? e.g., 'Please call before arriving' or 'Gate code: 1234'"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            ></textarea>
          </div>
        </form>

        {/* Footer with Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          {/* Provider Availability Notice */}
          {provider.availability && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Provider Availability</p>
                  <p>Available on: <strong>{provider.availability.join(', ')}</strong></p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Booking...' : 'Confirm Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
