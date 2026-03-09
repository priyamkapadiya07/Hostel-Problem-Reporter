const db = require('../config/database');

exports.createComplaint = async (req, res) => {
  const { title, description, category } = req.body;
  const image_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can report problems' });
    }

    // Get user's hostel_id
    const userResult = await db.query('SELECT hostel_id FROM users WHERE id = $1', [req.user.id]);
    const hostel_id = userResult.rows[0].hostel_id;

    const newComplaint = await db.query(
      'INSERT INTO complaints (user_id, hostel_id, title, description, category, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.user.id, hostel_id, title, description, category, image_url]
    );

    res.status(201).json(newComplaint.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getComplaints = async (req, res) => {
  try {
    let complaints;
    
    // Get user's hostel_id
    const userResult = await db.query('SELECT hostel_id FROM users WHERE id = $1', [req.user.id]);
    const hostel_id = userResult.rows[0]?.hostel_id;

    if (req.user.role === 'admin') {
      // Admins see all complaints FOR THEIR HOSTEL
      complaints = await db.query(`
        SELECT c.id, c.title, c.description, c.category, c.image_url, c.status, c.created_at, u.username as student_name, u.full_name, u.room_number 
        FROM complaints c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.hostel_id = $1
        ORDER BY c.created_at DESC
      `, [hostel_id]);
    } else {
      // Students see their own complaints
      complaints = await db.query(`
        SELECT id, title, description, category, image_url, status, created_at 
        FROM complaints 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `, [req.user.id]);
    }

    res.json(complaints.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.updateComplaintStatus = async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update complaint status' });
    }

    if (!['pending', 'in_progress', 'solved'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updatedComplaint = await db.query(
      'UPDATE complaints SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (updatedComplaint.rows.length === 0) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.json(updatedComplaint.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
