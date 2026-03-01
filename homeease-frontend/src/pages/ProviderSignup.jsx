import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, User, Phone, MapPin, Clock, FileText, Award, Briefcase } from 'lucide-react';

const ProviderSignup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated, currentUser } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role.toLowerCase() === 'admin') {
        navigate('/admin/dashboard');
      } else if (currentUser.role.toLowerCase() === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/dashboard');
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Basic Information
    name: '',
    email: '',
    phone: '',
    password: '',
    // Service Information
    serviceCategory: '',
    subServices: '',
    serviceDescription: '',
    experience: '',
    // Location & Coverage
    city: '',
    areasServed: '',
    willingToTravel: 'no',
    // Pricing Information
    startingPrice: '',
    priceType: 'hourly',
    minimumCharge: '',
    // Availability & Schedule
    availableDays: [],
    availableTimeSlots: [],
    emergencyService: 'no',
    // Professional Profile
    shortBio: '',
    languagesSpoken: '',
    teamSize: 'individual',
    role: 'provider'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const serviceCategories = [
    'House Cleaning', 'Plumbing', 'Electrical Work', 'Painting',
    'Pest Control', 'AC Repair', 'Carpentry', 'Lawn Care',
    'Appliance Repair', 'Interior Design'
  ];

  const cities = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Peshawar', 'Quetta', 'Sialkot'];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeSlots = ['Morning (9am-12pm)', 'Afternoon (12pm-4pm)', 'Evening (4pm-8pm)'];

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day]
    }));
  };

  const handleTimeSlotToggle = (slot) => {
    setFormData(prev => ({
      ...prev,
      availableTimeSlots: prev.availableTimeSlots.includes(slot)
        ? prev.availableTimeSlots.filter(s => s !== slot)
        : [...prev.availableTimeSlots, slot]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading for demo
    await new Promise(resolve => setTimeout(resolve, 1000));

    const result = signup(formData);

    if (result.success) {
      navigate('/provider/dashboard');
    }

    setIsLoading(false);
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Become a Service Provider</h1>
          <p className="text-gray-600">Join our platform and grow your business</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((step) => (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-semibold Rs.{
                    currentStep >= step ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  <span className={`mt-2 text-xs font-medium Rs.{
                    currentStep >= step ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {step === 1 && 'Basic Info'}
                    {step === 2 && 'Service Details'}
                    {step === 3 && 'Pricing & Availability'}
                    {step === 4 && 'Profile'}
                  </span>
                </div>
                {step < 4 && (
                  <div className={`flex-1 h-1 mx-4 mb-6 Rs.{
                    currentStep > step ? 'bg-blue-600' : 'bg-gray-300'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>


        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Basic Information</h2>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ahmed Khan"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+92 300-1234567"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Service Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Service Information</h2>

                {/* Service Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Primary Service Category *
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      required
                      value={formData.serviceCategory}
                      onChange={(e) => setFormData({ ...formData, serviceCategory: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a service</option>
                      {serviceCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Sub-Services */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sub-Services Offered *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subServices}
                    onChange={(e) => setFormData({ ...formData, subServices: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Wiring, Installation, Repair, Maintenance"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple services with commas</p>
                </div>

                {/* Service Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service Description *
                  </label>
                  <textarea
                    required
                    value={formData.serviceDescription}
                    onChange={(e) => setFormData({ ...formData, serviceDescription: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Describe your services, expertise, and what makes you stand out..."
                  ></textarea>
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Years of Experience *
                  </label>
                  <div className="relative">
                    <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="0"
                      max="50"
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="5"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <select
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select your city</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Areas Served */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Areas / Neighborhoods Served *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.areasServed}
                    onChange={(e) => setFormData({ ...formData, areasServed: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Gulshan, DHA, Clifton"
                  />
                  <p className="text-xs text-gray-500 mt-1">Separate multiple areas with commas</p>
                </div>

                {/* Willing to Travel */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Willing to Travel Outside Selected Areas? *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="willingToTravel"
                        value="yes"
                        checked={formData.willingToTravel === 'yes'}
                        onChange={(e) => setFormData({ ...formData, willingToTravel: e.target.value })}
                        className="mr-2"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="willingToTravel"
                        value="no"
                        checked={formData.willingToTravel === 'no'}
                        onChange={(e) => setFormData({ ...formData, willingToTravel: e.target.value })}
                        className="mr-2"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Pricing & Availability */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Pricing & Availability</h2>

                {/* Starting Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Starting Price (Rs.) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500">PKR</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.startingPrice}
                      onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2500"
                    />
                  </div>
                </div>

                {/* Price Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Price Type *
                  </label>
                  <select
                    required
                    value={formData.priceType}
                    onChange={(e) => setFormData({ ...formData, priceType: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="fixed">Fixed</option>
                    <option value="inspection">After Inspection</option>
                  </select>
                </div>

                {/* Minimum Charge */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Service Charge (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.minimumCharge}
                    onChange={(e) => setFormData({ ...formData, minimumCharge: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="1500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Note: Final pricing may vary after inspection</p>
                </div>

                {/* Available Days */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Available Days *
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {daysOfWeek.map(day => (
                      <label key={day} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.availableDays.includes(day)}
                          onChange={() => handleDayToggle(day)}
                          className="mr-2"
                        />
                        <span className="text-sm">{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Available Time Slots *
                  </label>
                  <div className="space-y-2">
                    {timeSlots.map(slot => (
                      <label key={slot} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.availableTimeSlots.includes(slot)}
                          onChange={() => handleTimeSlotToggle(slot)}
                          className="mr-2"
                        />
                        <span className="text-sm">{slot}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Emergency Service */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Emergency Service Available?
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="emergencyService"
                        value="yes"
                        checked={formData.emergencyService === 'yes'}
                        onChange={(e) => setFormData({ ...formData, emergencyService: e.target.value })}
                        className="mr-2"
                      />
                      <span>Yes</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="emergencyService"
                        value="no"
                        checked={formData.emergencyService === 'no'}
                        onChange={(e) => setFormData({ ...formData, emergencyService: e.target.value })}
                        className="mr-2"
                      />
                      <span>No</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Professional Profile */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Professional Profile</h2>

                {/* Short Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Short Bio / Introduction *
                  </label>
                  <textarea
                    required
                    value={formData.shortBio}
                    onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tell customers about yourself, your expertise, and why they should choose you..."
                  ></textarea>
                </div>

                {/* Languages Spoken */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Languages Spoken
                  </label>
                  <input
                    type="text"
                    value={formData.languagesSpoken}
                    onChange={(e) => setFormData({ ...formData, languagesSpoken: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Urdu, English, Punjabi"
                  />
                </div>

                {/* Team Size */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Team Size
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="teamSize"
                        value="individual"
                        checked={formData.teamSize === 'individual'}
                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                        className="mr-2"
                      />
                      <span>Individual</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="teamSize"
                        value="small_team"
                        checked={formData.teamSize === 'small_team'}
                        onChange={(e) => setFormData({ ...formData, teamSize: e.target.value })}
                        className="mr-2"
                      />
                      <span>Small Team</span>
                    </label>
                  </div>
                </div>

                {/* Verification Notice */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">📄 Verification Documents</h3>
                  <p className="text-sm text-blue-800 mb-2">
                    In the full version, you'll be required to upload:
                  </p>
                  <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                    <li>Government-issued ID (CNIC/ID card)</li>
                    <li>Proof of skills or certifications (optional)</li>
                    <li>Sample work images (portfolio)</li>
                  </ul>
                  <p className="text-xs text-blue-700 mt-2 italic">
                    For this demo, verification is automatically approved.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold transition Rs.{
                  currentStep === 1
                    ? 'opacity-50 cursor-not-allowed text-gray-400'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Next Step
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Complete Registration</span>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProviderSignup;
