const express = require('express');
const {
  getPendingTransactions,
  getAllTransactions,
  reviewTransaction,
  getAllUsers,
  getUserDetail,
  updateUserBalance,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
} = require('../controllers/adminController');

const router = express.Router();

router.get('/pending-transactions', getPendingTransactions);
router.get('/transactions', getAllTransactions);
router.post('/review-transaction', reviewTransaction);
router.get('/users', getAllUsers);
router.get('/users/:userId', getUserDetail);
router.post('/update-balance', updateUserBalance);

router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:categoryId', updateCategory);
router.delete('/categories/:categoryId', deleteCategory);

router.get('/plans', getPlans);
router.post('/plans', createPlan);
router.put('/plans/:planId', updatePlan);
router.delete('/plans/:planId', deletePlan);

module.exports = router;
