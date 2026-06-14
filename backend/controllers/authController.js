const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const UserInvestment = require('../models/UserInvestment');

const emailUser = process.env.EMAIL_USER;
const emailPassword = process.env.APP_PASSWORD || process.env.EMAIL_PASSWORD;

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
  auth: {
    user: emailUser,
    pass: emailPassword,
  },
});

const isEmailConfigured = () =>
  Boolean(
    emailUser &&
      emailPassword &&
      emailUser !== 'your_email@gmail.com' &&
      emailUser !== 'your_real_sender@gmail.com'
  );

const sendAppEmail = ({ to, subject, text, html, logLabel }) => {
  if (!isEmailConfigured()) {
    console.error(`${logLabel} skipped: EMAIL_USER/APP_PASSWORD are missing or still using placeholder values.`);
    return;
  }

  transporter
    .sendMail({
      from: process.env.EMAIL_FROM || emailUser,
      to,
      subject,
      text,
      html,
    })
    .then((info) => {
      console.log(`${logLabel} queued:`, {
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      });
    })
    .catch((emailError) => {
      console.error(`Failed to send ${logLabel}:`, emailError.message);
    });
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const sendWelcomeEmail = (user) => {
  const firstName = user.name?.trim()?.split(/\s+/)[0] || 'Investor';
  const safeFirstName = escapeHtml(firstName);

  sendAppEmail({
    to: user.email,
    subject: 'Welcome to Smart Halal Investment',
    logLabel: 'welcome email',
    text:
      `Hi ${firstName},\n\n` +
      'Welcome to Smart Halal Investment. Your account has been created successfully.\n\n' +
      'You can now log in, explore investment plans, and manage your wallet from the app.\n\n' +
      'If you did not create this account, please contact support immediately.\n\n' +
      'Smart Halal Investment Team',
    html:
      `<p>Hi ${safeFirstName},</p>` +
      '<p>Welcome to <strong>Smart Halal Investment</strong>. Your account has been created successfully.</p>' +
      '<p>You can now log in, explore investment plans, and manage your wallet from the app.</p>' +
      '<p>If you did not create this account, please contact support immediately.</p>' +
      '<p>Smart Halal Investment Team</p>',
  });
};

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      currentBalance: user.currentBalance,
      activePlan: user.activePlan,
      isVerified: user.isVerified,
      dp: user.dp,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    }
  );

const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!name || !normalizedEmail || !password || !phone) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone,
    });

    sendWelcomeEmail(user);

    const token = signToken(user);

    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentBalance: user.currentBalance,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Registration failed' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        currentBalance: user.currentBalance,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Login failed' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    return res.status(200).json({
      message: 'Profile fetched successfully',
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to fetch profile' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'currentPassword and newPassword are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'newPassword must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Password update failed' });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).json({ message: 'If this email is registered, an OTP has been sent' });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    user.otpCode = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    sendAppEmail({
      to: user.email,
      subject: 'Smart Halal Investment Password Reset Code',
      logLabel: 'password reset email',
      text:
        `Your Smart Halal Investment password reset code is: ${otp}\n\n` +
        'This code is valid for 10 minutes.\n\n' +
        'If you did not request this password reset, you can safely ignore this email.\n\n' +
        'Smart Halal Investment Team',
      html:
        '<p>Your Smart Halal Investment password reset code is:</p>' +
        `<p><strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong></p>` +
        '<p>This code is valid for 10 minutes.</p>' +
        '<p>If you did not request this password reset, you can safely ignore this email.</p>' +
        '<p>Smart Halal Investment Team</p>',
    });

    return res.status(200).json({ message: 'If this email is registered, an OTP has been sent' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to process request' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.otpCode || !user.otpExpires) {
      return res.status(400).json({ message: 'No OTP request found for this email' });
    }

    if (user.otpCode !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.otpCode = resetToken;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    return res.status(200).json({ message: 'OTP verified successfully', resetToken });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'OTP verification failed' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail || !resetToken || !newPassword) {
      return res.status(400).json({ message: 'Email, resetToken, and newPassword are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user || !user.otpCode || !user.otpExpires) {
      return res.status(400).json({ message: 'No reset request found' });
    }

    if (user.otpCode !== resetToken) {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    if (new Date() > user.otpExpires) {
      return res.status(400).json({ message: 'Reset token has expired' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Password reset failed' });
  }
};

const getUserDashboardStats = async (req, res) => {
    try {
      const userId = req.user.id;

      const [stats, investments] = await Promise.all([
        Transaction.aggregate([
          {
            $match: {
              user: new mongoose.Types.ObjectId(userId),
            },
          },
          {
            $facet: {
              totalDepositsApproved: [
                {
                  $match: {
                    type: 'Deposit',
                    status: { $in: ['approved', 'Approved'] },
                    transactionId: { $not: /^ROI-DAILY-/ },
                  },
                },
                {
                  $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                  },
                },
              ],
              totalWithdrawalsProcessed: [
                {
                  $match: {
                    type: 'Withdrawal',
                    status: { $in: ['approved', 'Approved', 'withdrawn', 'Withdrawn'] },
                  },
                },
                {
                  $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                  },
                },
              ],
              totalROIEarnings: [
                {
                  $match: {
                    type: 'Deposit',
                    transactionId: /^ROI-DAILY-/,
                  },
                },
                {
                  $group: {
                    _id: null,
                    total: { $sum: '$amount' },
                  },
                },
              ],
            },
          },
        ]),
        UserInvestment.find({ user: userId, status: 'active' }).select('investmentAmount'),
      ]);

      const summary = stats[0] || {};
      const totalInvestment = investments.reduce((sum, inv) => sum + inv.investmentAmount, 0);

      return res.status(200).json({
        message: 'Dashboard stats fetched successfully',
        totalDepositsApproved: summary.totalDepositsApproved?.[0]?.total || 0,
        totalWithdrawalsApproved: summary.totalWithdrawalsProcessed?.[0]?.total || 0,
        totalROIEarnings: summary.totalROIEarnings?.[0]?.total || 0,
        totalInvestment,
      });
    } catch (error) {
      console.error('Dashboard stats calculation failed:', error.message);
      return res.status(500).json({ message: error.message || 'Unable to fetch dashboard stats' });
    }
  };

const getUserInvestments = async (req, res) => {
    try {
      const userId = req.user.id;

      const investments = await UserInvestment.find({ user: userId })
        .populate('plan', 'name dailyReturnRate minInvestment maxInvestment description')
        .populate('category', 'name')
        .sort({ createdAt: -1 });

      const totalInvestment = investments
        .filter(inv => inv.status === 'active')
        .reduce((sum, inv) => sum + inv.investmentAmount, 0);

      return res.status(200).json({
        message: 'User investments fetched successfully',
        investments,
        totalInvestment,
      });
    } catch (error) {
      console.error('Failed to fetch user investments:', error.message);
      return res.status(500).json({ message: error.message || 'Unable to fetch user investments' });
    }
  };

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updatePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  getUserDashboardStats,
  getUserInvestments,
};
