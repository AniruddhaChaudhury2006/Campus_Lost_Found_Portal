const db = require('../config/db');

// GET /api/notifications/user/:userId - Fetch all notifications for a specific user
exports.getUserNotifications = (req, res) => {
    const userId = req.params.userId;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    const query = `
        SELECT 
            NOTIFICATIONS.NOTIFICATION_ID,
            NOTIFICATIONS.USER_ID,
            NOTIFICATIONS.ITEM_ID,
            NOTIFICATIONS.TITLE AS NOTIFICATION_TITLE,
            NOTIFICATIONS.MESSAGE,
            NOTIFICATIONS.TYPE AS NOTIFICATION_TYPE,
            NOTIFICATIONS.IS_READ,
            NOTIFICATIONS.CREATED_AT AS NOTIFIED_AT,
            ITEMS.TITLE AS ITEM_TITLE,
            ITEMS.DESCRIPTION AS ITEM_DESCRIPTION,
            ITEMS.CATEGORY AS ITEM_CATEGORY,
            ITEMS.LOCATION AS ITEM_LOCATION,
            ITEMS.DATE_EVENT AS ITEM_DATE_EVENT,
            ITEMS.TYPE AS ITEM_TYPE,
            ITEMS.IMAGE_URL AS ITEM_IMAGE_URL,
            ITEMS.STATUS AS ITEM_STATUS
        FROM NOTIFICATIONS
        JOIN ITEMS ON NOTIFICATIONS.ITEM_ID = ITEMS.ITEM_ID
        WHERE NOTIFICATIONS.USER_ID = ?
        ORDER BY NOTIFICATIONS.CREATED_AT DESC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows || []);
    });
};

// GET /api/notifications/count/:userId - Get unread notification count for badge
exports.getUnreadCount = (req, res) => {
    const userId = req.params.userId;
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required.' });
    }

    const query = `SELECT COUNT(*) AS count FROM NOTIFICATIONS WHERE USER_ID = ? AND IS_READ = 0`;
    db.get(query, [userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ count: row ? row.count : 0 });
    });
};

// PUT /api/notifications/:id/read - Mark single notification as read / acknowledged
exports.markAsRead = (req, res) => {
    const notificationId = req.params.id;
    const query = `UPDATE NOTIFICATIONS SET IS_READ = 1 WHERE NOTIFICATION_ID = ?`;

    db.run(query, [notificationId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Notification not found.' });
        res.json({ message: 'Notification marked as read.' });
    });
};

// PUT /api/notifications/user/:userId/read-all - Mark all notifications as read for a user
exports.markAllAsRead = (req, res) => {
    const userId = req.params.userId;
    const query = `UPDATE NOTIFICATIONS SET IS_READ = 1 WHERE USER_ID = ?`;

    db.run(query, [userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'All notifications marked as read.' });
    });
};

// DELETE /api/notifications/:id - Remove notification from queue
exports.deleteNotification = (req, res) => {
    const notificationId = req.params.id;
    const query = `DELETE FROM NOTIFICATIONS WHERE NOTIFICATION_ID = ?`;

    db.run(query, [notificationId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Notification not found.' });
        res.json({ message: 'Notification removed.' });
    });
};
