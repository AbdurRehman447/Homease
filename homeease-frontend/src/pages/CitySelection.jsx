import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CitySelection = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('');

  // Major cities in Pakistan
  const cities = [
    { name: 'Karachi', icon: '🏙️' },
    { name: 'Lahore', icon: '🕌' },
    { name: 'Islamabad', icon: '🏛️' },
    { name: 'Rawalpindi', icon: '🌆' },
    { name: 'Faisalabad', icon: '🏭' },
    { name: 'Multan', icon: '🌇' },
    { name: 'Peshawar', icon: '⛰️' },
    { name: 'Quetta', icon: '🏔️' },
    { name: 'Sialkot', icon: '🏘️' },
    { name: 'Gujranwala', icon: '🌃' },
    { name: 'Hyderabad', icon: '🏙️' },
    { name: 'Bahawalpur', icon: '🕌' },
  ];

  const handleCitySelect = (cityName) => {
    setSelectedCity(cityName);
    // Check if there's a search query in sessionStorage
    const searchQuery = sessionStorage.getItem('searchQuery');
    if (searchQuery) {
      sessionStorage.removeItem('searchQuery');
      navigate(`/services?city=${cityName}&search=${searchQuery}`);
    } else {
      navigate(`/services?city=${cityName}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Select Your City</h1>
          <p className="text-xl text-white/90">Choose your city to find available home services</p>
        </div>
      </div>

      {/* City Selection Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cities.map((city) => (
            <button
              key={city.name}
              onClick={() => handleCitySelect(city.name)}
              className={`p-6 rounded-xl border-2 transition-all duration-200 ${
                selectedCity === city.name
                  ? 'border-primary-600 bg-primary-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-primary-400 hover:shadow-md hover:scale-102'
              }`}
            >
              <div className="text-5xl mb-3 text-center">{city.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 text-center">{city.name}</h3>
              {selectedCity === city.name && (
                <div className="mt-2 text-primary-600 text-center">
                  <svg className="w-6 h-6 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>


      </div>
    </div>
  );
};

export default CitySelection;
