const db = require('../config/database');
const crypto = require('crypto');

exports.generateInvite = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can generate invites' });
    }

    const { email, full_name, room_number } = req.body;

    if (!email || !full_name || !room_number) {
      return res.status(400).json({ message: 'Please provide email, full name, and room number' });
    }

    // Get Admin's hostel_id
    const adminRes = await db.query('SELECT hostel_id FROM users WHERE id = $1', [req.user.id]);
    const hostel_id = adminRes.rows[0].hostel_id;

    if (!hostel_id) {
       return res.status(400).json({ message: 'Admin does not belong to a hostel.'});
    }

    // Check if a user with this email already exists
    const userCheck = await db.query('SELECT id FROM users WHERE username = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString('hex');

    // Save invitation
    const newInvite = await db.query(
      `INSERT INTO invitations (token, email, full_name, room_number, hostel_id, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [token, email, full_name, room_number, hostel_id, req.user.id]
    );

    res.status(201).json({ message: 'Invitation generated successfully', token: newInvite.rows[0].token });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getStudents = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can view students' });
    }

    // Get Admin's hostel_id
    const adminRes = await db.query('SELECT hostel_id FROM users WHERE id = $1', [req.user.id]);
    const hostel_id = adminRes.rows[0].hostel_id;

    const students = await db.query(
      `SELECT id, username as email, full_name, room_number, role
       FROM users 
       WHERE hostel_id = $1 AND role = 'student'
       ORDER BY full_name ASC`,
      [hostel_id]
    );

    res.json(students.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.updateHostel = async (req, res) => {
  const { name, address, contact_email, contact_phone } = req.body;
  try {
    if (!name) {
      return res.status(400).json({ message: 'Hostel name is required' });
    }

    // Get admin's current hostel_id
    const adminRes = await db.query('SELECT hostel_id FROM users WHERE id = $1', [req.user.id]);
    let hostel_id = adminRes.rows[0].hostel_id;

    if (!hostel_id) {
       // Admin is missing a hostel! Let's create it and link it.
       const newHostel = await db.query(
         'INSERT INTO hostels (name, address, contact_email, contact_phone) VALUES ($1, $2, $3, $4) RETURNING *',
         [name, address, contact_email, contact_phone]
       );
       hostel_id = newHostel.rows[0].id;
       
       await db.query('UPDATE users SET hostel_id = $1 WHERE id = $2', [hostel_id, req.user.id]);
       
       return res.json({ message: 'Hostel created and assigned successfully', hostel: newHostel.rows[0] });
    } else {
       // Update the existing hostel
       const updateRes = await db.query(
         'UPDATE hostels SET name = $1, address = $2, contact_email = $3, contact_phone = $4 WHERE id = $5 RETURNING *',
         [name, address, contact_email, contact_phone, hostel_id]
       );
       return res.json({ message: 'Hostel updated successfully', hostel: updateRes.rows[0] });
    }
  } catch (err) {
    console.error(err);
    // If unique constraint violation
    if (err.code === '23505') {
       return res.status(400).json({ message: 'Hostel name already exists' });
    }
    res.status(500).send('Server Error');
  }
};

exports.updateStudent = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can update students' });
    }

    // Get Admin's hostel_id
    const adminRes = await db.query('SELECT hostel_id FROM users WHERE id = $1', [req.user.id]);
    const hostel_id = adminRes.rows[0].hostel_id;

    const { id } = req.params;
    const { full_name, room_number } = req.body;

    // Check if student belongs to admin's hostel
    const studentCheck = await db.query('SELECT hostel_id FROM users WHERE id = $1 AND role = $2', [id, 'student']);
    if (studentCheck.rows.length === 0 || studentCheck.rows[0].hostel_id !== hostel_id) {
       return res.status(404).json({ message: 'Student not found in your hostel' });
    }

    const updatedStudent = await db.query(
      'UPDATE users SET full_name = $1, room_number = $2 WHERE id = $3 RETURNING id, username as email, full_name, room_number',
      [full_name, room_number, id]
    );

    res.json(updatedStudent.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
