import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ProviderCard from '../components/ProviderCard';
import { servicesAPI, providersAPI } from '../services/api';

const Services = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city') || '');
  const [selectedServiceId, setSelectedServiceId] = useState(searchParams.get('service') || '');
  const [selectedServiceName, setSelectedServiceName] = useState(searchParams.get('serviceName') || '');
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    search: searchParams.get('search') || '',
    rating: '',
    priceRange: '',
    location: ''
  });

  const categories = [...new Set(services.map(s => s.category))];
  const locations = [...new Set(providers.map(p => p.city))];

  // Keep state in sync with URL params
  useEffect(() => {
    setSelectedCity(searchParams.get('city') || '');
    setSelectedServiceId(searchParams.get('service') || '');
    setSelectedServiceName(searchParams.get('serviceName') || '');
  }, [searchParams]);

  // Resolve service ID: URL may have numeric id (static) or UUID (backend). Resolve by name if needed.
  const resolveServiceId = (servicesList, paramId, paramName) => {
    if (!paramId && !paramName) return null;
    const list = servicesList || [];
    const byId = list.find((s) => String(s.id) === String(paramId));
    if (byId) return byId.id;
    if (paramName) {
      const byName = list.find(
        (s) => s.name && paramName && s.name.toLowerCase() === paramName.toLowerCase()
      );
      if (byName) return byName.id;
    }
    return paramId || null;
  };

  // Fetch services first, then providers with resolved service ID (so static 1,2,3 → DB UUID)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!selectedCity) return;

        const servicesRes = await servicesAPI.getAll({ isActive: true, limit: 100 });
        const servicesList = servicesRes?.data?.data || [];
        setServices(servicesList);

        const effectiveServiceId = resolveServiceId(
          servicesList,
          selectedServiceId,
          selectedServiceName
        );

        const providersRes = await providersAPI.getAll({
          city: selectedCity,
          service: effectiveServiceId || undefined,
          status: 'APPROVED',
          limit: 500,
        });
        const list = providersRes?.data?.data || [];
        setProviders(list);
        setFilteredProviders(list);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedCity, selectedServiceId, selectedServiceName]);

  // Redirect to city selection if no city is selected
  useEffect(() => {
    if (!selectedCity) {
      navigate('/select-city', { replace: true });
    }
  }, [selectedCity, navigate]);

  const handleCityChange = () => {
    navigate('/select-city');
  };

  useEffect(() => {
    let filtered = [...providers];

    // Filter by search query (matches provider and their services)
    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(query) ||
        p.bio?.toLowerCase().includes(query) ||
        p.services?.some(ps =>
          ps.service?.name?.toLowerCase().includes(query) ||
          ps.service?.category?.toLowerCase().includes(query)
        )
      );
    }

    // Filter by rating
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(p => p.rating >= minRating);
    }

    setFilteredProviders(filtered);
  }, [filters.search, filters.rating, providers]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    
    // Update URL params
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(filterName, value);
    } else {
      newParams.delete(filterName);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      search: '',
      rating: '',
      priceRange: '',
      location: ''
    });
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* City Banner */}
      {selectedCity && (
        <div className="bg-gray-900 text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm text-white/80">
                  {selectedServiceName ? `${selectedServiceName} in` : 'Services in'}
                </p>
                <p className="text-xl font-bold">{selectedCity}</p>
              </div>
            </div>
            <button
              onClick={handleCityChange}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition text-sm font-medium"
            >
              Change City
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            Browse Service Providers
          </h1>
          <p className="text-gray-600">
            Find the perfect professional for your needs
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
                {(filters.category || filters.rating || filters.priceRange || filters.location) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  disabled={Boolean(selectedServiceId)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rating
                </label>
                <select
                  value={filters.rating}
                  onChange={(e) => handleFilterChange('rating', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Any Rating</option>
                  <option value="4.5">4.5+ ⭐</option>
                  <option value="4.0">4.0+ ⭐</option>
                  <option value="3.5">3.5+ ⭐</option>
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Any Price</option>
                  <option value="0-3000">Rs. 0 - Rs. 3,000</option>
                  <option value="3000-5000">Rs. 3,000 - Rs. 5,000</option>
                  <option value="5000-7000">Rs. 5,000 - Rs. 7,000</option>
                  <option value="7000">Rs. 7,000+</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  disabled={true}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Locations</option>
                  {locations.map((loc, idx) => (
                    <option key={idx} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </aside>

          {/* Provider Listings */}
          <div className="flex-1">
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by name, service, or keyword..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="mb-4 text-gray-600">
                  Found {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''}
                </div>

                {/* Provider Grid */}
                {filteredProviders.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {filteredProviders.map((provider) => (
                      <ProviderCard
                        key={provider.id}
                        provider={provider}
                        selectedServiceId={selectedServiceId}
                        selectedServiceName={selectedServiceName}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-12 text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      No providers found
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Try adjusting your filters or search criteria
                    </p>
                    <button
                      onClick={clearFilters}
                      className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
