import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About HomEase</h1>
          <p className="text-xl text-gray-300">Your Trusted Home Services Platform</p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Our Mission</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            HomEase is dedicated to simplifying home services by connecting homeowners with trusted, verified professionals.
            Our platform bridges the gap between customers seeking quality home services and skilled service providers looking
            to grow their business.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed">
            We believe that finding reliable home services should be easy, transparent, and hassle-free. Through our innovative
            platform, we're making quality home services accessible to everyone while empowering service professionals to reach
            more customers and build successful businesses.
          </p>
        </div>

        {/* What We Offer */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6">
              <div className="text-5xl mb-4 text-center">🏠</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">For Homeowners</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Access to verified service professionals</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Transparent pricing and reviews</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Easy booking and scheduling</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Wide range of services</span>
                </li>
              </ul>
            </div>

            <div className="p-6">
              <div className="text-5xl mb-4 text-center">👨‍🔧</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">For Service Providers</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Expand your customer base</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Manage bookings efficiently</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Build your professional reputation</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Flexible scheduling</span>
                </li>
              </ul>
            </div>

            <div className="p-6">
              <div className="text-5xl mb-4 text-center">🔒</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">Trust & Safety</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Verified professional profiles</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Background checks</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Customer reviews and ratings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-primary-600 mr-2">✓</span>
                  <span>Secure payment processing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Project Purpose */}
        <div className="rounded-2xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Project Purpose</h2>
          <p className="text-lg leading-relaxed mb-4 text-gray-700">
            This project serves as a comprehensive demonstration of a modern web-based home services marketplace platform.
            It showcases the complete user journey from service discovery to booking completion, incorporating industry
            best practices in user experience design and interface development.
          </p>
          <p className="text-lg leading-relaxed mb-4 text-gray-700">
            Built as a frontend-only prototype, HomEase demonstrates the core functionalities and interactions of a
            service marketplace without backend integration. It utilizes React.js for component-based architecture,
            Tailwind CSS for responsive styling, and React Router for seamless navigation.
          </p>
          <p className="text-lg leading-relaxed text-gray-700">
            The platform simulates three distinct user roles (Customers, Service Providers, and Administrators), each
            with tailored dashboards and features. This comprehensive approach provides a realistic preview of how the
            final integrated system would function in a production environment.
          </p>
        </div>

        {/* Developer Information */}
        <div className="p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Developer Information</h2>
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                SA
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Shuja Ahmad</h3>
                <p className="text-primary-600 font-semibold mb-4">Software Engineering Student</p>
                <div className="space-y-2 text-gray-700">
                  <p className="flex items-center justify-center md:justify-start">
                    <span className="font-semibold mr-2">Registration:</span>
                    <span>FA-2022/BSSE/145/D</span>
                  </p>
                  <p className="flex items-center justify-center md:justify-start">
                    <span className="font-semibold mr-2">📞 Phone:</span>
                    <a href="tel:03331483696" className="text-primary-600 hover:underline">0333-1483696</a>
                  </p>
                  <p className="flex items-center justify-center md:justify-start">
                    <span className="font-semibold mr-2">📧 Email:</span>
                    <a href="mailto:Shujaahmad795@gmail.com" className="text-primary-600 hover:underline">Shujaahmad795@gmail.com</a>
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 p-6 bg-gray-100 rounded-xl">
              <h4 className="font-semibold text-gray-800 mb-3 text-center">About the Developer</h4>
              <p className="text-gray-700 leading-relaxed text-center">
                A dedicated Software Engineering student passionate about creating innovative web solutions.
                This project demonstrates proficiency in modern web technologies including React.js, Tailwind CSS,
                and responsive design principles. Committed to building user-centric applications that solve real-world problems.
              </p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="mt-12 p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">⚛️</span>
              </div>
              <h4 className="font-semibold text-gray-800">React.js</h4>
              <p className="text-sm text-gray-600">Frontend Framework</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-cyan-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🎨</span>
              </div>
              <h4 className="font-semibold text-gray-800">Tailwind CSS</h4>
              <p className="text-sm text-gray-600">Styling</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">🛣️</span>
              </div>
              <h4 className="font-semibold text-gray-800">React Router</h4>
              <p className="text-sm text-gray-600">Navigation</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">⚡</span>
              </div>
              <h4 className="font-semibold text-gray-800">Vite</h4>
              <p className="text-sm text-gray-600">Build Tool</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-24 max-w-6xl mx-auto px-4 text-center">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[3.5rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden group border border-white/5">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full transition-transform group-hover:scale-150 duration-700"></div>
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">
              Ready to Experience HomEase?
            </h2>
            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto font-medium">
              Start your journey with Pakistan's most trusted home services platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                to="/select-city"
                className="px-10 py-5 bg-white text-blue-600 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all font-black text-lg active:scale-95 shadow-lg shadow-blue-500/10"
              >
                Browse Services
              </Link>
              <Link
                to="/signup"
                className="px-10 py-5 bg-transparent border-2 border-white/20 text-white rounded-2xl hover:bg-white/5 transition-all font-black text-lg"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
