const db = require('../config/db');
exports.submitClaim = (req, res) => {
    const { ITEM_ID, CLAIMANT_ID, PROOF_DESCRIPTION } = req.body;
    const query = `INSERT INTO CLAIMS (ITEM_ID, CLAIMANT_ID, PROOF_DESCRIPTION, CLAIM_STATUS) VALUES (?, ?, ?, 'Pending')`;
    db.run(query, [ITEM_ID, CLAIMANT_ID, PROOF_DESCRIPTION], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        db.run(`UPDATE ITEMS SET STATUS = 'Claimed' WHERE ITEM_ID = ?`, [ITEM_ID], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: updateErr.message });
            res.status(201).json({ message: 'Claim submitted successfully', claim_id: this.lastID });
        });
    });
};
exports.getReviewQueue = (req, res) => {
    const query = `
        SELECT CLAIMS.*, ITEMS.TITLE AS ITEM_TITLE, ITEMS.IMAGE_URL, USERS.FULL_NAME AS CLAIMANT_NAME 
        FROM CLAIMS 
        JOIN ITEMS ON CLAIMS.ITEM_ID = ITEMS.ITEM_ID 
        JOIN USERS ON CLAIMS.CLAIMANT_ID = USERS.USER_ID 
        WHERE CLAIMS.CLAIM_STATUS = 'Pending'
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};
exports.reviewClaim = (req, res) => {
    const { CLAIM_ID, STATUS } = req.body; 
    db.run(`UPDATE CLAIMS SET CLAIM_STATUS = ? WHERE CLAIM_ID = ?`, [STATUS, CLAIM_ID], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (STATUS === 'Approved') {
            db.get(`SELECT ITEM_ID FROM CLAIMS WHERE CLAIM_ID = ?`, [CLAIM_ID], (err, row) => {
                if (row) {
                    db.run(`UPDATE ITEMS SET STATUS = 'Matched' WHERE ITEM_ID = ?`, [row.ITEM_ID]);
                    db.run(`UPDATE CLAIMS SET CLAIM_STATUS = 'Rejected' WHERE ITEM_ID = ? AND CLAIM_ID != ?`, [row.ITEM_ID, CLAIM_ID]);
                }
            });
        }
        res.json({ message: `Claim ${STATUS.toLowerCase()} successfully` });
    });
};
exports.confirmHandover = (req, res) => {
    const { CLAIM_ID } = req.body;
    db.get(`SELECT ITEM_ID FROM CLAIMS WHERE CLAIM_ID = ?`, [CLAIM_ID], (err, claim) => {
        if (err || !claim) return res.status(404).json({ error: 'Claim not found' });
        db.run(`DELETE FROM ITEMS WHERE ITEM_ID = ?`, [claim.ITEM_ID], (delErr) => {
            if (delErr) return res.status(500).json({ error: delErr.message });
            db.run(`DELETE FROM CLAIMS WHERE ITEM_ID = ?`, [claim.ITEM_ID], () => {
                res.json({ message: 'Handover complete. Item and claims purged from database.' });
            });
        });
    });
};