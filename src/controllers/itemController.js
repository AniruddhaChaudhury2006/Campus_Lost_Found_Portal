const db = require('../config/db');

// GET /api/items - Fetch all active items with optional filters
exports.getItems = (req, res) => {
    const type = req.query.TYPE || req.query.type;
    const category = req.query.CATEGORY || req.query.category;
    const location = req.query.LOCATION || req.query.location;
    const search = req.query.SEARCH || req.query.search;

    let query = `
        SELECT ITEMS.*, USERS.FULL_NAME AS REPORTER_NAME 
        FROM ITEMS 
        JOIN USERS ON ITEMS.USER_ID = USERS.USER_ID 
        WHERE 1=1
    `;
    const params = [];

    // Optional status filter; defaults to showing all non-archived items if searching or open items by default
    if (req.query.status) {
        query += ` AND ITEMS.STATUS = ?`;
        params.push(req.query.status);
    }

    if (type) {
        query += ` AND LOWER(ITEMS.TYPE) = LOWER(?)`;
        params.push(type);
    }
    if (category) {
        query += ` AND LOWER(ITEMS.CATEGORY) = LOWER(?)`;
        params.push(category);
    }
    if (location) {
        query += ` AND LOWER(ITEMS.LOCATION) LIKE LOWER(?)`;
        params.push(`%${location}%`);
    }
    if (search) {
        query += ` AND (ITEMS.TITLE LIKE ? OR ITEMS.DESCRIPTION LIKE ? OR ITEMS.LOCATION LIKE ?)`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY ITEMS.CREATED_AT DESC`;

    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
};

// GET /api/items/:id - Fetch single item details
exports.getItemById = (req, res) => {
    const itemId = req.params.id;
    const query = `
        SELECT ITEMS.*, USERS.FULL_NAME AS REPORTER_NAME, USERS.EMAIL AS REPORTER_EMAIL 
        FROM ITEMS 
        JOIN USERS ON ITEMS.USER_ID = USERS.USER_ID 
        WHERE ITEMS.ITEM_ID = ?
    `;
    db.get(query, [itemId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: 'Item not found' });
        res.json(row);
    });
};

// POST /api/items - Post a new Lost or Found item
exports.createItem = (req, res) => {
    const userId = req.body.USER_ID || req.body.user_id;
    const title = req.body.TITLE || req.body.title;
    const description = req.body.DESCRIPTION || req.body.description;
    const category = req.body.CATEGORY || req.body.category;
    const location = req.body.LOCATION || req.body.location;
    const dateEvent = req.body.DATE_EVENT || req.body.date_event;
    let rawType = req.body.TYPE || req.body.type || 'Lost';
    const type = rawType.charAt(0).toUpperCase() + rawType.slice(1).toLowerCase();
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!userId || !title || !description) {
        return res.status(400).json({ error: 'User ID, title, and description are required.' });
    }

    const query = `
        INSERT INTO ITEMS (USER_ID, TITLE, DESCRIPTION, CATEGORY, LOCATION, DATE_EVENT, TYPE, IMAGE_URL, STATUS) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Open')
    `;

    db.run(query, [userId, title, description, category, location, dateEvent, type, imageUrl], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ 
            message: 'Report published successfully', 
            item_id: this.lastID 
        });
    });
};

// PUT /api/items/:id - Update an item
exports.updateItem = (req, res) => {
    const itemId = req.params.id;
    const { TITLE, DESCRIPTION, CATEGORY, LOCATION, STATUS } = req.body;

    const query = `
        UPDATE ITEMS 
        SET TITLE = COALESCE(?, TITLE),
            DESCRIPTION = COALESCE(?, DESCRIPTION),
            CATEGORY = COALESCE(?, CATEGORY),
            LOCATION = COALESCE(?, LOCATION),
            STATUS = COALESCE(?, STATUS)
        WHERE ITEM_ID = ?
    `;

    db.run(query, [TITLE, DESCRIPTION, CATEGORY, LOCATION, STATUS, itemId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Item not found' });
        res.json({ message: 'Item updated successfully' });
    });
};

// DELETE /api/items/:id - Remove an item
exports.deleteItem = (req, res) => {
    const itemId = req.params.id;
    const query = `DELETE FROM ITEMS WHERE ITEM_ID = ?`;

    db.run(query, [itemId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Item not found' });
        res.json({ message: 'Item deleted successfully' });
    });
};

// GET /api/items/stats - Real-time statistics counters
exports.getStats = (req, res) => {
    const query = `
        SELECT 
            COUNT(*) AS total,
            SUM(CASE WHEN LOWER(TYPE) = 'found' AND STATUS IN ('Open', 'Claimed') THEN 1 ELSE 0 END) AS found_count,
            SUM(CASE WHEN LOWER(TYPE) = 'lost' AND STATUS IN ('Open', 'Claimed') THEN 1 ELSE 0 END) AS lost_count,
            SUM(CASE WHEN STATUS IN ('Matched', 'Closed') THEN 1 ELSE 0 END) AS resolved_count
        FROM ITEMS
    `;
    db.get(query, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            total: (row && row.total) || 0,
            found: (row && row.found_count) || 0,
            lost: (row && row.lost_count) || 0,
            resolved: (row && row.resolved_count) || 0
        });
    });
};
