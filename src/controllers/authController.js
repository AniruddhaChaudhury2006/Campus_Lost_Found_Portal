const db = require('../config/db');
exports.signin = (req, res) => {
    const { EMAIL, FULL_NAME, ROLE } = req.body;
    const query = `INSERT INTO USERS (EMAIL, FULL_NAME, ROLE) VALUES (?, ?, ?) ON CONFLICT(EMAIL) DO UPDATE SET FULL_NAME = excluded.FULL_NAME, ROLE = excluded.ROLE`;
    db.run(query, [EMAIL, FULL_NAME || 'Campus User', ROLE || 'Student'], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.get(`SELECT * FROM USERS WHERE EMAIL = ?`, [EMAIL], (err, user) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Successfully authenticated', user });
        });
    });
};