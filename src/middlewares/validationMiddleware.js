import { body, param, query, validationResult } from 'express-validator';

// Handle validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Booking validation rules
export const validateBookingCreation = [
  body('hallId')
    .isMongoId()
    .withMessage('Valid hall ID is required'),
  
  body('eventDates')
    .isArray({ min: 1 })
    .withMessage('At least one event date is required')
    .custom((dates) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (const date of dates) {
        const eventDate = new Date(date);
        if (eventDate < today) {
          throw new Error('Event dates cannot be in the past');
        }
        
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        if (eventDate > oneYearFromNow) {
          throw new Error('Event dates cannot be more than one year in advance');
        }
      }
      return true;
    }),
  
  body('additionalHours')
    .optional()
    .isInt({ min: 0, max: 12 })
    .withMessage('Additional hours must be between 0 and 12'),
  
  body('banquetChairs')
    .optional()
    .isInt({ min: 0, max: 1200 })
    .withMessage('Banquet chairs must be between 0 and 1200'),
  
  body('eventType')
    .optional()
    .isIn(['wedding', 'burial', 'birthday', 'corporate', 'conference', 'graduation', 'anniversary', 'baby-shower', 'religious', 'other'])
    .withMessage('Invalid event type'),
  
  body('specialRequests')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Special requests cannot exceed 1000 characters'),
  
  handleValidationErrors
];

export const validateAvailabilityCheck = [
  body('hallId')
    .isMongoId()
    .withMessage('Valid hall ID is required'),
  
  body('dates')
    .isArray({ min: 1 })
    .withMessage('At least one date is required')
    .custom((dates) => {
      for (const date of dates) {
        if (!Date.parse(date)) {
          throw new Error('Invalid date format');
        }
      }
      return true;
    }),
  
  handleValidationErrors
];

export const validateBookingId = [
  param('id')
    .isMongoId()
    .withMessage('Valid booking ID is required'),
  
  handleValidationErrors
];

export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

// Hall validation rules
export const validateHallCreation = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Hall name must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters'),
  
  body('capacity')
    .isInt({ min: 10, max: 10000 })
    .withMessage('Capacity must be between 10 and 10000'),
  
  body('basePrice')
    .isFloat({ min: 1000 })
    .withMessage('Base price must be at least ₦1,000'),
  
  body('additionalHourPrice')
    .isFloat({ min: 100 })
    .withMessage('Additional hour price must be at least ₦100'),
  
  body('location')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Location must be between 5 and 200 characters'),
  
  body('features')
    .optional()
    .isArray()
    .withMessage('Features must be an array'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  handleValidationErrors
];

export const validateHallId = [
  param('id')
    .isMongoId()
    .withMessage('Valid hall ID is required'),
  
  handleValidationErrors
];