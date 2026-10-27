const db = require('../config/db');

// POST /api/claims - Submit an ownership claim with private proof
exports.submitClaim = (req, res) => {
    const { ITEM_ID, CLAIMANT_ID, PROOF_DESCRIPTION } = req.body;

    if (!ITEM_ID || !CLAIMANT_ID || !PROOF_DESCRIPTION) {
        return res.status(400).json({ error: 'Item ID, claimant ID, and proof description are required.' });
    }

    const query = `
        INSERT INTO CLAIMS (ITEM_ID, CLAIMANT_ID, PROOF_DESCRIPTION, CLAIM_STATUS) 
        VALUES (?, ?, ?, 'Pending')
    `;

    db.run(query, [ITEM_ID, CLAIMANT_ID, PROOF_DESCRIPTION], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        const claimId = this.lastID;

        // Update item status to 'Claimed' (review pending)
        db.run(`UPDATE ITEMS SET STATUS = 'Claimed' WHERE ITEM_ID = ?`, [ITEM_ID], (updateErr) => {
            if (updateErr) console.error('Could not update item status:', updateErr.message);

            // Record in audit log
            db.run(
                `INSERT INTO AUDIT_LOGS (USER_ID, ACTION, DETAILS) VALUES (?, 'CLAIM_SUBMITTED', ?)`,
                [CLAIMANT_ID, `Submitted claim #${claimId} for item #${ITEM_ID}`]
            );

            res.status(201).json({ 
                message: 'Claim submitted successfully for review', 
                claim_id: claimId 
            });
        });
    });
};

