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

const MultipleBookingServices = () => {
  console.log('MultipleBookingServices component loaded');
  const dispatch = useAppDispatch();
  const { filteredServices, categories, resources, loading, error, searchTerm, maxPrice, selectedCategory } = useServices();
  const { user } = useUser();
  const [selectedServices, setSelectedServices] = useState([]);
  const [bookingStep, setBookingStep] = useState('selection'); // selection, booking, payment
  const [currentBookingIndex, setCurrentBookingIndex] = useState(0);
  const [bookingData, setBookingData] = useState([]);
  const [userInfo, setUserInfo] = useState({
    name: user ? (user.full_name || '') : '',
    email: user ? (user.email || '') : '',
    phone: user ? (user.phone || '') : ''
  });
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [currentService, setCurrentService] = useState(null);
  const [currentBookingData, setCurrentBookingData] = useState(null);
  const hasFetchedData = useRef(false);

  useEffect(() => {
    if (!hasFetchedData.current && !loading && !error) {
      hasFetchedData.current = true;
      dispatch(fetchServicesAndCategories());
    }
  }, [dispatch, loading, error]);

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.service_id === service.service_id);
      if (isSelected) {
        return prev.filter(s => s.service_id !== service.service_id);
      } else {
        return [...prev, service];
      }
    });
  };

  const calculateTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + service.base_price, 0);
  };

  const handleBookSelectedServices = () => {
    if (selectedServices.length === 0) {
      alert('Please select at least one service to book.');
      return;
    }
    setBookingStep('booking');
    setCurrentBookingIndex(0);
    setBookingData([]);
    setShowBookingForm(true);
    setCurrentService(selectedServices[0]);
  };

  const handleBookingSubmit = (bookingData) => {
    const newBookingData = {
      ...bookingData,
      service: currentService
    };
    
    setBookingData(prev => [...prev, newBookingData]);
    
    // Move to next service or finish booking process
    const nextIndex = currentBookingIndex + 1;
    if (nextIndex < selectedServices.length) {
      setCurrentBookingIndex(nextIndex);
      setCurrentService(selectedServices[nextIndex]);
      setShowBookingForm(false);
      setTimeout(() => setShowBookingForm(true), 100);
    } else {
      // All services booked, show user info form
      setShowBookingForm(false);
      setBookingStep('userInfo');
    }
  };

  const handleUserInfoSubmit = (e) => {
    e.preventDefault();
    if (!userInfo.name || !userInfo.email || !userInfo.phone) {
      alert('Please fill in all required fields.');
      return;
    }
    
    // Validate phone number format
    const phoneRegex = /^\+251\d{9}$/;
    if (!phoneRegex.test(userInfo.phone)) {
      alert('Phone number must start with +251 followed by 9 digits (e.g., +251900000000).');
      return;
    }
    
    setBookingStep('payment');
    setShowPaymentForm(true);
    setCurrentBookingData({
      ...bookingData[0],
      name: userInfo.name,
      email: userInfo.email,
      phone: userInfo.phone,
      total_amount: calculateTotalPrice()
    });
  };

  const handlePaymentClose = () => {
    setShowPaymentForm(false);
    setBookingStep('selection');
    setSelectedServices([]);
    setBookingData([]);
    setCurrentBookingIndex(0);
    setUserInfo({
      name: user ? (user.full_name || '') : '',
      email: user ? (user.email || '') : '',
      phone: user ? (user.phone || '') : ''
    });
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

  const servicesByCategory = filteredServices.reduce((acc, service) => {
    const category = categories.find(cat => cat.category_id === service.category_id);
    const categoryName = category ? category.name : 'Unknown Category';
    
    if (!acc[categoryName]) {
      acc[categoryName] = { category, services: [] };
    }
    acc[categoryName].services.push(service);
    return acc;
  }, {});

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Multiple Service Booking
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Select multiple services and book them together for convenience.
          </p>
        </div>

        {/* Selected Services Cart */}
        {selectedServices.length > 0 && (
          <div className="mb-6 bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Selected Services ({selectedServices.length})
              </h3>
              <button
                onClick={() => setSelectedServices([])}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-2">
              {selectedServices.map((service) => (
                <div key={service.service_id} className="flex justify-between items-center bg-white rounded-lg p-3 border border-blue-100">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => handleServiceToggle(service)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">{service.name}</h4>
                      <p className="text-sm text-gray-600">Capacity: {service.capacity} people</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    ${service.base_price.toFixed(2)}
                  </span>
                </div>
              ))}
              
              <div className="border-t border-blue-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    ${calculateTotalPrice().toFixed(2)}
                  </span>
                </div>
                <button
                  onClick={handleBookSelectedServices}
                  className="w-full mt-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 font-medium"
                >
                  Book Selected Services
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compact Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            className="px-3 py-2 border rounded text-sm w-full sm:w-auto"
          />
          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => dispatch(setMaxPrice(e.target.value))}
            className="px-3 py-2 border rounded text-sm w-full sm:w-auto"
          />
          <select
            value={selectedCategory}
            onChange={(e) => dispatch(setSelectedCategory(e.target.value))}
            className="px-3 py-2 border rounded text-sm w-full sm:w-auto"
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
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
          >
            Clear
          </button>
        </div>

        {/* User Info Form */}
        {bookingStep === 'userInfo' && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
                <p className="text-gray-600 mb-6">Please provide your contact details for all bookings.</p>
                
                <form onSubmit={handleUserInfoSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={userInfo.name}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={userInfo.phone}
                      onChange={(e) => setUserInfo(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+251900000000"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">Format: +251900000000</p>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setBookingStep('selection')}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Services grouped by category */}
        {Object.keys(servicesByCategory).length === 0 ? (
          <p className="text-center text-gray-600">No services available.</p>
        ) : (
          Object.entries(servicesByCategory).map(([categoryName, categoryData]) => (
            <div key={categoryName} className="mb-8">
              <div className="border-b border-gray-200 pb-3 mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {categoryName}
                </h3>
                {categoryData.category?.description && (
                  <p className="text-gray-600 mt-1 text-sm">
                    {categoryData.category.description}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryData.services.map((service) => {
                  const serviceResources = resources.filter(res => 
                    res.service_id === service.service_id || res.serviceId === service.service_id
                  );
                  const isSelected = selectedServices.some(s => s.service_id === service.service_id);
                  
                  return (
                                         <div key={service.service_id} className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                       isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-100'
                     } flex flex-col h-full`}>
                       <div className="p-6 flex-1">
                         <div className="flex justify-between items-start mb-4">
                           <div className="flex items-center space-x-3">
                             <input
                               type="checkbox"
                               checked={isSelected}
                               onChange={() => handleServiceToggle(service)}
                               className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                             />
                             <h4 className="text-xl font-semibold text-gray-900">
                               {service.name}
                             </h4>
                           </div>
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
                                       <p className="font-medium text-gray-800">{resource.name}</p>
                                       <p className="text-sm text-gray-600">Type: {resource.type}</p>
                                       <p className="text-sm text-gray-600">Quantity: {resource.quantity} {resource.unit}</p>
                                     </div>
                                     <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                       {resource.type}
                                     </span>
                                   </div>
                                   {resource.address && (
                                     <p className="text-xs text-gray-500 mt-1">📍 {resource.address}</p>
                                   )}
                                 </div>
                               ))}
                             </div>
                           </div>
                         )}
                       </div>

                       {/* Button at bottom of card */}
                       <div className="p-6 pt-0">
                         <button
                           onClick={() => handleServiceToggle(service)}
                           disabled={service.status !== 'Available'}
                           className={`w-full px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                             service.status === 'Available' 
                               ? isSelected
                                 ? 'bg-blue-700 text-white hover:bg-blue-800 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                                 : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                               : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                           }`}
                         >
                           {service.status === 'Available' 
                             ? isSelected ? 'Remove from Selection' : 'Add to Selection'
                             : 'Not Available'
                           }
                         </button>
                       </div>
                     </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* Booking Form Modal */}
        {showBookingForm && currentService && (
          <BookingForm
            selectedService={currentService}
            isVisible={showBookingForm}
            onRequestClose={() => {
              setShowBookingForm(false);
              setBookingStep('selection');
            }}
            onBookingSubmit={handleBookingSubmit}
          />
        )}

        {/* Payment Form Modal */}
        {showPaymentForm && currentBookingData && (
          <PaymentForm
            bookingData={currentBookingData}
            selectedService={currentService}
            isVisible={showPaymentForm}
            onRequestClose={handlePaymentClose}
          />
        )}
      </div>
    </section>
  );
};

export default MultipleBookingServices; 