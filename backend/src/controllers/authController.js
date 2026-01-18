const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { generateToken, isValidEmail } = require('../utils/helpers');
const { sendTemplatedEmail } = require('../services/emailService');
const { JWT_EXPIRY, EMAIL_TYPES } = require('../utils/constants');

/**
 * Generate JWT token
 */
const generateJWT = (userId) => {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  if (!secret || secret === 'your-secret-key') {
    console.warn('Warning: Using default JWT secret. Set JWT_SECRET in .env for production.');
  }
  return jwt.sign({ userId }, secret, {
    expiresIn: JWT_EXPIRY,
  });
};

/**
 * Register new user
 */
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Name, email, and password are required', 400);
    }

    if (!isValidEmail(email)) {
      return sendError(res, 'Invalid email format', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 'User with this email already exists', 400);
    }

    // Create user
    const emailVerificationToken = generateToken();
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      emailVerificationToken,
    });

    // Send verification email (async, don't wait)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${emailVerificationToken}`;
      sendTemplatedEmail(EMAIL_TYPES.EMAIL_VERIFICATION, user.email, {
        userName: user.name,
        verificationUrl,
      }).catch((err) => {
        console.error('Failed to send verification email:', err);
      });
    }

    const token = generateJWT(user._id.toString());

    // Convert user to plain object to ensure proper serialization
    const userObject = user.toObject ? user.toObject() : user;
    // Remove sensitive fields
    delete userObject.password;
    delete userObject.emailVerificationToken;
    delete userObject.passwordResetToken;
    delete userObject.passwordResetExpires;

    return sendSuccess(res, 'User registered successfully', {
      user: userObject,
      token,
    }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message).join(', ');
      return sendError(res, messages, 400);
    }
    // Handle duplicate key error
    if (error.code === 11000) {
      return sendError(res, 'User with this email already exists', 400);
    }
    return sendError(res, error.message || 'Registration failed', 500);
  }
};

/**
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400);
    }

    // Find user with password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateJWT(user._id);

    // Remove password from response
    user.password = undefined;

    return sendSuccess(res, 'Login successful', {
      user,
      token,
    });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Get current user
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    return sendSuccess(res, 'User retrieved successfully', { user });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    );

    return sendSuccess(res, 'Profile updated successfully', { user });
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Request password reset
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 'Email is required', 400);
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists for security
      return sendSuccess(res, 'If the email exists, a password reset link has been sent');
    }

    const resetToken = generateToken();
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Send reset email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
      sendTemplatedEmail(EMAIL_TYPES.PASSWORD_RESET, user.email, {
        resetUrl,
      }).catch(console.error);
    }

    return sendSuccess(res, 'If the email exists, a password reset link has been sent');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Reset password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return sendError(res, 'Token and password are required', 400);
    }

    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters', 400);
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return sendError(res, 'Invalid or expired reset token', 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return sendSuccess(res, 'Password reset successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

/**
 * Verify email
 */
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return sendError(res, 'Verification token is required', 400);
    }

    const user = await User.findOne({
      emailVerificationToken: token,
    }).select('+emailVerificationToken');

    if (!user) {
      return sendError(res, 'Invalid verification token', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return sendSuccess(res, 'Email verified successfully');
  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
};
