const { Client } = require('pg');
require('dotenv').config();

async function initDb() {
  const defaultClient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres' // Connecting to default DB to create our new one
  });

  try {
    await defaultClient.connect();
    console.log('Connected to default PostgreSQL database.');
    
    const dbName = process.env.DB_NAME;
    const res = await defaultClient.query(`SELECT datname FROM pg_catalog.pg_database WHERE datname = '${dbName}'`);
    
    if (res.rowCount === 0) {
      console.log(`Database "${dbName}" not found, creating it...`);
      await defaultClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
  } finally {
    await defaultClient.end();
  }

  // Now connect to the newly created database and create tables
  const dbClient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await dbClient.connect();
    console.log(`Connected to "${process.env.DB_NAME}" database. Creating tables...`);

    const createHostelsTableQuery = `
      CREATE TABLE IF NOT EXISTS hostels (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'admin')),
        full_name VARCHAR(255),
        room_number VARCHAR(50),
        hostel_id INTEGER REFERENCES hostels(id) ON DELETE SET NULL
      );
    `;

    const createInvitationsTableQuery = `
      CREATE TABLE IF NOT EXISTS invitations (
        id SERIAL PRIMARY KEY,
        token VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        room_number VARCHAR(50) NOT NULL,
        hostel_id INTEGER REFERENCES hostels(id) ON DELETE CASCADE,
        created_by INTEGER REFERENCES users(id) ON DELETE CASCADE,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createComplaintsTableQuery = `
      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        hostel_id INTEGER REFERENCES hostels(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(255),
        image_url TEXT,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    await dbClient.query(createHostelsTableQuery);
    console.log('Table "hostels" ensured.');

    await dbClient.query(createUsersTableQuery);
    console.log('Table "users" ensured.');
    
    // Handle ALTER TABLE for existing hostels table
    try {
      await dbClient.query('ALTER TABLE hostels ADD COLUMN IF NOT EXISTS address TEXT');
      await dbClient.query('ALTER TABLE hostels ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255)');
      await dbClient.query('ALTER TABLE hostels ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50)');
    } catch(e) { console.log('Columns already exist or error altering hostels:', e.message); }
    
    // Handle ALTER TABLE for existing users table
    try {
      await dbClient.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255)');
      await dbClient.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS room_number VARCHAR(50)');
      await dbClient.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS hostel_id INTEGER REFERENCES hostels(id) ON DELETE SET NULL');
    } catch(e) { console.log('Columns already exist or error altering users:', e.message); }

    await dbClient.query(createInvitationsTableQuery);
    console.log('Table "invitations" ensured.');
    
    await dbClient.query(createComplaintsTableQuery);
    console.log('Table "complaints" ensured.');

    // Handle ALTER TABLE for existing complaints table
    try {
      await dbClient.query('ALTER TABLE complaints ADD COLUMN IF NOT EXISTS hostel_id INTEGER REFERENCES hostels(id) ON DELETE CASCADE');
    } catch(e) { console.log('Columns already exist or error altering complaints:', e.message); }

    // Seed a default hostel if none exists
    const defaultHostel = await dbClient.query('INSERT INTO hostels (name) VALUES ($1) ON CONFLICT (name) DO NOTHING RETURNING id', ['Default Hostel']);
    
    // Ensure existing admins belong to the default hostel so they can login and manage it
    await dbClient.query(`
      UPDATE users SET hostel_id = (SELECT id FROM hostels WHERE name = 'Default Hostel' LIMIT 1) 
      WHERE hostel_id IS NULL AND role = 'admin'
    `);

    console.log('Database initialization complete.');
  } catch (err) {
    console.error('Error creating tables:', err);
  } finally {
    await dbClient.end();
  }
}

initDb();
