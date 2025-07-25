
import React from 'react';
import { ServiceCategories } from '@/components/services/ServiceCategories';

const Services = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Service Providers
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find verified professionals for your property needs. From movers to decorators, 
            we've got you covered.
          </p>
        </div>

        {/* Service Categories */}
        <ServiceCategories />
      </div>
    </div>
  );
};

export default Services;
