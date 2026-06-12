const mongoose = require('mongoose');

const userInvestmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestmentCategory',
      required: true,
    },
    investmentAmount: {
      type: Number,
      required: true,
      min: [1, 'Investment amount must be greater than 0'],
    },
    dailyReturnRate: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

userInvestmentSchema.index({ user: 1, plan: 1 }, { unique: true });
userInvestmentSchema.index({ user: 1 });

module.exports = mongoose.model('UserInvestment', userInvestmentSchema);