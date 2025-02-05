const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

// User Schema
const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  }, // Email verification status

  verificationToken: {
    type: String,
  }, // Store email verification token

  verificationExpires: {
    type: Date,
  }, // Expiry time for verification token

  createdAt: {
    type: Date,
    default: Date.now,
  }, // Automatically stores account creation date
});

// Add authentication methods (hashing & salting)
userSchema.plugin(passportLocalMongoose);

// Token Schema (For Email Verification)
const TokenSchema = new Schema({
  shortId: { type: String, required: true, unique: true },
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 600 }, // Token expires in 10 minutes
});


// Export models
const User = mongoose.model("User", userSchema);
const Token = mongoose.model("Token", TokenSchema);

module.exports = { User, Token };
