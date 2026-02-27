import React from 'react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h1>
          <p className="text-xl text-gray-300">Get your home services done in 3 simple steps</p>
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-20">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <span className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">1</span>
                <h2 className="text-3xl font-bold text-gray-800">Browse & Select Services</h2>
              </div>
              <p className="text-gray-600 text-lg mb-4">
                Explore our wide range of home services including cleaning, plumbing, electrical work, painting, and more. 
                Use our advanced filters to find exactly what you need based on category, location, price, and ratings.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Browse 10+ service categories</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>View detailed provider profiles with ratings and reviews</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Compare prices and availability</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Filter by location, experience, and ratings</span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="text-center">
                <div className="text-8xl mb-4">🔍</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Search & Filter</h3>
                <p className="text-gray-600">Find the perfect service provider for your needs</p>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row-reverse items-center gap-12">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <span className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">2</span>
                <h2 className="text-3xl font-bold text-gray-800">Book Your Service</h2>
              </div>
              <p className="text-gray-600 text-lg mb-4">
                Once you've found the right service provider, booking is quick and easy. Select your preferred date and time, 
                provide your service address, and add any special requirements or notes.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Choose your preferred date and time slot</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Add service address and contact details</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Include special instructions or requirements</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Get instant booking confirmation</span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="text-center">
                <div className="text-8xl mb-4">📅</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Quick Booking</h3>
                <p className="text-gray-600">Schedule your service in just a few clicks</p>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="flex items-center mb-4">
                <span className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold mr-4">3</span>
                <h2 className="text-3xl font-bold text-gray-800">Get Quality Service</h2>
              </div>
              <p className="text-gray-600 text-lg mb-4">
                Our verified professionals will arrive at your location on the scheduled time. They'll complete the job 
                to your satisfaction, and you can track everything from your dashboard.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Professional arrives on time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Quality work guaranteed</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Track booking status in real-time</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Rate and review after completion</span>
                </li>
              </ul>
            </div>
            <div className="flex-1">
              <div className="text-center">
                <div className="text-8xl mb-4">✅</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Service Complete</h3>
                <p className="text-gray-600">Enjoy professional quality service</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Why Choose HomEase?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Verified Professionals</h3>
              <p className="text-gray-600 text-sm">All service providers are background-checked and verified</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💰</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Transparent Pricing</h3>
              <p className="text-gray-600 text-sm">Clear pricing with no hidden charges</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⭐</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Quality Guaranteed</h3>
              <p className="text-gray-600 text-sm">Rated and reviewed by thousands of customers</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Easy Management</h3>
              <p className="text-gray-600 text-sm">Track and manage all bookings from your dashboard</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8">
            Join thousands of satisfied customers who trust HomEase for their home services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/services"
              className="px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition font-semibold text-lg"
            >
              Browse Services
            </Link>
            <Link
              to="/signup"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition font-semibold text-lg"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
