const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true },
  author: { type: String, default: 'Admin' },
  authorAvatar: { type: String, default: null },
  category: { type: String, enum: ['update', 'announcement', 'education'], default: 'update' },
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Post', PostSchema);
