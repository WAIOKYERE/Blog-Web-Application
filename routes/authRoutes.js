import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

const router = express.Router();

// Register Route
router.get('/register', (req, res) => res.render('auth/register'));

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = new User({ username, password });
    await user.save();
    res.redirect('/auth/login');
  } catch (error) {
    console.error(error);
    res.redirect('/auth/register');
  }
});

// Login Route
router.get('/login', (req, res) => res.render('auth/login'));

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.redirect('/auth/login');
    }
    req.session.user = user;
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    res.redirect('/auth/login');
  }
});

// Logout Route
router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

export default router;
