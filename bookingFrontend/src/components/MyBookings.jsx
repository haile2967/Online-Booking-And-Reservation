import React, { useEffect, useRef } from 'react';
import { useBookings, useAppDispatch } from '../store/hooks';
import { fetchBookings } from '../store/bookingsSlice';

const MyBookings = () => {
  const { filteredBookings, loading, error } = useBookings();
  const dispatch = useAppDispatch();
  const hasFetchedBookings = useRef(false);

  useEffect(() => {
    if (!hasFetchedBookings.current && !loading && !error) {
      hasFetchedBookings.current = true;
      dispatch(fetchBookings());
    }
  }, [dispatch, loading, error]);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading bookings...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">Error loading bookings: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (filteredBookings.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
             Bookings
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              You don't have any bookings yet.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Bookings
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            View upcoming and past reservations.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div key={booking.booking_id || booking.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.service?.name || booking.type || 'Service'}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Booking #{booking.booking_id || booking.id}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    booking.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                    booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {booking.status || 'Active'}
                  </span>
                </div>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Date:</span>
                    <span>
                      {booking.schedule?.start_date ? 
                        new Date(booking.schedule.start_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) :
                        booking.date ? new Date(booking.date).toLocaleDateString() : 'N/A'
                      }
                    </span>
                  </div>
                  
                  {(booking.schedule?.start_time || booking.time) && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Time:</span>
                      <span>
                        {booking.schedule?.start_time && booking.schedule?.end_time ? 
                          `${booking.schedule.start_time} - ${booking.schedule.end_time}` :
                          booking.time || 'N/A'
                        }
                      </span>
                    </div>
                  )}
                  
                  {booking.service?.capacity && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Capacity:</span>
                      <span>{booking.service.capacity} people</span>
                    </div>
                  )}
                  
                  {booking.total_amount && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Amount:</span>
                      <span className="font-semibold text-blue-600">
                        ${parseFloat(booking.total_amount).toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {booking.user?.full_name && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Booked by:</span>
                      <span>{booking.user.full_name}</span>
                    </div>
                  )}
                  
                  {booking.created_at && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Booked on:</span>
                      <span>
                        {new Date(booking.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex space-x-3">
                  <button className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm">
                    {booking.status === 'Completed' ? 'Book Again' : 'Reschedule'}
                  </button>
                  <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MyBookings; 