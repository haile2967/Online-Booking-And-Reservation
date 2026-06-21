import React, { useState, useEffect } from 'react';
import { useUser, useAppDispatch, useBookings } from '../store/hooks';
import { createBooking, fetchAvailableSchedules, fetchBookedSchedules } from '../store/bookingsSlice';
import api from '../services/api';

const BookingForm = ({ selectedService, isVisible, onRequestClose, onBookingSubmit }) => {
  const dispatch = useAppDispatch();
  const { user } = useUser();
  const { availableSchedules, bookedSchedules, loading } = useBookings();
  const [formData, setFormData] = useState({
    selectedDate: null,
    startTime: '',
    endTime: '',
    name: user ? user.full_name || '' : '',
    email: user ? user.email || '' : '',
    phone: user ? user.phone || '' : '',
    specialRequests: ''
  });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch available and booked schedules for the selected service
  useEffect(() => {
    if (selectedService && selectedService.service_id) {
      // Get the first day of the current month being displayed
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const startDate = firstDayOfMonth.toISOString().split('T')[0];
      
      console.log('Fetching schedules for:', { serviceId: selectedService.service_id, startDate });
      
      dispatch(fetchAvailableSchedules({ 
        serviceId: selectedService.service_id, 
        startDate 
      }));
      dispatch(fetchBookedSchedules({ 
        serviceId: selectedService.service_id, 
        startDate 
      }));
    }
  }, [selectedService, currentMonth, dispatch]);

  // Calendar helper functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  // Check if a date is booked
  const isDateBooked = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return bookedSchedules && bookedSchedules.some(schedule => {
      const scheduleDate = new Date(schedule.start_date);
      return scheduleDate.toISOString().split('T')[0] === dateStr;
    });
  };

  // Check if a date is available
  const isDateAvailable = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const isAvailable = availableSchedules && availableSchedules.some(schedule => {
      const scheduleDate = new Date(schedule.start_date);
      return scheduleDate.toISOString().split('T')[0] === dateStr;
    });
    
    // Debug logging
    if (date.getDate() === 1) { // Log only for first day of month to avoid spam
      console.log('Checking availability for:', dateStr, {
        availableSchedules: availableSchedules?.length || 0,
        isAvailable
      });
    }
    
    return isAvailable;
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || isDateBooked(date);
  };

  // Check if a date should be shown as available (fallback logic)
  const isDateAvailableForBooking = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // If no schedules are loaded yet, assume all future dates are available
    if (!availableSchedules || availableSchedules.length === 0) {
      return date >= today;
    }
    
    
    const isAvailable = isDateAvailable(date);
    console.log(`Date ${date.toISOString().split('T')[0]} available:`, isAvailable);
    return isAvailable;
 
  };

  const handleCalendarDateClick = (date) => {
    if (!isDateDisabled(date) && isDateAvailableForBooking(date)) {
      handleDateChange(date);
    }
  };

  useEffect(() => {
    console.log('BookingForm props:', { selectedService, isVisible, user });
    setFormData({
      selectedDate: null,
      startTime: '',
      endTime: '',
      name: user ? user.full_name || '' : '',
      email: user ? user.email || '' : '',
      phone: user ? user.phone || '' : '',
      specialRequests: ''
    });
    setFormError(null);
  }, [selectedService, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('handleChange:', { name, value, formData });
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleDateChange = (date) => {
    console.log('handleDateChange:', { date });
    setFormData(prev => ({ ...prev, selectedDate: date }));
    setFormError(null);
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isBooked = isDateBooked(date);
      const isAvailable = isDateAvailableForBooking(date);
      const isDisabled = isDateDisabled(date);
      const isSelected = formData.selectedDate && 
        date.toDateString() === formData.selectedDate.toDateString();
      
      let className = 'p-2 text-sm rounded-lg transition-colors';
      
      if (isSelected) {
        className += ' bg-blue-600 text-white';
      } else if (isBooked) {
        className += ' bg-red-100 text-red-600 cursor-not-allowed';
      } else if (isDisabled) {
        className += ' text-gray-400 cursor-not-allowed';
      } else if (isAvailable) {
        className += ' hover:bg-gray-100 text-gray-700';
      } else {
        className += ' text-gray-400 cursor-not-allowed';
      }
      
      days.push(
        <button
          key={day}
          onClick={() => handleCalendarDateClick(date)}
          disabled={isDisabled}
          className={className}
          title={isBooked ? 'Booked' : isAvailable ? 'Available' : 'Not Available'}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('BookingForm submit:', formData);

    if (!formData.selectedDate) {
      setFormError('Please select a date.');
      return;
    }
    
    // Check if selected date is booked
    if (isDateBooked(formData.selectedDate)) {
      setFormError('This date is already booked. Please select another date.');
      return;
    }
    
    if (!formData.startTime || !formData.endTime) {
      setFormError('Please set start and end times.');
      return;
    }
    const start = new Date(`1970-01-01T${formData.startTime}:00`);
    const end = new Date(`1970-01-01T${formData.endTime}:00`);
    if (start >= end) {
      setFormError('Start time must be before end time.');
      return;
    }
    if (!formData.name || !formData.email || !formData.phone) {
      setFormError('Please provide name, email, and phone.');
      return;
    }

    // Validate phone number format
    const phoneRegex = /^\+251\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setFormError('Phone number must start with +251 followed by 9 digits (e.g., +251900000000).');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Create or get user first
      let userId = user?.user_id;
      
      if (!userId) {
        // Create a new user if they don't exist
        try {
          const userData = {
            fullName: formData.name,
            email: formData.email,
            phone: formData.phone
          };
          
          const userResponse = await api.post('/User', userData);
          userId = userResponse.data.userId || userResponse.data.user_id;
          console.log('Created new user:', userId);
        } catch (userError) {
          console.error('Error creating user:', userError);
          throw new Error('Failed to create user. Please try again.');
        }
      }

      // Find an available schedule for the selected date and time
      const formattedDate = formData.selectedDate.toISOString().split('T')[0];
      console.log('Looking for schedule on date:', formattedDate);
      console.log('Available schedules:', availableSchedules);
      
      let availableSchedule = availableSchedules && availableSchedules.find(schedule => {
        const scheduleDate = new Date(schedule.start_date);
        return scheduleDate.toISOString().split('T')[0] === formattedDate;
      });

      if (!availableSchedule) {
        console.log('No existing schedule found, creating new schedule for date:', formattedDate);
        
        // Create a new schedule for the selected date
        const scheduleData = {
          serviceId: selectedService.service_id,
          startDate: formattedDate,
          startTime: formData.startTime,
          endTime: formData.endTime,
          status: "Available"
        };
        
        try {
          const scheduleResponse = await api.post('/Schedule', scheduleData);
          const newSchedule = scheduleResponse.data;
          
          availableSchedule = {
            schedule_id: newSchedule.scheduleId,
            start_date: formattedDate,
            start_time: formData.startTime,
            end_time: formData.endTime,
            status: "Available"
          };
          
          console.log('Created new schedule:', availableSchedule);
        } catch (scheduleError) {
          console.error('Error creating schedule:', scheduleError);
          throw new Error('Failed to create schedule for the selected date. Please try again.');
        }
      }
        

              // Create booking with the found schedule
        const bookingResponse = await dispatch(createBooking({
          user_id: userId,
          service_id: selectedService.service_id,
          schedule_id: availableSchedule.schedule_id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          special_requests: formData.specialRequests
        })).unwrap();

      console.log('Booking created:', bookingResponse);
      const bookingData = {
        booking_id: bookingResponse.booking_id,
        service_id: selectedService.service_id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        special_requests: formData.specialRequests,
        total_amount: selectedService.base_price,
        selectedDate: formData.selectedDate,
        startTime: formData.startTime,
        endTime: formData.endTime
      };
      console.log('Passing booking data to PaymentForm:', bookingData);
      onBookingSubmit(bookingData);
    } catch (err) {
      console.error('Submission error:', err);
      setFormError(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) {
    console.log('BookingForm not rendered: isVisible is false');
    return null;
  }
  if (!selectedService) {
    console.log('BookingForm not rendered: no selectedService');
    return null;
  }

  console.log('BookingForm rendering with props:', { isVisible, selectedService });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onRequestClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Book {selectedService.name}
              </h2>
              <p className="text-gray-600 mt-1">Complete your reservation</p>
            </div>
          </div>

          {/* Service Info */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{selectedService.name}</h3>
                <p className="text-sm text-gray-600">Capacity: {selectedService.capacity} people</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">${selectedService.base_price.toFixed(2)}</p>
                <p className="text-xs text-gray-500">per booking</p>
              </div>
            </div>
          </div>

          {formError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{formError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Calendar Date Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Date *
              </label>
              {loading ? (
                <div className="bg-white border border-gray-300 rounded-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-gray-600 text-sm">Loading available dates...</p>
                </div>
              ) : (
                <>
                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    {/* Calendar Header */}
                    <div className="flex justify-between items-center mb-4">
                      <button
                        type="button"
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <button
                        type="button"
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2 text-center text-xs font-medium text-gray-500">
                          {day}
                        </div>
                      ))}
                      {renderCalendar()}
                    </div>
                    
                    {/* Legend */}
                    <div className="flex items-center justify-center space-x-4 text-xs">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-1"></div>
                        <span className="text-red-600">Booked</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-600 rounded mr-1"></div>
                        <span className="text-blue-600">Selected</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-1"></div>
                        <span className="text-gray-600">Available</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selected Date Display */}
                  {formData.selectedDate && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: {formData.selectedDate.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="+251900000000"
                  pattern="^\+251\d{9}$"
                  title="Phone number must start with +251 followed by 9 digits"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Format: +251900000000</p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onRequestClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm"
              >
                {isSubmitting ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingForm;