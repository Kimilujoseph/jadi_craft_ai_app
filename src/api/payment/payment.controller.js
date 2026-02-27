import prisma from '../../database/client.js';
import axios from 'axios';

// Ensure you have these configured in your environment Variables
// PAYHERO_CHANNEL_ID, BASIC_AUTH_TOKEN, PAYHERO_CALLBACK_URL

export const initiatePayment = async (req, res, next) => {
  try {
    const userId = req.user.user_id;
    const { phoneNumber, amount, type } = req.body;
    
    if (!phoneNumber || !amount || !type) {
      return res.status(400).json({ success: false, message: 'phoneNumber, amount, and type are required' });
    }

    if (!['EVENT_CREATION', 'LISTING_CREATION'].includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid payment type' });
    }

    // Prepare STK push options
    const reference = `JC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const callback_url = `${process.env.PAYHERO_CALLBACK_URL}/api/v1/payment/callback`;

    const payload = {
      amount: parseFloat(amount),
      phone_number: phoneNumber,
      channel_id: parseInt(process.env.PAYHERO_CHANNEL_ID),
      provider: 'm-pesa',
      external_reference: reference,
      callback_url: callback_url
    };

    // Make the request to Payhero API
    const response = await axios.post('https://backend.payhero.co.ke/api/v2/payments', payload, {
      headers: {
        'Authorization': process.env.BASIC_AUTH_TOKEN,
        'Content-Type': 'application/json'
      }
    });

    if (!response.data || !response.data.success) {
       console.error("Payhero API error", response.data);
       return res.status(500).json({ success: false, message: 'Payment gateway error' });
    }

    // The newer Payhero API returns `{ reference, message }` we saw in our test script.
    const returnedReference = response.data.reference || reference;

    // Save PENDING transaction
    const newTransaction = await prisma.transaction.create({
      data: {
        userId: userId,
        amount: parseFloat(amount),
        type: type,
        reference: reference, // we keep our internal reference as primary
        checkoutRequestID: returnedReference, // we store the PayHero reference here for callbacks
        status: 'PENDING'
      }
    });

    res.status(200).json({
      success: true,
      message: 'Payment STK push initiated successfully.',
      transactionId: newTransaction.id,
      payheroReference: returnedReference
    });

  } catch (error) {
    console.error('Error in initiatePayment:', error?.response?.data || error.message);
    next(error);
  }
};

export const paymentCallback = async (req, res, next) => {
  try {
    // Payhero sends POST request to webhook on status change
    const payload = req.body;
    
    // Webhook shape usually looks like { transactionId, status, external_reference, checkoutRequestID }
    // Or it might be nested inside payload object
    const status = payload?.status || payload?.response?.status; 
    const checkoutRequestID = payload?.checkoutRequestID || payload?.response?.checkoutRequestID;
    const external_reference = payload?.external_reference || payload?.response?.external_reference;

    if (!status) {
       return res.status(200).send('OK'); // acknowledge poorly formatted hook
    }

    let finalStatus = 'FAILED';
    if (status.toUpperCase() === 'SUCCESS' || status.toUpperCase() === 'SUCCESSFUL') {
      finalStatus = 'SUCCESS';
    } 

    if (external_reference) {
      await prisma.transaction.updateMany({
        where: { reference: external_reference },
        data: { status: finalStatus }
      });
    } else if (checkoutRequestID) {
      await prisma.transaction.updateMany({
        where: { checkoutRequestID: checkoutRequestID },
        data: { status: finalStatus }
      });
    }

    // Always respond 200 to webhooks
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(200).send('OK'); // Always ack
  }
};

export const checkPaymentStatus = async (req, res, next) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.user_id;

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    // Ensure user is checking their own transaction
    if (transaction.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.status(200).json({
      success: true,
      status: transaction.status
    });

  } catch (error) {
    next(error);
  }
};
