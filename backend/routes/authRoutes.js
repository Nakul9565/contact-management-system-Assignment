const express = require('express');
const router = express.Router();
const authService = require('../service/authService');
const authMiddleware = require('../middleware/auth');
const { validate, signupSchema, loginSchema } = require('../middleware/validate');

// POST /api/auth/signup - Register (Validated by Zod)
router.post('/signup', validate(signupSchema), async (req, res) => {
  try {
    const result = await authService.signup(req.body);
    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      ...result,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/auth/login - Login (Validated by Zod)
router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json({
      success: true,
      message: 'Logged in successfully!',
      ...result,
    });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message });
  }
});

// GET /api/auth/me - Current user profile (Protected)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

module.exports = router;
