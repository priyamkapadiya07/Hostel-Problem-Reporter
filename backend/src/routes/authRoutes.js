const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   GET api/auth/invite/:token
// @desc    Verify invite token and get pre-filled details
// @access  Public
router.get('/invite/:token', authController.verifyInvite);

// @route   POST api/auth/register-invite
// @desc    Register a new student using an invite token
// @access  Public
router.post('/register-invite', authController.registerInvite);

const auth = require('../middleware/authMiddleware');

// @route   GET api/auth/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', auth, authController.getProfile);

module.exports = router;
