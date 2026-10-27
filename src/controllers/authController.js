const db = require('../config/db');

/**
 * POST /api/auth/signin (or signup)
 * Authenticates an existing user or creates a new student/admin account.
 * Uses SQLite ON CONFLICT(EMAIL) to safely upsert without duplicate email errors.
 */
exports.signin = (req, res) => {
    let { EMAIL, FULL_NAME, ROLE } = req.body;

    if (!EMAIL || typeof EMAIL !== 'string' || !EMAIL.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
    }

    EMAIL = EMAIL.trim().toLowerCase();
    FULL_NAME = (FULL_NAME && FULL_NAME.trim()) ? FULL_NAME.trim() : EMAIL.split('@')[0];
    
    // Normalize role to valid database CHECK constraint: ('Student', 'Staff', 'Admin')
    const validRoles = ['Student', 'Staff', 'Admin'];
    ROLE = validRoles.find(r => r.toLowerCase() === (ROLE || '').toLowerCase()) || 'Student';

    const upsertQuery = `
        INSERT INTO USERS (EMAIL, FULL_NAME, ROLE) 
        VALUES (?, ?, ?) 
        ON CONFLICT(EMAIL) DO UPDATE SET 
            FULL_NAME = excluded.FULL_NAME, 
            ROLE = excluded.ROLE
    `;

    db.run(upsertQuery, [EMAIL, FULL_NAME, ROLE], function (err) {
        if (err) {
            console.error('Database sign-in error:', err.message);
            return res.status(500).json({ error: 'Database authentication failed.' });
        }

        // Fetch the active user row by email to return full profile details
        db.get(`SELECT USER_ID, FULL_NAME, EMAIL, ROLE, CREATED_AT FROM USERS WHERE EMAIL = ?`, [EMAIL], (fetchErr, user) => {
            if (fetchErr || !user) {
                return res.status(500).json({ error: 'Could not retrieve user profile.' });
            }

            // Log sign-in action in AUDIT_LOGS
            db.run(
                `INSERT INTO AUDIT_LOGS (USER_ID, ACTION, DETAILS) VALUES (?, 'USER_SIGNIN', ?)`,
                [user.USER_ID, `User ${user.FULL_NAME} signed in as ${user.ROLE}`]
            );

            res.json({
                message: 'Successfully authenticated',
                user: {
                    USER_ID: user.USER_ID,
                    FULL_NAME: user.FULL_NAME,
                    EMAIL: user.EMAIL,
                    ROLE: user.ROLE,
                    CREATED_AT: user.CREATED_AT
                }
            });
        });
    });
};

/**
 * GET /api/auth/user/:id
 * Fetches user profile by USER_ID.
 */
exports.getUserProfile = (req, res) => {
    const userId = req.params.id;
    const query = `SELECT USER_ID, FULL_NAME, EMAIL, ROLE, CREATED_AT FROM USERS WHERE USER_ID = ?`;

    db.get(query, [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json(user);
    });
};

/**
 * GET /api/auth/users
 * Returns list of campus users (for admin directory / demonstration).
 */
exports.getAllUsers = (req, res) => {
    const query = `
        SELECT USER_ID, FULL_NAME, EMAIL, ROLE, CREATED_AT,
               (SELECT COUNT(*) FROM ITEMS WHERE ITEMS.USER_ID = USERS.USER_ID) AS REPORT_COUNT,
               (SELECT COUNT(*) FROM CLAIMS WHERE CLAIMS.CLAIMANT_ID = USERS.USER_ID) AS CLAIM_COUNT
        FROM USERS 
        ORDER BY USER_ID ASC
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

/**
 * POST /api/auth/signout
 * Records signout event and returns success.
 */
exports.signout = (req, res) => {
    const { USER_ID } = req.body;
    if (USER_ID) {
        db.run(
            `INSERT INTO AUDIT_LOGS (USER_ID, ACTION, DETAILS) VALUES (?, 'USER_SIGNOUT', 'User signed out')`,
            [USER_ID]
        );
    }
    res.json({ message: 'Successfully signed out' });
};


/**
 * GET /api/auth/user/:id
 * Fetches user profile by USER_ID.
 */
exports.getUserProfile = (req, res) => {
    const userId = req.params.id;
    const query = `SELECT USER_ID, FULL_NAME, EMAIL, ROLE, CREATED_AT FROM USERS WHERE USER_ID = ?`;

    db.get(query, [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: 'User not found.' });
        res.json(user);
    });
};

/**
 * GET /api/auth/users
 * Returns list of campus users (for admin directory / demonstration).
 */
exports.getAllUsers = (req, res) => {
    const query = `
        SELECT USER_ID, FULL_NAME, EMAIL, ROLE, CREATED_AT,
               (SELECT COUNT(*) FROM ITEMS WHERE ITEMS.USER_ID = USERS.USER_ID) AS REPORT_COUNT,
               (SELECT COUNT(*) FROM CLAIMS WHERE CLAIMS.CLAIMANT_ID = USERS.USER_ID) AS CLAIM_COUNT
        FROM USERS 
        ORDER BY USER_ID ASC
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

/**
 * POST /api/auth/signout
 * Records signout event and returns success.
 */
exports.signout = (req, res) => {
    const { USER_ID } = req.body;
    if (USER_ID) {
        db.run(
            `INSERT INTO AUDIT_LOGS (USER_ID, ACTION, DETAILS) VALUES (?, 'USER_SIGNOUT', 'User signed out')`,
            [USER_ID]
        );
    }
    res.json({ message: 'Successfully signed out' });
};