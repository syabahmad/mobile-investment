const Post = require('../models/Post');

const getPublicPosts = async (req, res) => {
  try {
    const posts = await Post.find({ isPublished: true }).sort({ createdAt: -1 }).lean();
    const mapped = posts.map(p => ({
      _id: p._id,
      title: p.title,
      body: p.body,
      category: p.category,
      createdAt: p.createdAt,
      author: p.author || process.env.ADMIN_NAME || 'Admin',
      authorAvatar: p.authorAvatar || process.env.ADMIN_AVATAR_URL || null,
    }));
    return res.status(200).json({ posts: mapped });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to fetch posts' });
  }
};

// Admin-protected
const createAdminPost = async (req, res) => {
  try {
    const { title, body, category, isPublished, authorAvatar } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'title and body are required' });

    const post = await Post.create({
      title,
      body,
      category: category || 'update',
      isPublished: isPublished === undefined ? true : !!isPublished,
      author: req.adminName || process.env.ADMIN_NAME || 'Admin',
      authorAvatar: authorAvatar || process.env.ADMIN_AVATAR_URL || null,
    });

    return res.status(201).json({ message: 'Post created', post });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to create post' });
  }
};

module.exports = { getPublicPosts, createAdminPost };
