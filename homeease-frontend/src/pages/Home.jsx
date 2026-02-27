import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import services from '../data/services.json';

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  const popularServices = services.filter(s => s.popular).slice(0, 6);

  // Dynamic placeholders
  const placeholders = [
    "Plumber near me",
    "AC repair today",
    "Home cleaning this weekend",
    "Electrician service",
    "Painting professional",
  ];

  // Service suggestions with icons
  const serviceSuggestions = [
    { name: "Plumber", icon: "🔧", category: "Home Repair" },
    { name: "Electrician", icon: "⚡", category: "Home Repair" },
    { name: "House Cleaning", icon: "🧹", category: "Cleaning" },
    { name: "AC Repair", icon: "❄️", category: "Home Repair" },
    { name: "Painting", icon: "🎨", category: "Home Improvement" },
    { name: "Pest Control", icon: "🐛", category: "Home Repair" },
    { name: "Lawn Care", icon: "🌿", category: "Outdoor" },
    { name: "Carpentry", icon: "🔨", category: "Home Improvement" },
  ];

  // Rotate placeholder text
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Filter suggestions based on search
  const filteredSuggestions = searchQuery
    ? serviceSuggestions.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : serviceSuggestions.slice(0, 6);

  const handleBrowseServices = () => {
    navigate('/select-city');
  };
  const categories = [...new Set(services.map(s => s.category))];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Store search query temporarily and go to city selection
      sessionStorage.setItem('searchQuery', searchQuery);
      navigate('/select-city');
    } else {
      navigate('/select-city');
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedSuggestionIndex >= 0) {
        handleSuggestionClick(filteredSuggestions[selectedSuggestionIndex].name);
      } else {
        handleSearch(e);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (serviceName) => {
    setSearchQuery(serviceName);
    setShowSuggestions(false);
    sessionStorage.setItem('searchQuery', serviceName);
    navigate('/select-city');
  };

  const handleCategoryClick = (categoryName) => {
    setSearchQuery(categoryName);
    sessionStorage.setItem('searchQuery', categoryName);
    navigate('/select-city');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gray-900 text-white relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle, #60a5fa 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Animated Heading */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-fade-in">
              Your Home Services,
              <br />
              <span className="text-blue-400">Simplified</span>
            </h1>
            <p className="text-lg md:text-xl mb-6 text-gray-200">
              Book trusted professionals for all your home needs in just a few clicks
            </p>

            {/* Intelligent Search Bar with Autocomplete */}
            <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6 relative">
              <div className="relative">
                <div className="flex flex-col sm:flex-row gap-3 bg-white rounded-xl p-2 shadow-2xl">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={placeholders[placeholderIndex]}
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyDown={handleKeyDown}
                      className="w-full px-6 py-4 text-gray-800 rounded-lg focus:outline-none text-lg placeholder-gray-400"
                    />
                    
                    {/* Autocomplete Suggestions */}
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50">
                        {filteredSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleSuggestionClick(suggestion.name)}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 transition ${
                              index === selectedSuggestionIndex ? 'bg-blue-50' : ''
                            }`}
                          >
                            <span className="text-2xl">{suggestion.icon}</span>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-800">{suggestion.name}</p>
                              <p className="text-xs text-gray-500">{suggestion.category}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition font-semibold text-lg shadow-lg transform hover:scale-105"
                  >
                    Find Professionals
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-2 text-center">Try: AC Repair, Electrician, Deep Cleaning</p>
              </div>
            </form>

            {/* Trust Signals */}
            <div className="flex flex-wrap justify-center items-center gap-6 mb-6 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-lg">⭐</span>
                <span className="text-gray-300">4.8 rating from 12,000+ customers</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400 text-lg">🛡️</span>
                <span className="text-gray-300">Verified & Background-Checked</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400 text-lg">⚡</span>
                <span className="text-gray-300">Same-day service available</span>
              </div>
            </div>

            {/* Category Pills - Clickable */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {[
                { name: 'Cleaning', icon: '🧹' },
                { name: 'Home Repair', icon: '🔧' },
                { name: 'Home Improvement', icon: '🏠' },
                { name: 'Outdoor', icon: '🌿' },
              ].map((cat, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg flex items-center gap-2 group"
                >
                  <span className="text-lg group-hover:scale-125 transition-transform">{cat.icon}</span>
                  <span className="font-medium">{cat.name}</span>
                </button>
              ))}
            </div>

            {/* How It Works Hint */}
            <div className="text-gray-400 text-sm flex items-center justify-center gap-2">
              <span className="opacity-60">Search</span>
              <span>→</span>
              <span className="opacity-60">Compare</span>
              <span>→</span>
              <span className="opacity-60">Book in minutes</span>
            </div>

            {/* Value Props */}
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
              <span className="px-3 py-1 bg-white/5 rounded-full">✓ No booking fees</span>
              <span className="px-3 py-1 bg-white/5 rounded-full">✓ Free cancellation</span>
              <span className="px-3 py-1 bg-white/5 rounded-full">✓ Prices you'll love</span>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {categories.slice(0, 4).map((category, idx) => (
                <Link
                  key={idx}
                  to={`/services?category=${category}`}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition text-sm"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Popular Services
          </h2>
          <p className="text-gray-600 text-lg">
            Most booked services by our customers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {popularServices.map((service) => (
            <div key={service.id} className="relative">
              <ServiceCard service={service} />
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            to="/services"
            className="inline-block px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            View All Services
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg">
              Get your service done in 3 simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">1. Browse & Select</h3>
              <p className="text-gray-600">
                Choose from our wide range of services and view verified professional profiles
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📅</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">2. Book Instantly</h3>
              <p className="text-gray-600">
                Select your preferred date and time, confirm your booking in seconds
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">✅</span>
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800">3. Get It Done</h3>
              <p className="text-gray-600">
                Our professional arrives on time and completes the job to your satisfaction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Why Choose HomEase?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-3">🛡️</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Verified Professionals</h3>
              <p className="text-gray-600 text-sm">
                All providers are background-checked and verified
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Best Prices</h3>
              <p className="text-gray-600 text-sm">
                Transparent pricing with no hidden charges
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-3">⭐</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Quality Service</h3>
              <p className="text-gray-600 text-sm">
                Rated and reviewed by thousands of customers
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-lg mb-2 text-gray-800">Quick Booking</h3>
              <p className="text-gray-600 text-sm">
                Book services instantly with just a few clicks
              </p>
            </div>
          </div>
        </div>
      </section>

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
            <button
              onClick={handleBrowseServices}
              className="px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-100 transition font-semibold text-lg shadow-lg"
            >
              Browse Services
            </button>
            <Link
              to="/signup"
              className="px-8 py-4 bg-primary-700 border-2 border-white text-white rounded-lg hover:bg-primary-800 transition font-semibold text-lg"
            >
              Sign Up Free
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
