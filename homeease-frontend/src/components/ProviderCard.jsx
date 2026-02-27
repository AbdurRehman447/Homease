import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import BookingModal from './BookingModal';

const ProviderCard = ({ provider }) => {
  const [searchParams] = useSearchParams();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const selectedCity = searchParams.get('city') || provider.city || provider.location;
  
  // Get the first service if provider has services
  const primaryService = provider.services?.[0];
  const serviceName = primaryService?.service?.name || provider.serviceName || 'Service';
  const price = primaryService?.price || provider.price || 0;
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6">
      <div className="flex items-start space-x-4">
        <img
          src={provider.avatar || provider.image || 'https://i.pravatar.cc/100'}
          alt={provider.name}
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              {provider.name}
            </h3>
            {provider.isVerified && (
              <span className="text-green-500 text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Verified
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mt-1">{serviceName}</p>
          
          <div className="flex items-center mt-2">
            <div className="flex items-center text-yellow-500">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="ml-1 text-sm text-gray-700 font-medium">
                {provider.rating}
              </span>
            </div>
            <span className="ml-2 text-sm text-gray-500">
              ({provider.totalReviews || provider.reviews || 0} reviews)
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            📍 {provider.city || provider.location} • 🎓 {provider.experience || 'N/A'} exp.
          </p>

          <p className="text-sm text-gray-700 mt-3 line-clamp-2">
            {provider.bio || provider.description || 'Professional service provider'}
          </p>

          <div className="flex items-center justify-between mt-4">
            <p className="text-lg font-bold text-primary-600">
              Rs. {price}/hr
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowBookingModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-semibold shadow-sm"
              >
                Book Now
              </button>
              <Link
                to={`/provider/${provider.id}?city=${selectedCity}`}
                className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition text-sm font-semibold"
              >
                View Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <BookingModal
          provider={{
            ...provider,
            serviceName,
            price,
            location: provider.city || provider.location,
            image: provider.avatar || provider.image
          }}
          selectedCity={selectedCity}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};

export default ProviderCard;
