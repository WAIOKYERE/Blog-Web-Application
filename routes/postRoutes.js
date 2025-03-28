import express from 'express';
import Post from '../models/Post.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Create Post
router.get('/create', requireAuth, (req, res) => res.render('create'));

router.post('/create', requireAuth, async (req, res) => {
  await Post.create({ ...req.body, author: req.session.user._id });
  res.redirect('/');
});

// View Posts
router.get('/', async (req, res) => {
  const posts = await Post.find().populate('author');
  res.render('index', { posts });
});

// Edit Post
router.get('/edit/:id', requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  res.render('edit', { post });
});

router.post('/edit/:id', requireAuth, async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, req.body);
  res.redirect('/');
});

// Delete Post
router.post('/delete/:id', requireAuth, async (req, res) => {
  await Post.findByIdAndDelete(req.params.id);
  res.redirect('/');
});

export default router;
