# 🐘 Neon Serverless PostgreSQL Database Setup Guide

This guide provides instructions for connecting a cloud-hosted **[Neon Postgres Database](https://neon.tech)** to the Recruit Logbook application.

---

## 📋 Prerequisites & Quick Setup

### Step 1: Create a Free Neon Account
1. Visit **[https://neon.tech](https://neon.tech)** and sign up for a free serverless PostgreSQL account.
2. Click **Create Project** and name your project `recruit-logbook`.
3. Copy your **Connection String** from the Neon dashboard. It looks like:
   ```text
   postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

---

### Step 2: Configure Environment Variables
1. In the project root directory, create a file named `.env` by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Paste your Neon PostgreSQL connection string into `.env`:
   ```env
   PORT=3000
   DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```

---

### Step 3: Initialize Database Tables & Seed Data
Run the automated initialization script to create all tables (`users`, `attendance_logs`, `daily_work_reports`, `weekly_reports`), indexes, and default admin seed data:

```bash
# 1. Install Node.js dependencies
npm install

# 2. Run Database Setup Script
npm run db:init
```

---

### Step 4: Launch the Server & Application
Start the server in development mode:

```bash
npm run dev
```

The Express API backend will run at **`http://localhost:3000`** with real-time Neon Serverless Postgres integration!

---

## 🗄️ Database Schema Summary

| Table Name | Description | Key Columns |
| :--- | :--- | :--- |
| `users` | Roster directory & auth credentials | `id`, `reg_id`, `name`, `prn`, `academic_year`, `domain`, `mobile`, `email`, `role`, `password_hash` |
| `attendance_logs` | Real-time check-in/out duty telemetry | `id`, `user_id`, `date`, `status`, `check_in_time`, `check_out_time`, `hours_logged` |
| `daily_work_reports` | Master daily work protocol logs | `id`, `user_id`, `date_str`, `title`, `details`, `verification_status` |
| `weekly_reports` | Master weekly skills & project updates | `id`, `user_id`, `submission_date`, `skills_learned`, `project_updates` |
