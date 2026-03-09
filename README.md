# 🏢 Hostel Problem Reporter

A modern, full-stack web application designed to streamline the process of reporting and resolving maintenance issues within a hostel or dormitory environment. 

Students can easily report problems with optional photo evidence, while administrators have a dedicated centralized dashboard to filter, track, and update the status of these complaints.

---

## ✨ Key Features

### 🏢 Enterprise Multi-Tenancy
* **Isolated Workspaces**: The system supports multiple hostels simultaneously. Each administrator gets their own completely isolated `Hostel` sandbox.
* **Granular Details**: Admins can customize their workspace with a Hostel Name, Address, Contact Email, and Contact Phone.
* **Single-Use Invites**: To ensure absolute security, students cannot simply register randomly. Instead, administrators map out students by their email, real name, and room number, and generate a Secure One-Time Registration Token.
* **Pre-filled Onboarding**: When a student clicks an invite link, their profile is securely locked and pre-populated with the data assigned by the admin. 

### 🎓 For Students
* **Authentication**: Tokenized registration and secure login.
* **Report Issues**: Submit detailed complaints including a title, category, description, and an optional image attachment.
* **Track Progress**: View a personalized history of submitted complaints and their current resolution status.
* **Student Profile Card**: View current room assignment and linked hostel details dynamically.
* **Categories Supported**: WiFi, Electricity, Water, Cleaning, Furniture, and Other.

### 🛡️ For Administrators
* **Centralized Dashboard**: A comprehensive tabbed UI to manage complaints and students.
* **Automated Filtering**: You only ever see issues reported within your specific initialized Hostel.
* **Student Management**: Easily review, update, and manage the student population resident to your hostel.
* **Status Management**: Update the status of any complaint (`Pending` ➡️ `In Progress` ➡️ `Solved`).
* **Evidence Review**: Click to view attached images for better context on the reported issue.

---

## 💻 Tech Stack

**Frontend**
* Angular 17 (Standalone Components)
* TypeScript, HTML5, CSS3
* Reactive Forms

**Backend**
* Node.js & Express.js
* JSON Web Tokens (JWT) for Authentication
* Multer for handling `multipart/form-data` (Image Uploads)

**Database**
* PostgreSQL
* `pg` driver for raw SQL queries

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
* Node.js (v18 or higher recommended)
* PostgreSQL installed and running locally

### 1. Database Setup
1. Open pgAdmin or your PostgreSQL CLI.
2. Create a new database named `hostel_db` or run the included `init_db.js` script to automatically create the database and tables.
3. If running manually, the schema can be found in `backend/schema.sql`.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Configure your Environment Variables. Create a `.env` file in the `backend` directory (if not already present):
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=your_password_here
   DB_NAME=hostel_db
   JWT_SECRET=supersecretjwtkey_change_in_production
   ```
4. Run the initialization script (This will ensure tables exist):
   ```bash
   node init_db.js
   ```
5. Start the backend server:
   ```bash
   npm run dev
   # or node src/server.js
   ```

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the Angular development server:
   ```bash
   npm start
   # or ng serve
   ```
4. Open your browser and navigate to `http://localhost:4200`.

---

## 📂 Project Structure

```text
Hostel-Problem-Reporter/
├── backend/
│   ├── src/
│   │   ├── config/          # PostgreSQL database connection
│   │   ├── controllers/     # Auth and Complaint logic
│   │   ├── middleware/      # JWT verification & Multer image upload
│   │   ├── routes/          # Express API route definitions
│   │   └── server.js        # Main entry point & static file serving
│   ├── uploads/             # Directory where uploaded images are saved
│   ├── .env                 # Secret environment variables
│   └── init_db.js           # DB setup script
└── frontend/
    └── src/
        ├── app/
        │   ├── components/  # Standalone Angular components (Login, Dashboards, Forms)
        │   ├── guards/      # Angular route guards (authGuard, adminGuard)
        │   └── services/    # API connection services
        └── styles.css       # Global design system variables and styles
```

---

## 🔒 API Endpoints

**Authentication Route** (`/api/auth`)
- `POST /register`: Register a new user (`student` or `admin`).
- `POST /login`: Authenticate an existing user and return a JWT.

**Complaints Route** (`/api/complaints`) requires JWT Authorization
- `POST /`: Create a new complaint (Student only).
- `GET /`: Retrieve complaints (Students see their own; Admins see all).
- `PUT /:id/status`: Update the status of a specific complaint (Admin only).
