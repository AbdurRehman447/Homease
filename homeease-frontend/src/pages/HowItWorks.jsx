import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState('customer');

  const customerSteps = [
    {
      id: '01',
      title: "AI-Powered Discovery",
      description: "Search for services using natural language (e.g., 'I need a plumber for a leaky tap') or browse our curated categories.",
      icon: "🤖",
      details: ["Natural language AI search", "Location-based filtering", "Verified professional lists"]
    },
    {
      id: '02',
      title: "Compare Professionals",
      description: "Review detailed profiles, performance ratings, and real customer reviews to find the perfect match for your job.",
      icon: "⚖️",
      details: ["Identity verified badges", "Real-time availability", "Transparent hourly rates"]
    },
    {
      id: '03',
      title: "Seamless Booking",
      description: "Book instantly without the friction. Choose your date, time, and address. No account? No problem—book as a guest!",
      icon: "⚡",
      details: ["Guest booking supported", "Optional account creation", "No upfront commitment"]
    },
    {
      id: '04',
      title: "Real-time Collaboration",
      description: "Once booked, use our secure floating chat widget to send photos, share location pins, and discuss job details.",
      icon: "💬",
      details: ["Secure real-time chat", "Photo & location sharing", "Direct provider contact"]
    },
    {
      id: '05',
      title: "Professional Delivery",
      description: "Our top-rated professional arrives at your doorstep on schedule to complete the job with professional precision.",
      icon: "🛠️",
      details: ["Verified background checks", "On-time arrival guarantee", "Quality workmanship"]
    },
    {
      id: '06',
      title: "Confirm & Review",
      description: "Mark the job as complete, handle payments securely, and leave a review to help the community find great talent.",
      icon: "⭐",
      details: ["Secure digital tracking", "Detailed review system", "Booking history access"]
    }
  ];

  const providerSteps = [
    {
      id: '01',
      title: "Join the Elite",
      description: "Register as a professional. We verify your credentials to ensure Homease remains a trusted platform for premium services.",
      icon: "🏢",
      details: ["Professional onboarding", "Skill verification", "Profile optimization"]
    },
    {
      id: '02',
      title: "Set Your Terms",
      description: "You are in control. Define your services, set your hourly rates, and manage your availability calendar with ease.",
      icon: "⚙️",
      details: ["Custom pricing", "Availability management", "Service area selection"]
    },
    {
      id: '03',
      title: "Grow Your Business",
      description: "Receive booking requests directly. Chat with customers to finalize details and build your professional reputation.",
      icon: "📈",
      details: ["Direct customer leads", "Reputation building", "Digital service management"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Dynamic Hero Section */}
      <div className="relative bg-slate-900 overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            How <span className="text-blue-500">HomEase</span> Works
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            The most seamless way to connect with top-tier professionals for your home, from discovery to completion.
          </p>

          <div className="mt-12 inline-flex p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <button
              onClick={() => setActiveTab('customer')}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'customer' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              For Customers
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'provider' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-300 hover:text-white'}`}
            >
              For Professionals
            </button>
          </div>
        </div>
      </div>

      {/* Main Steps Grid */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(activeTab === 'customer' ? customerSteps : providerSteps).map((step, index) => (
            <div
              key={step.id}
              className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl transition-transform group-hover:scale-110 group-hover:rotate-6 duration-500">
                  {step.icon}
                </div>
                <span className="text-5xl font-black text-slate-100 group-hover:text-blue-50 transition-colors duration-500">
                  {step.id}
                </span>
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                {step.title}
              </h3>

              <p className="text-slate-500 font-medium leading-relaxed mb-8 flex-1">
                {step.description}
              </p>

              <div className="space-y-3 pt-6 border-t border-slate-50">
                {step.details.map((detail, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm font-bold text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                    {detail}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Banner */}
      <div className="bg-slate-900 py-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-white mb-4">Trusted by 50,000+ Households</h2>
            <p className="text-slate-400 font-medium">Join the fastest growing home service network in Pakistan.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8 opacity-50">
            <div className="h-8 w-24 bg-white/20 rounded-lg"></div>
            <div className="h-8 w-24 bg-white/20 rounded-lg"></div>
            <div className="h-8 w-24 bg-white/20 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* FAQ CTA */}
      <section className="py-24 max-w-5xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3.5rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/10 rounded-full transition-transform group-hover:scale-150 duration-700"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">
              Ready to simplify <br className="hidden md:block" /> your home life?
            </h2>
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto font-medium">
              Start your first booking today. No account needed, just seamless service.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/select-city"
                className="px-10 py-5 bg-white text-blue-600 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all font-black text-lg active:scale-95"
              >
                Browse Services Now
              </Link>
              <Link
                to="/signup"
                className="px-10 py-5 bg-transparent border-2 border-white/30 text-white rounded-2xl hover:bg-white/10 transition-all font-black text-lg"
              >
                Become a Partner
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
