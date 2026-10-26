exports.requireAuth = (req, res, next) => {
    const userId = req.headers['x-user-id'] || req.body.user_id;
    if (!userId) {
        return res.status(401).json({ error: 'Access denied. User ID required.' });
    }
    req.user_id = userId;
    next();
};
exports.requireAdmin = (req, res, next) => {
    const role = req.headers['x-user-role'] || req.body.role;
    if (role !== 'admin') {
        return res.status(403).json({ error: 'Administrator access required.' });
    }
    next();
};