// GET /api/claims/queue - Administrator review queue of pending claims
exports.getReviewQueue = (req, res) => {
    const query = `
        SELECT 
            CLAIMS.CLAIM_ID,
            CLAIMS.ITEM_ID,
            CLAIMS.PROOF_DESCRIPTION,
            CLAIMS.CLAIM_STATUS,
            CLAIMS.CREATED_AT AS CLAIM_DATE,
            ITEMS.TITLE AS ITEM_TITLE,
            ITEMS.IMAGE_URL,
            ITEMS.LOCATION,
            ITEMS.TYPE AS ITEM_TYPE,
            USERS.FULL_NAME AS CLAIMANT_NAME,
            USERS.EMAIL AS CLAIMANT_EMAIL
        FROM CLAIMS
        JOIN ITEMS ON CLAIMS.ITEM_ID = ITEMS.ITEM_ID
        JOIN USERS ON CLAIMS.CLAIMANT_ID = USERS.USER_ID
        WHERE CLAIMS.CLAIM_STATUS = 'Pending'
        ORDER BY CLAIMS.CREATED_AT DESC
    `;

    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// POST /api/claims/review - Admin approve or reject a claim
exports.reviewClaim = (req, res) => {
    const { CLAIM_ID, STATUS, ADMIN_ID, REVIEW_COMMENT } = req.body;

    if (!['Approved', 'Rejected'].includes(STATUS)) {
        return res.status(400).json({ error: "Status must be 'Approved' or 'Rejected'." });
    }

    const query = `UPDATE CLAIMS SET CLAIM_STATUS = ? WHERE CLAIM_ID = ?`;

    db.run(query, [STATUS, CLAIM_ID], function (err) {
        if (err) return res.status(500).json({ error: err.message });

        // Save admin review note if provided
        if (REVIEW_COMMENT && ADMIN_ID) {
            db.run(
                `INSERT INTO REVIEW_NOTES (CLAIM_ID, ADMIN_ID, REVIEW_COMMENT) VALUES (?, ?, ?)`,
                [CLAIM_ID, ADMIN_ID, REVIEW_COMMENT]
            );
        }

        // If approved, mark the item as 'Matched' and reject competing pending claims
        if (STATUS === 'Approved') {
            db.get(`SELECT ITEM_ID, CLAIMANT_ID FROM CLAIMS WHERE CLAIM_ID = ?`, [CLAIM_ID], (err, row) => {
                if (row) {
                    db.run(`UPDATE ITEMS SET STATUS = 'Matched' WHERE ITEM_ID = ?`, [row.ITEM_ID]);
                    db.run(`UPDATE CLAIMS SET CLAIM_STATUS = 'Rejected' WHERE ITEM_ID = ? AND CLAIM_ID != ?`, [row.ITEM_ID, CLAIM_ID]);

                    // Enqueue notification for claimant
                    db.get(`SELECT * FROM ITEMS WHERE ITEM_ID = ?`, [row.ITEM_ID], (itemErr, item) => {
                        if (item) {
                            const notifTitle = `Claim Approved: ${item.TITLE}`;
                            const notifMsg = `Your ownership claim for "${item.TITLE}" has been approved by the Administrator. Please proceed to campus desk for handover.`;
                            db.run(
                                `INSERT INTO NOTIFICATIONS (USER_ID, ITEM_ID, TITLE, MESSAGE, TYPE, IS_READ) VALUES (?, ?, ?, ?, 'Claim_Approved', 0)`,
                                [row.CLAIMANT_ID, item.ITEM_ID, notifTitle, notifMsg]
                            );
                        }
                    });
                }
            });
        } else if (STATUS === 'Rejected') {
            // Check if there are other pending claims; if none, revert item status back to 'Open'
            db.get(`SELECT ITEM_ID FROM CLAIMS WHERE CLAIM_ID = ?`, [CLAIM_ID], (err, row) => {
                if (row) {
                    db.get(`SELECT COUNT(*) AS count FROM CLAIMS WHERE ITEM_ID = ? AND CLAIM_STATUS = 'Pending'`, [row.ITEM_ID], (err, pending) => {
                        if (pending && pending.count === 0) {
                            db.run(`UPDATE ITEMS SET STATUS = 'Open' WHERE ITEM_ID = ?`, [row.ITEM_ID]);
                        }
                    });
                }
            });
        }

        res.json({ message: `Claim ${STATUS.toLowerCase()} successfully.` });
    });
};

// POST /api/claims/handover - Finalize handover and close the item record
exports.confirmHandover = (req, res) => {
    const { CLAIM_ID, ADMIN_ID, NOTE } = req.body;

    db.get(`SELECT ITEM_ID, CLAIMANT_ID FROM CLAIMS WHERE CLAIM_ID = ?`, [CLAIM_ID], (err, claim) => {
        if (err || !claim) return res.status(404).json({ error: 'Claim not found.' });

        // Mark item as 'Closed'
        db.run(`UPDATE ITEMS SET STATUS = 'Closed' WHERE ITEM_ID = ?`, [claim.ITEM_ID], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: updateErr.message });

            // Record handover in audit log
            db.run(
                `INSERT INTO AUDIT_LOGS (USER_ID, ACTION, DETAILS) VALUES (?, 'ITEM_HANDOVER_CLOSED', ?)`,
                [ADMIN_ID || claim.CLAIMANT_ID, NOTE || `Physical handover completed for item #${claim.ITEM_ID}`]
            );

            res.json({ message: 'Handover complete. Case closed successfully.' });
        });
    });
};

// GET /api/claims/user/:userId - Get all claims submitted by a user
exports.getUserClaims = (req, res) => {
    const userId = req.params.userId;
    const query = `
        SELECT 
            CLAIMS.CLAIM_ID,
            CLAIMS.ITEM_ID,
            CLAIMS.PROOF_DESCRIPTION,
            CLAIMS.CLAIM_STATUS,
            ITEMS.TITLE AS ITEM_TITLE,
            ITEMS.CATEGORY,
            ITEMS.LOCATION,
            ITEMS.TYPE,
            ITEMS.IMAGE_URL
        FROM CLAIMS
        JOIN ITEMS ON CLAIMS.ITEM_ID = ITEMS.ITEM_ID
        WHERE CLAIMS.CLAIMANT_ID = ?
        ORDER BY CLAIMS.CLAIM_ID DESC
    `;
    db.all(query, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
};
