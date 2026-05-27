const express = require('express');
const { submitDeposit, requestWithdrawal, selectPlan, getTransactions, distributeDailyProfit, getActivePlans, getActiveCategories, getCategoryWithPlans } = require('../controllers/walletController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes - no auth required
router.get('/categories', getActiveCategories);
router.get('/systems', getCategoryWithPlans);
router.get('/plans', getActivePlans);

// Apply auth middleware to all remaining wallet routes
router.use(authMiddleware);

router.post('/deposit', submitDeposit);
router.post('/withdraw', requestWithdrawal);
router.post('/select-plan', selectPlan);
router.get('/transactions', getTransactions);

// In production, this will run automatically every 24 hours using a cron-job package like node-cron.
// For testing and development, we trigger it manually via this endpoint.
router.post('/trigger-daily-roi', distributeDailyProfit);

module.exports = router;
