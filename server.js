// ============================================================
// RECRUIT LOGBOOK - EXPRESS BACKEND SERVER WITH NEON DB
// ============================================================

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db/index');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// ── HTML PAGE ROUTES & REDIRECTS ──
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

app.get('/member', (req, res) => {
  res.sendFile(path.join(__dirname, 'member-dashboard.html'));
});

// ── API ROUTES ──

// 1. LOGIN API
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!db.pool) return res.status(503).json({ error: 'Database connection offline' });

    const result = await db.query(
      `SELECT * FROM users WHERE (email = $1 OR reg_id = $1) AND password_hash = $2`,
      [identifier, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      user: {
        id: user.id,
        regId: user.reg_id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.is_admin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Database server error' });
  }
});

// 2. GET ALL USERS / ROSTER
app.get('/api/users', async (req, res) => {
  try {
    if (!db.pool) return res.status(503).json({ error: 'Database offline' });
    const result = await db.query(`SELECT id, reg_id, name, prn, academic_year, domain, mobile, email, password_hash as password, role, is_admin FROM users ORDER BY created_at ASC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. REGISTER NEW MEMBER
app.post('/api/users/register', async (req, res) => {
  try {
    const { regId, name, prn, academicYear, domain, mobile, email, role, password } = req.body;
    const result = await db.query(
      `INSERT INTO users (reg_id, name, prn, academic_year, domain, mobile, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [regId, name, prn, academicYear, domain, mobile, email, password, role || 'Member']
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 4. ATTENDANCE CLOCK IN / OUT
app.post('/api/attendance', async (req, res) => {
  try {
    const { userId, date, status, checkInTime, checkOutTime, hoursLogged, checkInIso, checkOutIso } = req.body;
    const result = await db.query(
      `INSERT INTO attendance_logs (user_id, date, status, check_in_time, check_out_time, hours_logged, check_in_iso, check_out_iso)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, date) DO UPDATE SET
         status = EXCLUDED.status,
         check_out_time = COALESCE(EXCLUDED.check_out_time, attendance_logs.check_out_time),
         hours_logged = COALESCE(EXCLUDED.hours_logged, attendance_logs.hours_logged),
         check_out_iso = COALESCE(EXCLUDED.check_out_iso, attendance_logs.check_out_iso)
       RETURNING *`,
      [userId, date, status, checkInTime, checkOutTime, hoursLogged, checkInIso, checkOutIso]
    );
    res.json({ success: true, log: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. DAILY WORK PROTOCOL REPORT SUBMIT
app.post('/api/reports/daily', async (req, res) => {
  try {
    const { userId, dateStr, title, details } = req.body;
    const result = await db.query(
      `INSERT INTO daily_work_reports (user_id, date_str, title, details, verification_status) VALUES ($1, $2, $3, $4, 'PENDING') RETURNING *`,
      [userId, dateStr, title || 'Daily Operations Protocol', details]
    );
    res.json({ success: true, report: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. WEEKLY REPORT SUBMIT
app.post('/api/reports/weekly', async (req, res) => {
  try {
    const { userId, submissionDate, skillsLearned, projectUpdates } = req.body;
    const result = await db.query(
      `INSERT INTO weekly_reports (user_id, submission_date, skills_learned, project_updates, verification_status) VALUES ($1, $2, $3, $4, 'PENDING') RETURNING *`,
      [userId, submissionDate, skillsLearned, projectUpdates]
    );
    res.json({ success: true, report: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6.5 GET MEMBER DASHBOARD DATA
app.get('/api/member/:email/dashboard', async (req, res) => {
  try {
    const { email } = req.params;
    if (!db.pool) return res.status(503).json({ error: 'Database offline' });

    // Find user by email, reg_id, or UUID
    const userRes = await db.query(
      `SELECT * FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1)) OR LOWER(TRIM(reg_id)) = LOWER(TRIM($1)) OR id::text = $1`,
      [email]
    );
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const user = userRes.rows[0];

    // Get attendance logs
    const attendanceRes = await db.query(
      `SELECT date, status, check_in_time as "checkIn", check_out_time as "checkOut", hours_logged as "hours", check_in_iso as "checkInIso"
       FROM attendance_logs
       WHERE user_id = $1
       ORDER BY date DESC`,
      [user.id]
    );

    // Get daily work reports
    const workRes = await db.query(
      `SELECT id, date_str as "date", title, details, verification_status as "status"
       FROM daily_work_reports
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [user.id]
    );

    // Get weekly reports
    const weeklyRes = await db.query(
      `SELECT id, submission_date as "date", skills_learned as "skills", project_updates as "updates", verification_status as "status"
       FROM weekly_reports
       WHERE user_id = $1
       ORDER BY submission_date DESC`,
      [user.id]
    );

    // Format attendance dates (ensure YYYY-MM-DD string)
    const attendanceHistory = attendanceRes.rows.map(row => {
      let dateStr = row.date;
      if (row.date instanceof Date) {
        // Convert to timezone-local date string to match local expectations
        const offset = row.date.getTimezoneOffset();
        const localDate = new Date(row.date.getTime() - (offset*60*1000));
        dateStr = localDate.toISOString().split('T')[0];
      }
      return {
        date: dateStr,
        checkIn: row.checkIn || '--:--',
        checkInIso: row.checkInIso || null,
        checkOut: row.checkOut || '--:--',
        hours: row.hours || 'Active',
        status: row.status === 'CHECKED_IN' ? 'Present' : (row.status === 'CHECKED_OUT' ? 'Present' : row.status)
      };
    });

    // Find if active or submitted today
    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendance = attendanceHistory.find(h => h.date === todayStr);

    let status = 'NOT_CHECKED_IN';
    let checkInTime = null;
    let checkInIso = null;

    if (todayAttendance) {
      if (todayAttendance.checkOut === '--:--') {
        status = 'CHECKED_IN';
        checkInTime = todayAttendance.checkIn;
        checkInIso = todayAttendance.checkInIso;
      } else {
        status = 'CHECKED_OUT';
      }
    }

    const reportSubmittedToday = workRes.rows.some(r => r.date && r.date.startsWith(todayStr));

    res.json({
      success: true,
      user: {
        id: user.id,
        regId: user.reg_id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      dashboardState: {
        status,
        checkInTime,
        checkInIso,
        reportSubmittedToday,
        workReports: workRes.rows,
        attendanceHistory,
        weeklySubmissions: weeklyRes.rows.map(w => {
          let dateStr = w.date;
          if (w.date instanceof Date) {
            const offset = w.date.getTimezoneOffset();
            const localDate = new Date(w.date.getTime() - (offset*60*1000));
            dateStr = localDate.toISOString().split('T')[0];
          }
          return {
            id: w.id,
            date: dateStr,
            skills: w.skills || '',
            updates: w.updates || '',
            status: w.status || 'PENDING'
          };
        })
      }
    });
  } catch (err) {
    console.error('Member dashboard load error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 7. GET ALL GLOBAL TELEMETRY LOGS
app.get('/api/logs', async (req, res) => {
  try {
    if (!db.pool) return res.status(503).json({ error: 'Database offline' });

    const attendanceRes = await db.query(`
      SELECT a.id, u.name, u.email, a.date, a.status, a.check_in_time as "checkIn", a.check_out_time as "checkOut", a.hours_logged as "hoursLogged"
      FROM attendance_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);

    const workRes = await db.query(`
      SELECT r.id, u.name, u.email, r.date_str as date, r.title, r.details, r.verification_status as status
      FROM daily_work_reports r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);

    const weeklyRes = await db.query(`
      SELECT w.id, u.name, u.email, w.submission_date as date, w.skills_learned as skills, w.project_updates as updates, w.verification_status as status
      FROM weekly_reports w
      LEFT JOIN users u ON w.user_id = u.id
      ORDER BY w.created_at DESC
    `);

    res.json({
      attendance: attendanceRes.rows,
      workReports: workRes.rows,
      weeklyUpdates: weeklyRes.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. UPDATE DAILY REPORT STATUS (VERIFIED / PENDING)
app.patch('/api/reports/daily/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!db.pool) return res.status(503).json({ error: 'Database offline' });

    const result = await db.query(
      `UPDATE daily_work_reports SET verification_status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Daily report not found' });
    }
    res.json({ success: true, report: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8.5 UPDATE WEEKLY REPORT STATUS (VERIFIED / PENDING)
app.patch('/api/reports/weekly/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!db.pool) return res.status(503).json({ error: 'Database offline' });

    const result = await db.query(
      `UPDATE weekly_reports SET verification_status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weekly report not found' });
    }
    res.json({ success: true, report: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. DELETE DAILY REPORT
app.delete('/api/reports/daily/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!db.pool) return res.status(503).json({ error: 'Database offline' });

    const result = await db.query('DELETE FROM daily_work_reports WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Daily report not found' });
    }
    res.json({ success: true, message: 'Daily report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. DELETE WEEKLY REPORT
app.delete('/api/reports/weekly/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!db.pool) return res.status(503).json({ error: 'Database offline' });

    const result = await db.query('DELETE FROM weekly_reports WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Weekly report not found' });
    }
    res.json({ success: true, message: 'Weekly report deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. REMOVE RECRUIT USER
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!db.pool) return res.status(503).json({ error: 'Database offline' });

    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. UPDATE USER CREDENTIALS / PASSWORD
app.patch('/api/users/:identifier/credentials', async (req, res) => {
  try {
    const { identifier } = req.params;
    const { email, password } = req.body;
    if (!db.pool) return res.status(503).json({ error: 'Database offline' });

    let queryText = 'UPDATE users SET ';
    const params = [];
    const setClauses = [];

    if (email) {
      params.push(email);
      setClauses.push(`email = $${params.length}`);
    }
    if (password) {
      params.push(password);
      setClauses.push(`password_hash = $${params.length}`);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update' });
    }

    params.push(identifier);
    queryText += setClauses.join(', ') + ` WHERE (id::text = $${params.length} OR reg_id = $${params.length} OR email = $${params.length}) RETURNING *`;

    const result = await db.query(queryText, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    console.error('Update credentials error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 10. GEOFENCE LOCATION CONFIG API
let geofenceConfig = {
  enabled: true,
  locationName: 'Sun Nexus Main Campus HQ',
  latitude: 18.5204,
  longitude: 73.8567,
  radiusMeters: 300,
  allowFallback: false
};

app.get('/api/config/geofence', (req, res) => {
  res.json({ success: true, geofence: geofenceConfig });
});

app.post('/api/config/geofence', (req, res) => {
  const { enabled, locationName, latitude, longitude, radiusMeters, allowFallback } = req.body;
  if (enabled !== undefined) geofenceConfig.enabled = Boolean(enabled);
  if (locationName) geofenceConfig.locationName = locationName;
  if (latitude !== undefined) geofenceConfig.latitude = parseFloat(latitude);
  if (longitude !== undefined) geofenceConfig.longitude = parseFloat(longitude);
  if (radiusMeters !== undefined) geofenceConfig.radiusMeters = parseInt(radiusMeters);
  if (allowFallback !== undefined) geofenceConfig.allowFallback = Boolean(allowFallback);

  res.json({ success: true, geofence: geofenceConfig });
});

// Export Express App for Vercel Serverless Functions
module.exports = app;

// Start Express App locally if executed directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Recruit Logbook Neon Server running on http://localhost:${PORT}`);
  });
}
