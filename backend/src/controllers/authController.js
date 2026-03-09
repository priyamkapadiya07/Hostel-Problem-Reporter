const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { username, password, role, hostel_name } = req.body;

  try {
    if (!username || !password || !role) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (role !== 'student' && role !== 'admin') {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (role === 'admin' && !hostel_name) {
      return res.status(400).json({ message: 'Please provide a hostel name' });
    }

    // Check if user exists
    const userCheck = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let finalHostelId = null;

    if (role === 'admin') {
      // Create new hostel for the admin
      const newHostel = await db.query('INSERT INTO hostels (name) VALUES ($1) RETURNING id', [hostel_name]);
      finalHostelId = newHostel.rows[0].id;
    }

    // Create user
    const newUser = await db.query(
      'INSERT INTO users (username, password, role, hostel_id) VALUES ($1, $2, $3, $4) RETURNING id, username, role',
      [username, hashedPassword, role, finalHostelId]
    );

    res.status(201).json({ message: 'User registered successfully', user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.verifyInvite = async (req, res) => {
  const { token } = req.params;
  try {
    const inviteCheck = await db.query('SELECT * FROM invitations WHERE token = $1 AND is_used = FALSE', [token]);
    if (inviteCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Invalid or expired invitation token' });
    }
    const invite = inviteCheck.rows[0];
    res.json({ email: invite.email, full_name: invite.full_name, room_number: invite.room_number });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};

exports.registerInvite = async (req, res) => {
  const { token, password } = req.body;
  try {
    if (!token || !password) {
      return res.status(400).json({ message: 'Please provide token and password' });
    }

    const inviteCheck = await db.query('SELECT * FROM invitations WHERE token = $1 AND is_used = FALSE', [token]);
    if (inviteCheck.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired invitation token' });
    }
    const invite = inviteCheck.rows[0];

    const userCheck = await db.query('SELECT id FROM users WHERE username = $1', [invite.email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      'INSERT INTO users (username, password, role, full_name, room_number, hostel_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, role, full_name',
      [invite.email, hashedPassword, 'student', invite.full_name, invite.room_number, invite.hostel_id]
    );

    // Mark token as used
    await db.query('UPDATE invitations SET is_used = TRUE WHERE id = $1', [invite.id]);

    res.status(201).json({ message: 'Student registered successfully', user: newUser.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Check user
    const userResult = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = userResult.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        hostel_id: user.hostel_id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '10h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token, role: user.role, username: user.username, full_name: user.full_name });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userResult = await db.query(
      `SELECT u.id, u.username as email, u.full_name, u.room_number, u.role, 
              h.name as hostel_name, h.address as hostel_address, h.contact_email as hostel_email, h.contact_phone as hostel_phone 
       FROM users u 
       LEFT JOIN hostels h ON u.hostel_id = h.id 
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(userResult.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
