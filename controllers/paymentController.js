const Razorpay = require('razorpay');
const crypto = require('crypto');
const User = require('../models/User');

const PLANS = {
  starter: { price: 50, tokens: 50 },
  popular: { price: 100, tokens: 120 },
  pro:     { price: 200, tokens: 250 },
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─── Create Razorpay Order ──────────────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ error: 'Invalid plan selected.' });

    const options = {
      amount: plan.price * 100, // Razorpay expects paise
      currency: 'INR',
      receipt: `t_${req.userId.slice(-8)}_${Date.now()}`,
      notes: { userId: req.userId, planId, tokens: plan.tokens },
    };

    const order = await razorpay.orders.create(options);

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ error: 'Failed to create payment order.' });
  }
};

// ─── Verify Payment & Credit Tokens ─────────────────────────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details.' });
    }

    const plan = PLANS[planId];
    if (!plan) return res.status(400).json({ error: 'Invalid plan.' });

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Payment verification failed. Invalid signature.' });
    }

    // Credit tokens to user
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.tokens += plan.tokens;
    await user.save();

    res.json({
      success: true,
      tokens: user.tokens,
      message: `${plan.tokens} tokens added successfully!`,
    });
  } catch (error) {
    console.error('Verify Payment Error:', error);
    res.status(500).json({ error: 'Payment verification failed.' });
  }
};
