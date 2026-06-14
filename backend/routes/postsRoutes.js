const express = require('express');
const { getPublicPosts } = require('../controllers/postsController');

const router = express.Router();

/**
 * Public: Get community posts
 */
router.get('/posts', getPublicPosts);

module.exports = router;
