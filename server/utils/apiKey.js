const crypto = require('crypto');

/**
 * Generate a new API key prefixed with mp_live_
 * Returns both the unhashed raw key (to display once to user) and keyHash
 */
const generateApiKey = () => {
  const randomBytes = crypto.randomBytes(24).toString('hex');
  const rawKey = `mp_live_${randomBytes}`;
  const prefix = rawKey.substring(0, 15); // e.g. "mp_live_a1b2c3d"
  const keyHash = hashApiKey(rawKey);
  
  return { rawKey, keyHash, prefix };
};

/**
 * Hash an API key using SHA-256
 */
const hashApiKey = (key) => {
  return crypto.createHash('sha256').update(key).digest('hex');
};

module.exports = {
  generateApiKey,
  hashApiKey
};
