import React, { useState, useEffect, useRef } from 'react';
import { useServices, useUser, useAppDispatch } from '../store/hooks';
import {
  setSearchTerm,
  setMaxPrice,
  setSelectedCategory,
  clearFilters as clearServiceFilters,
  fetchServicesAndCategories
} from '../store/servicesSlice';
import BookingForm from './BookingForm';
import PaymentForm from './PaymentForm';

const Services = () => {
  const dispatch = useAppDispatch();
  const { filteredServices, categories, resources, loading, error, searchTerm, maxPrice, selectedCategory } = useServices();
  const { user } = useUser();
  const [isBookingFormVisible, setIsBookingFormVisible] = useState(false);
  const [isPaymentFormVisible, setIsPaymentFormVisible] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const hasFetchedData = useRef(false);

  // Fetch services only once when component mounts
  useEffect(() => {
    if (!hasFetchedData.current && !loading && !error) {
      hasFetchedData.current = true;
      dispatch(fetchServicesAndCategories());
    }
  }, [dispatch, loading, error]);

  const handleBook = (service) => {
    console.log('handleBook clicked:', { service });
    if (!service || !service.service_id || !service.name || !service.base_price) {
      console.error('Invalid service:', service);
      alert('Invalid service selected. Please try again.');
      return;
    }
    setSelectedService(service);
    setIsBookingFormVisible(true);
    setIsPaymentFormVisible(false);
    console.log('Booking form should display:', { isBookingFormVisible: true, selectedService: service });
  };

  const handleBookingSubmit = (data) => {
    console.log('handleBookingSubmit:', data);
    setBookingData(data);
    setIsBookingFormVisible(false);
    setIsPaymentFormVisible(true);
    console.log('Payment form should display:', { isPaymentFormVisible: true, bookingData: data });
  };

  const closeForms = () => {
    console.log('Closing forms');
    setIsBookingFormVisible(false);
    setIsPaymentFormVisible(false);
    setSelectedService(null);
    setBookingData(null);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  // Group services by category with proper category mapping
  const servicesByCategory = filteredServices.reduce((acc, service) => {
    const category = categories.find(cat => cat.category_id === service.category_id);
    const categoryName = category ? category.name : 'Unknown Category';
    
    if (!acc[categoryName]) {
      acc[categoryName] = {
        category: category,
        services: []
      };
    }
    acc[categoryName].services.push(service);
    return acc;
  }, {});

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Defense Club Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Book your Gym, Golf, Hall, or Kinder Playing services with ease.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search by service name or description"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-1/4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => dispatch(setMaxPrice(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-1/4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={selectedCategory}
            onChange={(e) => dispatch(setSelectedCategory(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-full sm:w-1/4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.category_id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => dispatch(clearServiceFilters())}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium w-full sm:w-auto"
          >
            Clear Filters
          </button>
        </div>

        {/* Services grouped by category */}
        {Object.keys(servicesByCategory).length === 0 ? (
          <p className="text-center text-gray-600">No services available.</p>
        ) : (
          Object.entries(servicesByCategory).map(([categoryName, categoryData]) => (
            <div key={categoryName} className="mb-12">
              <div className="border-b border-gray-200 pb-4 mb-6">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {categoryName}
                </h3>
                {categoryData.category?.description && (
                  <p className="text-gray-600 mt-2">
                    {categoryData.category.description}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {categoryData.services.map((service) => {
                  // Get resources for this specific service
                  const serviceResources = resources.filter(res => 
                    res.service_id === service.service_id || res.serviceId === service.service_id
                  );
                  
                  return (
                    <div key={service.service_id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                      <div className="p-6 flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-xl font-semibold text-gray-900">
                            {service.name}
                          </h4>
                          <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                            service.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {service.status}
                          </span>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-blue-600">
                              ${service.base_price.toFixed(2)}
                            </span>
                            <span className="text-sm text-gray-500">per booking</span>
                          </div>
                        </div>
                        
                        <div className="mb-4 space-y-2">
                          <div className="flex items-center text-gray-600">
                            <span className="mr-2">👥</span>
                            <span>Capacity: {service.capacity} {service.capacity === 1 ? 'person' : 'people'}</span>
                          </div>
                        </div>

                        {/* Resources Section */}
                        {serviceResources.length > 0 && (
                          <div className="mb-4">
                            <p className="text-gray-700 font-semibold mb-2">Available Resources:</p>
                            <div className="space-y-2">
                              {serviceResources.map(resource => (
                                <div key={resource.resource_id} className="bg-gray-50 p-3 rounded">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="font-medium text-gray-800">
                                        {resource.name}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Type: {resource.type}
                                      </p>
                                      <p className="text-sm text-gray-600">
                                        Quantity: {resource.quantity} {resource.unit}
                                      </p>
                                    </div>
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      {resource.type}
                                    </span>
                                  </div>
                                  {resource.address && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      📍 {resource.address}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Button at the bottom */}
                      <div className="p-6 pt-0">
                        <button
                          onClick={() => handleBook(service)}
                          className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                            service.status === 'Available' 
                              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5' 
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={service.status !== 'Available'}
                        >
                          {service.status === 'Available' ? 'Book Now' : 'Not Available'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Forms */}
        {isBookingFormVisible && selectedService && (
          <BookingForm
            selectedService={selectedService}
            isVisible={isBookingFormVisible}
            onRequestClose={closeForms}
            onBookingSubmit={handleBookingSubmit}
          />
        )}
        {isPaymentFormVisible && selectedService && bookingData && (
          <PaymentForm
            bookingData={bookingData}
            isVisible={isPaymentFormVisible}
            onRequestClose={closeForms}
            selectedService={selectedService}
          />
        )}
      </div>
    </section>
  );
};

export default Services;