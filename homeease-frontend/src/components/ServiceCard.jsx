import React from 'react';
import { useNavigate } from 'react-router-dom';

const ServiceCard = ({ service }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (service?.id) sessionStorage.setItem('selectedServiceId', service.id);
    if (service?.name) sessionStorage.setItem('selectedServiceName', service.name);
    navigate('/select-city');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center group hover:-translate-y-1 w-full"
    >
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
        {service.icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        {service.name}
      </h3>
      <p className="text-gray-600 text-sm mb-3">
        {service.description}
      </p>
      <div className="mt-auto">
        <p className="text-primary-600 font-semibold">
          Starting at Rs. {service.basePrice}
        </p>
        <p className="text-gray-500 text-xs mt-1">
          {service.duration}
        </p>
      </div>
      {service.isPopular && (
        <span className="absolute top-2 right-2 bg-secondary-500 text-white text-xs px-2 py-1 rounded-full">
          Popular
        </span>
      )}
    </button>
  );
};

export default ServiceCard;
