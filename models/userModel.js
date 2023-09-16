const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please tell us your name!'],
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  photo: {
    type: String,
    default: 'default.jpg',
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'guide', 'lead-guide'],
    default: 'user',
  },
  password: {
    type: String,
    required: [true, 'Enter your password'],
    minlength: 8,
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, 'Enter your confirm password'],
    validate: {
      // This only works on Create and Save
      validator: function (el) {
        return el === this.password;
      },
      message: 'Password and confirm password should be same!',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpries: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

// Convert user's original password to hash
userSchema.pre('save', async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost 12
  this.password = await bcrypt.hash(this.password, 12);

  // Delete passwordConfirm field
  this.confirmPassword = undefined;
  next();
});

// Update the changedPasswordAt property when the user reset password
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Return those user whose active status are not false
userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

// Match entered password and database passwor are equal or not on user login
userSchema.methods.checkPassword = async (password, dbPassword) => {
  return await bcrypt.compare(password, dbPassword);
};

// Check if user changed password after jwt token generated
userSchema.methods.changePasswordAfter = function (JWTIssuedTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    // console.log(JWTIssuedTimestamp, changedTimestamp);
    return changedTimestamp > JWTIssuedTimestamp;
  }
  return false;
};

// Generate token on forget password
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpries = Date.now() + 10 * 60 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
