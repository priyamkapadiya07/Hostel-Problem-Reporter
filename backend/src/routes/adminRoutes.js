const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/authMiddleware');

// @route   POST api/admin/invite
// @desc    Generate an invitation token for a student
// @access  Private (Admin only)
router.post('/invite', auth, adminController.generateInvite);

// @route   GET api/admin/students
// @desc    Get all students in the admin's hostel
// @access  Private (Admin only)
router.get('/students', auth, adminController.getStudents);

// @route   PUT api/admin/students/:id
// @desc    Update a student's room number or full name
// @access  Private (Admin only)
router.put('/students/:id', auth, adminController.updateStudent);

// @route   PUT api/admin/hostel
// @desc    Update admin's hostel name
// @access  Private (Admin Only)
router.put('/hostel', auth, adminController.updateHostel);

module.exports = router;
