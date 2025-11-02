// Add this to your existing validationMiddleware.js file

import { body, validationResult } from 'express-validator';
import AppError from '../utils/appError.js';

// Validation for offline booking creation
export const validateOfflineBooking = [
  // Customer information (required for offline bookings)
  body('customerName')
    .notEmpty()
    .withMessage('Customer name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  
  body('customerEmail')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .trim(),
  
  body('customerPhone')
    .notEmpty()
    .withMessage('Customer phone is required')
    .trim()
    .matches(/^[\+]?[\d\s\-\(\)]{10,}$/)
    .withMessage('Valid phone number is required'),

  // Hall and event details
  body('hallId')
    .notEmpty()
    .withMessage('Hall ID is required')
    .isMongoId()
    .withMessage('Invalid hall ID'),

  body('eventDates')
    .isArray({ min: 1 })
    .withMessage('At least one event date is required'),
    
  body('eventDates.*')
    .isISO8601()
    .withMessage('Valid event dates are required')
    .custom((value) => {
      const eventDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (eventDate < today) {
        throw new Error('Event date cannot be in the past');
      }
      return true;
    }),

  body('eventType')
    .optional()
    .isIn(['wedding', 'burial', 'birthday', 'corporate', 'conference', 'graduation', 'anniversary', 'baby-shower', 'religious', 'other'])
    .withMessage('Invalid event type'),

  body('additionalHours')
    .optional()
    .isInt({ min: 0, max: 24 })
    .withMessage('Additional hours must be between 0 and 24'),

  body('banquetChairs')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Banquet chairs must be a positive number'),

  body('specialRequests')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Special requests cannot exceed 1000 characters'),

  // Payment information for offline booking
  body('paymentMethod')
    .notEmpty()
    .withMessage('Payment method is required for offline booking')
    .isIn(['cash', 'pos', 'transfer', 'cheque'])
    .withMessage('Invalid payment method for offline booking'),

  body('paymentAmount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isFloat({ min: 0 })
    .withMessage('Payment amount must be a positive number'),

  body('paymentReference')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Payment reference must be between 1 and 100 characters'),

  // Bank transfer specific validations
  body('transferDetails.accountName')
    .if(body('paymentMethod').equals('transfer'))
    .notEmpty()
    .withMessage('Account name is required for bank transfer')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Account name must be between 2 and 100 characters'),

  body('transferDetails.accountNumber')
    .if(body('paymentMethod').equals('transfer'))
    .notEmpty()
    .withMessage('Account number is required for bank transfer')
    .trim()
    .matches(/^\d{10}$/)
    .withMessage('Account number must be 10 digits'),

  body('transferDetails.bankName')
    .if(body('paymentMethod').equals('transfer'))
    .notEmpty()
    .withMessage('Bank name is required for bank transfer')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bank name must be between 2 and 100 characters'),

  // POS specific validations
  body('posDetails.terminalId')
    .if(body('paymentMethod').equals('pos'))
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Terminal ID must be between 1 and 50 characters'),

  body('posDetails.receiptNumber')
    .if(body('paymentMethod').equals('pos'))
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Receipt number must be between 1 and 50 characters'),

  // Cheque specific validations
  body('chequeDetails.chequeNumber')
    .if(body('paymentMethod').equals('cheque'))
    .notEmpty()
    .withMessage('Cheque number is required for cheque payment')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cheque number must be between 1 and 50 characters'),

  body('chequeDetails.bankName')
    .if(body('paymentMethod').equals('cheque'))
    .notEmpty()
    .withMessage('Bank name is required for cheque payment')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bank name must be between 2 and 100 characters'),

  body('chequeDetails.chequeDate')
    .if(body('paymentMethod').equals('cheque'))
    .notEmpty()
    .withMessage('Cheque date is required')
    .isISO8601()
    .withMessage('Valid cheque date is required'),

  // Admin notes (optional)
  body('adminNotes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Admin notes cannot exceed 500 characters'),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return next(new AppError(errorMessages.join('. '), 400));
    }
    next();
  }
];