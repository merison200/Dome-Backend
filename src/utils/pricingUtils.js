/**
 * Calculate booking pricing based on hall rates and selected options
 */
export const calculateBookingPricing = ({
  basePrice,
  additionalHourPrice,
  eventDates,
  additionalHours = 0,
  banquetChairs = 0
}) => {
  const numberOfDays = eventDates.length;
  
  // Base price calculation
  const totalBasePrice = basePrice * numberOfDays;
  
  // Additional hours calculation
  const totalAdditionalHoursPrice = additionalHours * additionalHourPrice * numberOfDays;
  
  // Banquet chairs calculation (₦1,000 per chair per day)
  const chairPricePerDay = 1000;
  const totalBanquetChairsPrice = banquetChairs * chairPricePerDay * numberOfDays;
  
  // Caution fee (10% of base price)
  const cautionFee = Math.round(totalBasePrice * 0.1);
  
  // Total amount
  const totalAmount = totalBasePrice + cautionFee + totalAdditionalHoursPrice + totalBanquetChairsPrice;
  
  return {
    basePrice: totalBasePrice,
    cautionFee,
    additionalHoursPrice: totalAdditionalHoursPrice,
    banquetChairsPrice: totalBanquetChairsPrice,
    totalAmount
  };
};

/**
 * Calculate refund amount based on cancellation policy
 */
export const calculateRefundAmount = (booking, cancellationDate = new Date()) => {
  const { totalAmount, cancellationDeadline, cautionFee } = booking;
  
  // If cancelled before deadline, refund 90% (10% processing fee)
  if (cancellationDate < cancellationDeadline) {
    return {
      refundAmount: Math.round(totalAmount * 0.9),
      processingFee: Math.round(totalAmount * 0.1),
      refundType: 'early_cancellation'
    };
  }
  
  // If cancelled after deadline, no refund
  return {
    refundAmount: 0,
    processingFee: totalAmount,
    refundType: 'late_cancellation'
  };
};

/**
 * Validate pricing data
 */
export const validatePricing = (pricingData) => {
  const { basePrice, additionalHoursPrice, banquetChairsPrice, cautionFee, totalAmount } = pricingData;
  
  const errors = [];
  
  if (basePrice < 0) errors.push('Base price cannot be negative');
  if (additionalHoursPrice < 0) errors.push('Additional hours price cannot be negative');
  if (banquetChairsPrice < 0) errors.push('Banquet chairs price cannot be negative');
  if (cautionFee < 0) errors.push('Caution fee cannot be negative');
  if (totalAmount < 0) errors.push('Total amount cannot be negative');
  
  const calculatedTotal = basePrice + additionalHoursPrice + banquetChairsPrice + cautionFee;
  if (Math.abs(calculatedTotal - totalAmount) > 1) {
    errors.push('Total amount does not match sum of components');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};