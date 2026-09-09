const BillingEvent = require('../models/BillingEvent');

async function dispatchBillingEvent({ type, customerId, object, previousAttributes = null, req = null }) {
  try {
    await BillingEvent.create({
      type,
      customerId,
      data: {
        object,
        previousAttributes
      },
      request: req ? {
        ip: req.ip || (req.headers && req.headers['x-forwarded-for']),
        userAgent: req.headers && req.headers['user-agent']
      } : null
    });
  } catch (err) {
    console.error(`Failed to dispatch billing event [${type}]:`, err);
  }
}

module.exports = { dispatchBillingEvent };
