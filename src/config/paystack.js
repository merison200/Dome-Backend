import dotenv from 'dotenv';

dotenv.config();

// Paystack configuration
const paystackConfig = {
  baseURL: 'https://api.paystack.co',
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  publicKey: process.env.PAYSTACK_PUBLIC_KEY,
  callbackUrl: process.env.PAYSTACK_CALLBACK_URL || `${process.env.FRONTEND_URL}/payment/callback`,
  secure: true,
};

// HTTP Client utility
const httpClient = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`HTTP request failed: ${error.message}`);
    throw error;
  }
};

// Paystack API methods
const paystackAPI = {
  async initializePaystackPayment(paymentData) {
    try {
      const response = await httpClient(`${paystackConfig.baseURL}/transaction/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackConfig.secretKey}`,
        },
        body: JSON.stringify({
          email: paymentData.email,
          amount: paymentData.amount * 100, // Convert to kobo
          reference: paymentData.reference,
          callback_url: paystackConfig.callbackUrl,
          metadata: {
            bookingId: paymentData.bookingId,
            userId: paymentData.userId,
            custom_fields: [
              {
                display_name: "Booking ID",
                variable_name: "booking_id",
                value: paymentData.bookingId
              }
            ]
          }
        }),
      });

      return {
        success: true,
        data: response.data,
        authorizationUrl: response.data.authorization_url,
        accessCode: response.data.access_code,
        reference: response.data.reference,
      };
    } catch (error) {
      console.error('Paystack initialization error:', error.message);
      return {
        success: false,
        error: error.message || 'Payment initialization failed',
      };
    }
  },

  async verifyPaystackPayment(reference) {
    try {
      const response = await httpClient(`${paystackConfig.baseURL}/transaction/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackConfig.secretKey}`,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Paystack verification error:', error.message);
      return {
        success: false,
        error: error.message || 'Payment verification failed',
      };
    }
  },

  async getTransaction(transactionId) {
    try {
      const response = await httpClient(`${paystackConfig.baseURL}/transaction/${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${paystackConfig.secretKey}`,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Get transaction error:', error.message);
      return {
        success: false,
        error: error.message || 'Failed to get transaction',
      };
    }
  },

  async chargeAuthorization(cardDetails, amount, reference) {
    try {
      const response = await httpClient(`${paystackConfig.baseURL}/transaction/charge_authorization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${paystackConfig.secretKey}`,
        },
        body: JSON.stringify({
          authorization_code: cardDetails.authorizationCode,
          email: cardDetails.email,
          amount: amount * 100,
          reference: reference,
        }),
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Card charge error:', error.message);
      return {
        success: false,
        error: error.message || 'Card charge failed',
      };
    }
  },

  calculatePaystackFee(amount) {
    // Paystack fee structure for Nigeria
    let fee = 0;
    if (amount <= 2500) {
      fee = amount * 0.015; // 1.5%
    } else {
      fee = (amount * 0.015) + 100; // 1.5% + ₦100
    }
    return Math.min(fee, 2000); // Cap at ₦2000
  },
};

// Verify configuration
const verifyConfig = () => {
  const { secretKey, publicKey } = paystackConfig;

  if (!secretKey || !publicKey) {
    throw new Error('Paystack config is incomplete. Check your .env settings.');
  }

  if (!secretKey.startsWith('sk_')) {
    throw new Error('Invalid Paystack secret key format.');
  }

  if (!publicKey.startsWith('pk_')) {
    throw new Error('Invalid Paystack public key format.');
  }

  console.log('Paystack configured successfully');
  return true;
};

export { paystackConfig, paystackAPI, verifyConfig };