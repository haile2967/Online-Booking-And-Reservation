import React, { useState } from 'react';
import { useAppDispatch } from '../store/hooks';
import { createPayment } from '../store/paymentsSlice';

const PaymentForm = ({ bookingData, isVisible, onRequestClose, selectedService }) => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    amount_paid: bookingData?.total_amount || '0.00',
    payment_method: 'Credit_Card',
    payment_type: 'full'
  });
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('PaymentForm handleChange:', { name, value, formData });
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('PaymentForm submit:', { formData, bookingData });

    if (parseFloat(formData.amount_paid) <= 0) {
      setFormError('Total amount must be greater than 0.');
      return;
    }
    if (!formData.payment_method) {
      setFormError('Please select a payment method.');
      return;
    }
    if (!formData.payment_type) {
      setFormError('Please select a payment type.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const paymentResponse = await dispatch(createPayment({
        booking_id: bookingData.booking_id,
        payment_method: formData.payment_method,
        amount_paid: parseFloat(formData.amount_paid),
        payment_type: formData.payment_type
      })).unwrap();

      console.log('Payment created:', paymentResponse);
      onRequestClose();
      alert(`Payment processed successfully! Booking status: ${paymentResponse.booking_status_updated}`);
    } catch (err) {
      console.error('Payment submission error:', err);
      setFormError(err.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedService || !bookingData || !isVisible) {
    console.log('PaymentForm not rendered:', { selectedService, bookingData, isVisible });
    return null;
  }

    return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onRequestClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Payment for {selectedService.name}
              </h2>
              <p className="text-gray-600 mt-1">Complete your payment</p>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Service:</span>
                <span className="font-medium">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">{new Date(bookingData.selectedDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium">{bookingData.startTime} - {bookingData.endTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">{bookingData.name}</span>
              </div>
            </div>
          </div>
        {formError && (
          <p className="text-red-500 mb-4 text-center">{formError}</p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="amount_paid" className="block text-sm font-medium text-gray-700 mb-2">
              Amount to Pay (ETB)
            </label>
            <input
              type="number"
              id="amount_paid"
              name="amount_paid"
              value={formData.amount_paid}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              max={bookingData.total_amount}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={isSubmitting}
            />
            <p className="text-sm text-gray-500 mt-2">
              Total booking amount: <span className="font-semibold text-blue-600">{bookingData.total_amount} ETB</span>
            </p>
          </div>
          <div>
            <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method
            </label>
            <select
              id="payment_method"
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={isSubmitting}
            >
              <option value="Credit_Card">Credit Card</option>
              <option value="CBE_Birr">CBE Birr</option>
              <option value="M_Pesa">M-Pesa</option>
            </select>
          </div>
          <div>
            <label htmlFor="payment_type" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Type
            </label>
            <select
              id="payment_type"
              name="payment_type"
              value={formData.payment_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={isSubmitting}
            >
              <option value="full">Full Payment</option>
              <option value="deposit">Deposit</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onRequestClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
  );
};

export default PaymentForm;