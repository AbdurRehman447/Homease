import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is HomEase?",
      answer: "HomEase is an online platform that connects customers with trusted local service providers such as electricians, plumbers, mechanics, and other home service professionals."
    },
    {
      question: "How does HomEase work?",
      answer: "You select your city, browse available service providers, choose the one that best fits your needs, and book a service by filling out a simple booking form. The provider then confirms the request."
    },
    {
      question: "Do I need to create an account to book a service?",
      answer: "For a full experience, creating an account is recommended. However, in the demo version, bookings can be shown without full authentication."
    },
    {
      question: "Are the service providers verified?",
      answer: "Yes. All service providers are required to submit identification documents and service details before being listed on the platform. Verification helps ensure safety and quality."
    },
    {
      question: "How are service charges calculated?",
      answer: "Service charges are based on the type of service, estimated work time, and provider rates. The price shown during booking is an estimate and may vary after inspection."
    },
    {
      question: "Is online payment required?",
      answer: "In the demo version, no payment is required. In the full version, secure online payment options may be available."
    },
    {
      question: "Can I reschedule or cancel a booking?",
      answer: "Yes. You can reschedule or cancel a booking from your account before the service starts, subject to the platform's cancellation policy."
    },
    {
      question: "How do ratings and reviews work?",
      answer: "After the service is completed, customers can rate the provider and leave feedback. These ratings help other users choose reliable providers."
    },
    {
      question: "What if I face an issue with a service provider?",
      answer: "If any issue arises, you can raise a complaint through the platform. The admin team reviews disputes and takes appropriate action."
    },
    {
      question: "How does HomEase recommend providers?",
      answer: "HomEase uses smart matching logic to recommend providers based on location, service category, ratings, and availability. AI-based recommendations may also be used in the full version."
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes. User data is protected using secure encryption and is never shared without consent."
    },
    {
      question: "Which areas does HomEase serve?",
      answer: "HomEase initially focuses on urban and semi-urban areas, with plans to expand to more regions in the future."
    },
    {
      question: "Is this a real booking or a demo?",
      answer: "This version is a demo created to showcase the booking flow and user experience. No real providers or payments are involved."
    },
    {
      question: "Can service providers join the platform?",
      answer: "Yes. Service providers can register, create a profile, upload verification documents, and start receiving booking requests after approval."
    },
    {
      question: "Who can I contact for support?",
      answer: "You can contact our support team through the help section or by email for any questions or assistance."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-[#101828] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <HelpCircle className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-gray-300">
            Find answers to common questions about HomEase
          </p>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* FAQ Accordion */}
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-gray-50 transition"
              >
                <div className="flex items-start space-x-4 flex-1">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mt-1">
                    {index + 1}
                  </span>
                  <h3 className="font-semibold text-gray-800 text-xl leading-relaxed">
                    {faq.question}
                  </h3>
                </div>
                <div className="flex-shrink-0 ml-6">
                  {openIndex === index ? (
                    <ChevronUp className="w-6 h-6 text-blue-600" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </button>
              
              {openIndex === index && (
                <div className="px-8 pb-6">
                  <div className="pl-12 pr-4">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions? */}
        <div className="mt-16 bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@homeease.com"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Email Support
            </a>
            <button className="px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold">
              Live Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
