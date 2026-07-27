-- ============================================================
-- RECRUIT LOGBOOK - NEON POSTGRESQL DATABASE SCHEMA
-- Compatible with Neon Serverless Postgres (https://neon.tech)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS & ROSTER DIRECTORY
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reg_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    prn VARCHAR(50) UNIQUE,
    academic_year VARCHAR(50) DEFAULT '2nd Year',
    domain VARCHAR(255),
    mobile VARCHAR(50),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(100) DEFAULT 'Member',
    is_admin BOOLEAN DEFAULT FALSE,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. DAILY ATTENDANCE & DUTY TELEMETRY
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('CHECKED_IN', 'CHECKED_OUT', 'Present', 'Late', 'Absent')),
    check_in_time VARCHAR(50),
    check_out_time VARCHAR(50),
    hours_logged VARCHAR(50) DEFAULT 'Active',
    check_in_iso TIMESTAMPTZ,
    check_out_iso TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_daily_attendance UNIQUE (user_id, date)
);

-- 3. MASTER DAILY WORK PROTOCOL AUDIT
CREATE TABLE IF NOT EXISTS daily_work_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    submission_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    date_str VARCHAR(50) NOT NULL,
    title VARCHAR(255) DEFAULT 'Daily Operations Protocol',
    details TEXT NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'VERIFIED' CHECK (verification_status IN ('VERIFIED', 'PENDING')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 4. MASTER WEEKLY SKILLS & PROJECT REPORTS
CREATE TABLE IF NOT EXISTS weekly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    submission_date DATE NOT NULL,
    skills_learned TEXT,
    project_updates TEXT,
    verification_status VARCHAR(50) DEFAULT 'PENDING' CHECK (verification_status IN ('VERIFIED', 'PENDING')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ── INDEXES FOR HIGH-PERFORMANCE QUERYING ──
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_reg_id ON users(reg_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON attendance_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_work_reports_user ON daily_work_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reports_user ON weekly_reports(user_id);

-- ── SEED INITIAL EXECUTIVE ADMIN ACCOUNT ──
INSERT INTO users (reg_id, name, prn, academic_year, domain, mobile, email, password_hash, role, is_admin)
VALUES (
    'REC-100',
    'Executive Admin',
    '20240000000',
    'Faculty Lead',
    'Operations Command',
    '+91 9999999999',
    'admin@sunnexus.com',
    'admin123', -- Replace with bcrypt hash in production
    'Lead Operations Admin',
    TRUE
)
ON CONFLICT (reg_id) DO NOTHING;

-- ── SEED INITIAL RECRUIT MEMBER ACCOUNTS ──
INSERT INTO users (reg_id, name, prn, academic_year, domain, mobile, email, password_hash, role, is_admin)
VALUES (
    'REC-101',
    'Recruit Member',
    '20240110492',
    '2nd Year',
    'Full Stack Web Dev',
    '+91 9876543210',
    'member@sunnexus.com',
    'member123',
    'Software Engineer',
    FALSE
)
ON CONFLICT (reg_id) DO NOTHING;

INSERT INTO users (reg_id, name, prn, academic_year, domain, mobile, email, password_hash, role, is_admin)
VALUES (
    'REC-102',
    'Bhargav',
    '20240110492',
    '2nd Year',
    'Full Stack Web Dev',
    '+91 9876543210',
    'k.bhargavasriram88@gmail.com',
    'member123',
    'Full Stack Developer',
    FALSE
)
ON CONFLICT (reg_id) DO NOTHING;
