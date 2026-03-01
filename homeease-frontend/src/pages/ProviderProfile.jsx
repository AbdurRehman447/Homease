import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import BookingModal from '../components/BookingModal';
import providers from '../data/providers.json';
import { providersAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ProviderProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatLoading, setChatLoading] = useState(false);

  const selectedCity = searchParams.get('city');

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        // 1. Try fetching from real API first
        try {
          const res = await providersAPI.getById(id);
          if (res.data && res.data.data) {
            const rawData = res.data.data;
            // Flatten first service for compatibility
            const primaryService = rawData.services?.[0];
            const flattened = {
              ...rawData,
              price: primaryService?.price || 0,
              serviceName: primaryService?.service?.name || "Professional Tasker",
              serviceId: primaryService?.serviceId,
              availability: Array.isArray(rawData.availability) ? rawData.availability : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
            };
            setProvider(flattened);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("API fetch failed, falling back to local data", err);
        }

        // 2. Fallback to local providers.json (for mock data)
        // Match as string to handle both numeric (1, 2) and UUID strings
        const localProvider = providers.find(p => p.id.toString() === id.toString());
        if (localProvider) {
          // Ensure availability is an array
          const processed = {
            ...localProvider,
            availability: Array.isArray(localProvider.availability)
              ? localProvider.availability
              : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
          };
          setProvider(processed);
        }
      } catch (error) {
        console.error('Error in ProviderProfile useEffect:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProvider();
  }, [id]);

  const triggerChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!provider) return;

    try {
      setChatLoading(true);
      console.log("Checking bookings for provider:", provider.id, provider.name);

      // Fetch user bookings with this provider
      const response = await bookingsAPI.getAll({ providerId: provider.id });
      const bookingsData = response.data.data.bookings || response.data.data;

      console.log("Bookings found:", bookingsData);

      // Double check that the booking actually belongs to this provider 
      // (in case backend filtering fails)
      const validBooking = bookingsData.find(b => b.providerId === provider.id || b.provider?.id === provider.id);

      if (validBooking) {
        console.log("Opening chat for booking:", validBooking.id);
        window.dispatchEvent(new CustomEvent('open_chat', { detail: { bookingId: validBooking.id } }));
      } else {
        console.log("No valid booking found for this provider.");
        alert("You first have to book this provider then you can chat with him thanks");
      }
    } catch (error) {
      console.error("Error checking bookings for chat:", error);
      alert("You first have to book this provider then you can chat with him thanks");
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
          <p className="text-gray-400 font-medium">Loading expert profile...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-3xl shadow-xl max-w-md mx-auto">
          <div className="text-6xl mb-6">🔍</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Provider Not Found</h2>
          <p className="text-gray-500 mb-8">The professional you are looking for might have moved or updated their profile.</p>
          <button
            onClick={() => navigate('/select-city')}
            className="w-full px-6 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            Browse Other Professionals
          </button>
        </div>
      </div>
    );
  }

  // Mocking more data for a richer profile if not present
  const stats = [
    { label: 'Jobs Done', value: provider.jobsCompleted || '450+', icon: '✅' },
    { label: 'Response Time', value: '< 1 hour', icon: '⚡' },
    { label: 'Member Since', value: '2022', icon: '📅' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section with Cover */}
      <div className="relative h-[250px] md:h-[350px] bg-slate-900 overflow-hidden">
        {provider.coverImage && (
          <img
            src={provider.coverImage}
            className="w-full h-full object-cover opacity-50"
            alt=""
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>

        <div className="absolute inset-x-0 bottom-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-20">
            {/* Avatar Container */}
            <div className="relative -mb-8 md:-mb-12 group">
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 border-[8px] border-white shadow-2xl overflow-hidden flex items-center justify-center transform transition-transform group-hover:scale-105 duration-500">
                {(provider.image || provider.avatar) ? (
                  <img
                    src={provider.image || provider.avatar}
                    alt={provider.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <span className="text-4xl md:text-6xl font-black text-white drop-shadow-md">
                      {(() => {
                        const words = provider.name?.trim().split(/\s+/) || [];
                        if (words.length >= 2) {
                          return (words[0][0] + words[1][0]).toUpperCase();
                        } else if (words.length === 1) {
                          return words[0].slice(0, 2).toUpperCase();
                        }
                        return '??';
                      })()}
                    </span>
                  </div>
                )}
              </div>
              {/* Online Status Badge */}
              <div className="absolute bottom-4 right-4 w-6 h-6 bg-green-500 border-4 border-white rounded-full shadow-lg pulse-animation"></div>
            </div>

            {/* Title & Info */}
            <div className="flex-1 text-center md:text-left pt-6 md:pt-0">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight drop-shadow-xl">
                  {provider.name}
                </h1>
                {provider.verified && (
                  <div className="inline-flex items-center gap-2 bg-blue-500/90 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-[11px] font-black uppercase tracking-widest shadow-xl border border-white/20">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified Expert
                  </div>
                )}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3">
                <p className="text-blue-300 text-sm md:text-xl font-black uppercase tracking-[0.3em] drop-shadow-lg">
                  {provider.serviceName || "Expert Service Provider"}
                </p>
                <span className="w-2 h-2 rounded-full bg-blue-400 opacity-50 hidden md:block"></span>
                <span className="text-white/60 text-sm font-bold hidden md:block">Top Rated Professional</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                <span className="text-2xl mb-1">⭐</span>
                <span className="text-xl font-black text-gray-800">{provider.rating || "5.0"}</span>
                <span className="text-[10px] uppercase font-bold text-gray-400">Rating</span>
              </div>
              {stats.map((stat, i) => (
                <div key={i} className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center">
                  <span className="text-2xl mb-1">{stat.icon}</span>
                  <span className="text-lg md:text-xl font-black text-gray-800">{stat.value}</span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider text-center">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* About Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 p-8 md:p-10">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                Professional Bio
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg italic bg-blue-50/30 p-6 rounded-3xl border-l-4 border-blue-200">
                "{provider.description || provider.bio || "I am a dedicated professional with years of experience in providing high-quality services. My goal is to ensure client satisfaction through hard work and attention to detail."}"
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="p-1.5 bg-yellow-400 rounded-lg text-white">✨</span>
                    Specialties
                  </h3>
                  <ul className="space-y-3">
                    {["Quick Response", "Insured Work", "Own Tools Provided", "Post-Service Cleanup"].map((spec, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-600 text-sm">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                        {spec}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="p-1.5 bg-blue-400 rounded-lg text-white">📍</span>
                    Area Coverage
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">Serving multiple areas in <strong>{provider.location || provider.address}</strong> including:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Phase 1-8", "DHA", "Gulberg", "Near Main Road"].map((area, i) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-semibold">{area}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Availability Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-50 p-8">
              <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-8 bg-green-500 rounded-full"></span>
                Working Hours
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                  const isAvailable = provider.availability?.includes(day);
                  return (
                    <div
                      key={day}
                      className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all duration-300 border ${isAvailable
                        ? 'bg-green-50 border-green-200 text-green-700 shadow-sm scale-105'
                        : 'bg-gray-50 border-gray-100 text-gray-400 grayscale'
                        }`}
                    >
                      <span className="text-xs font-black uppercase tracking-widest">{day}</span>
                      <span className="text-lg">
                        {isAvailable ? '✅' : '💤'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/10 border border-blue-50 overflow-hidden">
                <div className="p-8 pb-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Pricing</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-black rounded-full uppercase">Per Hour</span>
                  </div>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black text-gray-900">Rs. {provider.price || provider.hourlyRate || "2500"}</span>
                    <span className="text-gray-400 font-bold">/hr</span>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => setShowBookingModal(true)}
                      className="w-full py-5 bg-blue-600 text-white rounded-[1.5rem] font-black text-lg transition-all shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                    >
                      <span>📅</span>
                      Book Service
                    </button>

                    <button
                      onClick={triggerChat}
                      disabled={chatLoading}
                      className="w-full py-5 bg-white text-blue-600 border-2 border-blue-100 rounded-[1.5rem] font-black text-lg transition-all hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      <span>{chatLoading ? '⌛' : '💬'}</span>
                      {chatLoading ? 'Checking...' : 'Quick Message'}
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-gray-50/50 border-t border-gray-100 text-center">
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                    🔒 Secure Payments & <br />Verified Background Check
                  </p>
                </div>
              </div>

              {/* Contact (Masked) Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
                <h4 className="font-black text-gray-800 text-sm mb-4 flex items-center gap-2">
                  🛡️ Trust & Privacy
                </h4>
                <div className="space-y-4 opacity-100">
                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-50">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">📧</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Email Verified</p>
                      <p className="text-xs font-bold text-gray-600 truncate">{provider.email?.replace(/(.{3})(.*)(@.*)/, "$1***$3")}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-2xl border border-blue-50">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-xl">📞</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Phone Masked</p>
                      <p className="text-xs font-bold text-gray-600 truncate">{provider.phone?.replace(/(\d{4})(\d+)/, "$1-*******")}</p>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-gray-400 mt-4 text-center italic">Personal details are kept private for your security.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showBookingModal && (
        <BookingModal
          provider={provider}
          selectedCity={selectedCity || provider.location}
          onClose={() => setShowBookingModal(false)}
        />
      )}
    </div>
  );
};

export default ProviderProfile;
