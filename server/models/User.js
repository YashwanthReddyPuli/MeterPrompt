const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const apiKeySchema = new mongoose.Schema({
  keyHash: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    default: 'Default API Key'
  },
  prefix: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUsed: {
    type: Date
  }
});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Please provide an email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide a password']
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    },
    creditsBalance: {
      type: Number,
      default: 0.00
    },
    apiKeys: [apiKeySchema]
  },
  {
    timestamps: true
  }
);

// Unique index on email is created by unique: true field definition

// Match entered password against stored bcrypt hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
