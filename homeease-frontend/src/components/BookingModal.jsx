import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, User, Phone, Mail, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { bookingsAPI, paymentsAPI, authAPI } from '../services/api';

// Reverse geocode lat/lng to address using Nominatim (free, no API key)
async function reverseGeocode(lat, lng) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json', 'Accept-Language': 'en' },
  });
  if (!res.ok) throw new Error('Could not fetch address');
  const data = await res.json();
  const a = data.address || {};
  const area = a.suburb || a.neighbourhood || a.village || a.locality || a.city_district || a.city || '';
  const address = data.display_name || [a.house_number, a.road, a.suburb, a.city].filter(Boolean).join(', ');
  const city = a.city || a.town || a.state || '';
  return { area, address, city };
}

const BookingModal = ({ provider, onClose, selectedCity, bookingServiceId }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  // Steps: 'details' | 'payment' | 'success'
  const [currentStep, setCurrentStep] = useState('details');

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

  // Payment states
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({ phone: currentUser?.phone || '', reference: '' });
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const [coordinates, setCoordinates] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');

  // Fetch Payment Methods on mount
  React.useEffect(() => {
    const fetchMethods = async () => {
      try {
        const response = await paymentsAPI.getMethods();
        const data = response.data;
        if (data.status === 'success') {
          setPaymentMethods(data.data);
          const cod = data.data.find(m => m.name === 'COD');
          if (cod) setSelectedMethod(cod);
        }
      } catch (err) {
        console.error('Failed to fetch payment methods:', err);
      }
    };
    fetchMethods();
  }, []);

  const handleUseCurrentLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const { area, address: addr } = await reverseGeocode(latitude, longitude);
          setBookingData(prev => ({
            ...prev,
            area: area || prev.area,
            address: addr || prev.address,
          }));
          setCoordinates({ lat: latitude, lng: longitude });
        } catch (e) {
          setLocationError('Address could not be detected. Please enter manually.');
        } finally {
          setLocationLoading(false);
        }
      },
      (err) => {
        setLocationLoading(false);
        setLocationError('Unable to get location. Please enter manually.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const goToPayment = (e) => {
    e.preventDefault();
    setCurrentStep('payment');
  };

  const handleFinalSubmit = async () => {
    if (!selectedMethod) {
      setError('Please select a payment method');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Account if requested
      if (!isAuthenticated && createAccount) {
        if (!password || password.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }
        await authAPI.signup({
          name: bookingData.fullName,
          email: bookingData.email,
          phone: bookingData.phone,
          password: password,
          role: 'CUSTOMER'
        });
        const loginRes = await authAPI.login(bookingData.email, password, 'CUSTOMER');
        localStorage.setItem('accessToken', loginRes.data.data.accessToken);
        localStorage.setItem('currentUser', JSON.stringify(loginRes.data.data.user));
      }

      // 2. Create Booking
      const serviceId = bookingServiceId || provider.serviceId || provider.services?.[0]?.serviceId;

      if (!provider.id || !serviceId) {
        throw new Error('Incomplete professional information. Please refresh and try again.');
      }

      const bookingRes = await bookingsAPI.create({
        providerId: provider.id,
        serviceId,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        city: selectedCity || provider.city || provider.location || 'Unknown',
        area: bookingData.area,
        address: bookingData.address,
        coordinates: coordinates || undefined,
        jobDescription: bookingData.jobDescription,
        notes: bookingData.notes || undefined,
      });

      const newBookingId = bookingRes.data.data.booking.id;
      setBookingId(newBookingId);

      // 3. Process Payment (Simulation)
      setIsProcessingPayment(true);

      const paymentResponse = await paymentsAPI.process({
        bookingId: newBookingId,
        methodId: selectedMethod.id,
        details: paymentDetails
      });

      const paymentResult = paymentResponse.data;

      if (paymentResult.status === 'success') {
        setPaymentSuccess(paymentResult.data);
        setCurrentStep('success');
      } else {
        throw new Error(paymentResult.message || 'Payment failed');
      }

    } catch (err) {
      console.error('Final Submission Error:', err);
      const res = err.response?.data;
      const msg = res?.message || err.message || 'Verification failed. Please check your payment details.';
      const details = res?.errors?.map((e) => (typeof e === 'string' ? e : e.message)).join(' ') || '';
      setError(details ? `${msg}: ${details}` : msg);
    } finally {
      setLoading(false);
      setIsProcessingPayment(false);
    }
  };

  const totalEstimate = (provider.price || provider.hourlyRate || 0) * 1.1;

  if (currentStep === 'success') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-xl w-full text-center shadow-2xl animate-fade-in">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-100">
            <svg className="w-14 h-14 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h3 className="text-3xl font-black text-slate-800 mb-2">Order Confirmed!</h3>
          <p className="text-slate-500 font-medium mb-8 tabular-nums">Booking ID: <span className="text-blue-600">#{bookingId.slice(0, 8).toUpperCase()}</span></p>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8 text-left space-y-4">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-slate-400">Payment Status</span>
              <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider ${paymentSuccess?.status === 'ON_HOLD' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'
                }`}>
                {paymentSuccess?.status === 'ON_HOLD' ? 'Verified (Pending Bank)' : 'Paid Successfully'}
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-slate-200 pt-4">
              <span className="text-slate-500 text-sm">Total Paid</span>
              <span className="text-xl font-black text-slate-800">Rs. {totalEstimate.toLocaleString()}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={onClose} className="py-4 font-black text-slate-400 hover:text-slate-600 transition">Dismiss</button>
            <button
              onClick={() => navigate('/customer/dashboard')}
              className="py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              <h2 className="text-2xl font-black text-slate-800">
                {currentStep === 'details' ? 'Service Details' : 'Secure Payment'}
              </h2>
            </div>
            <p className="text-slate-400 text-sm font-bold uppercase tracking-widest px-4">
              Step {currentStep === 'details' ? '1' : '2'} of 2
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {error && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 font-bold text-sm">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          )}

          {currentStep === 'details' ? (
            <form id="booking-form" onSubmit={goToPayment} className="p-6 space-y-8">
              {/* Provider Mini Summary */}
              <div className="bg-slate-50/50 rounded-2xl p-5 flex items-center gap-4 border border-slate-100">
                <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl">
                  {provider.name?.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-800">{provider.name}</h4>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{provider.serviceName}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase">Estimated</p>
                  <p className="text-lg font-black text-blue-600 leading-none">Rs. {totalEstimate.toLocaleString()}</p>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="space-y-4">
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em] text-blue-500">Your Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Full Name</label>
                      <input
                        type="text" required
                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold pl-10"
                        placeholder="John Doe"
                        value={bookingData.fullName}
                        onChange={e => setBookingData({ ...bookingData, fullName: e.target.value })}
                      />
                      <User className="absolute left-3 top-9 w-4 h-4 text-slate-300" />
                    </div>
                    <div className="relative">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Phone Number</label>
                      <input
                        type="tel" required
                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold pl-10"
                        placeholder="03XX XXXXXXX"
                        value={bookingData.phone}
                        onChange={e => setBookingData({ ...bookingData, phone: e.target.value })}
                      />
                      <Phone className="absolute left-3 top-9 w-4 h-4 text-slate-300" />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Email Address</label>
                    <input
                      type="email" required
                      className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold pl-10"
                      placeholder="john@example.com"
                      value={bookingData.email}
                      onChange={e => setBookingData({ ...bookingData, email: e.target.value })}
                    />
                    <Mail className="absolute left-3 top-9 w-4 h-4 text-slate-300" />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em] text-blue-500">Service Info</h3>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Job Description</label>
                    <textarea
                      required
                      className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-100 min-h-[120px]"
                      placeholder="e.g. Broken AC fan, kitchen pipe leaking..."
                      value={bookingData.jobDescription}
                      onChange={e => setBookingData({ ...bookingData, jobDescription: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Date</label>
                      <input
                        type="date" required
                        className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                        value={bookingData.date}
                        onChange={e => setBookingData({ ...bookingData, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Time</label>
                      <select
                        required className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                        value={bookingData.timeSlot}
                        onChange={e => setBookingData({ ...bookingData, timeSlot: e.target.value })}
                      >
                        <option value="">Select</option>
                        <option value="09:00 AM">Morning (9 AM)</option>
                        <option value="02:00 PM">Afternoon (2 PM)</option>
                        <option value="06:00 PM">Evening (6 PM)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em] mb-4 text-blue-500">Your Location</h3>
                  <div className="relative">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Area / Sector</label>
                    <input
                      type="text" required
                      className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold pl-10"
                      placeholder="e.g. DHA Phase 2"
                      value={bookingData.area}
                      onChange={e => setBookingData({ ...bookingData, area: e.target.value })}
                    />
                    <MapPin className="absolute left-3 top-9 w-4 h-4 text-slate-300" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">Address Details</label>
                    <input
                      type="text" required
                      className="w-full bg-slate-50 border-none rounded-xl p-3 text-sm font-bold"
                      placeholder="Flat 4B, Street 12..."
                      value={bookingData.address}
                      onChange={e => setBookingData({ ...bookingData, address: e.target.value })}
                    />
                  </div>
                  <button
                    type="button" onClick={handleUseCurrentLocation}
                    className="text-[10px] font-black text-blue-600 uppercase flex items-center gap-1 hover:bg-blue-50 p-2 rounded-lg transition"
                  >
                    <MapPin className="w-3 h-3" /> {locationLoading ? 'Detecting...' : 'Use My Auto Location'}
                  </button>
                </div>
              </div>

              {!isAuthenticated && (
                <div className="bg-blue-600 rounded-3xl p-6 text-white overflow-hidden relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <h4 className="font-black text-lg mb-2">Save time on next booking?</h4>
                  <p className="text-white/70 text-sm font-bold mb-4">Create an account to track your orders and chat with professionals.</p>
                  <div className="flex items-center gap-4">
                    <input
                      type="checkbox" id="create-acc"
                      className="w-5 h-5 rounded-lg border-none text-indigo-600 focus:ring-0"
                      checked={createAccount}
                      onChange={e => setCreateAccount(e.target.checked)}
                    />
                    <label htmlFor="create-acc" className="font-black text-sm uppercase">Yes, create my account</label>
                  </div>
                  {createAccount && (
                    <input
                      type="password" required placeholder="Choose Password"
                      className="mt-4 w-full bg-white/10 border border-white/20 rounded-xl p-3 text-sm font-bold placeholder:text-white/50 focus:outline-none"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  )}
                </div>
              )}
            </form>
          ) : (
            <div className="p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
              {/* Summary Mini Bar */}
              <div className="flex justify-between items-center bg-slate-900 text-white rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/10 rounded-lg"><Clock className="w-4 h-4" /></div>
                  <span className="text-xs font-black uppercase tracking-widest">{bookingData.date} @ {bookingData.timeSlot}</span>
                </div>
                <span className="text-xl font-black">Rs. {totalEstimate.toLocaleString()}</span>
              </div>

              <div className="space-y-4">
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em] mb-4 text-blue-500">Choose Gateway</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paymentMethods.map(method => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedMethod(method)}
                      className={`relative p-5 rounded-2xl border-2 text-left transition-all group ${selectedMethod?.id === method.id
                        ? 'border-blue-600 bg-blue-50/30'
                        : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${method.name === 'JazzCash' ? 'bg-red-600 text-white' :
                          method.name === 'Easypaisa' ? 'bg-green-500 text-white' :
                            'bg-slate-800 text-white'
                          }`}>
                          {method.name.charAt(0)}
                        </div>
                        {selectedMethod?.id === method.id && (
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <h4 className="font-black text-slate-800 ">{method.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight">{method.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {selectedMethod?.type === 'wallet' && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4 animate-in fade-in duration-500">
                  <label className="block text-[10px] font-black text-slate-400 uppercase">{selectedMethod.name} Phone Number</label>
                  <div className="relative">
                    <input
                      type="tel"
                      className="w-full bg-white border border-slate-200 rounded-xl p-4 font-black transition-focus focus:ring-4 focus:ring-blue-100"
                      placeholder="03XX XXXXXXX"
                      value={paymentDetails.phone}
                      onChange={e => setPaymentDetails({ ...paymentDetails, phone: e.target.value })}
                    />
                    <Phone className="absolute right-4 top-4 text-slate-300" />
                  </div>
                  <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                    You will receive a notification on your {selectedMethod.name} app to enter your PIN after clicking confirm.
                  </p>
                </div>
              )}

              {selectedMethod?.type === 'bank' && (
                <div className="bg-blue-600 rounded-3xl p-6 text-white space-y-4 shadow-xl">
                  <h4 className="font-black text-sm uppercase tracking-widest text-white/60">Official Bank Details</h4>
                  <div className="grid grid-cols-2 gap-y-4 text-sm font-bold">
                    <div><p className="text-white/50 text-[10px] uppercase">Account Title</p><p>Homease Services Pvt.</p></div>
                    <div><p className="text-white/50 text-[10px] uppercase">Bank Name</p><p>Alfalah Bank</p></div>
                    <div className="col-span-2"><p className="text-white/50 text-[10px] uppercase">Account / IBAN</p><p className="text-lg font-black tracking-wider">0451 100567 889</p></div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <label className="block text-[10px] font-black text-white/50 uppercase mb-2">Transaction Reference ID</label>
                    <input
                      type="text"
                      className="w-full bg-white border-none rounded-xl p-4 text-slate-800 font-black"
                      placeholder="e.g. TR-2024..."
                      value={paymentDetails.reference}
                      onChange={e => setPaymentDetails({ ...paymentDetails, reference: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 rounded-b-3xl">
          <div className="flex gap-4">
            {currentStep === 'payment' && (
              <button
                onClick={() => setCurrentStep('details')}
                className="flex-1 py-4 font-black text-slate-400 hover:text-slate-600 transition"
              >
                Back
              </button>
            )}
            <button
              form={currentStep === 'details' ? 'booking-form' : undefined}
              onClick={currentStep === 'payment' ? handleFinalSubmit : undefined}
              disabled={loading || isProcessingPayment}
              className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95 transition flex items-center justify-center gap-3"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {selectedMethod?.type === 'wallet' ? 'Validating Wallet PIN...' : 'Verifying Transaction...'}
                </>
              ) : loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating Order...
                </>
              ) : (
                currentStep === 'details' ? 'Select Payment' : 'Confirm Order & Pay'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
