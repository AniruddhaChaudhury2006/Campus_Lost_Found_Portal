const db = require('../config/db');
exports.getItems = (req, res) => {
  const type = req.query.TYPE || req.query.type;
  const category = req.query.CATEGORY || req.query.category;
  const location = req.query.LOCATION || req.query.location;
  const search = req.query.SEARCH || req.query.search;
  let QUERY = `SELECT ITEMS.*, USERS.FULL_NAME AS REPORTER_NAME FROM ITEMS JOIN USERS ON ITEMS.USER_ID = USERS.USER_ID WHERE ITEMS.STATUS = 'Open' `;
  const PARAMS = [];
  if (type) { QUERY += `AND ITEMS.TYPE = ? `; PARAMS.push(type); }
  if (category) { QUERY += `AND ITEMS.CATEGORY = ? `; PARAMS.push(category); }
  if (location) { QUERY += `AND ITEMS.LOCATION = ? `; PARAMS.push(location); }
  if (search) { 
    QUERY += `AND (ITEMS.TITLE LIKE ? OR ITEMS.DESCRIPTION LIKE ?) `; 
    PARAMS.push(`%${search}%`, `%${search}%`);
  }   
  QUERY += `ORDER BY ITEMS.CREATED_AT DESC`;    
  db.all(QUERY, PARAMS, (ERR, ROWS) => {
    if (ERR) return res.status(500).json({ ERROR: ERR.message });
    res.json(ROWS);
  });
};
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
  const query = `INSERT INTO ITEMS (USER_ID, TITLE, DESCRIPTION, CATEGORY, LOCATION, DATE_EVENT, TYPE, IMAGE_URL, STATUS) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Open')`;        
  db.run(query, [userId, title, description, category, location, dateEvent, type, imageUrl], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'Report created successfully', item_id: this.lastID });
  });            
};