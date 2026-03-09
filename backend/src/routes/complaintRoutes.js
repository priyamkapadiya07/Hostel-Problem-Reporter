const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// @route   POST api/complaints
// @desc    Create a new complaint
// @access  Private (Student only)
router.post('/', auth, upload.single('image'), complaintController.createComplaint);

// @route   GET api/complaints
// @desc    Get complaints (Admin sees all, Student sees theirs)
// @access  Private
router.get('/', auth, complaintController.getComplaints);

// @route   PUT api/complaints/:id/status
// @desc    Update complaint status
// @access  Private (Admin only)
router.put('/:id/status', auth, complaintController.updateComplaintStatus);

module.exports = router;
