const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const dbPath = path.resolve(__dirname, '../../database/campus_find.db');
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) { fs.mkdirSync(dbDir, { recursive: true }); }
const db = new sqlite3.Database(dbPath, (err) => {
if (err) console.error('Database connection error:', err.message);
else console.log('Connected to Campus Lost And Found Database.');
});
const schemaPath = path.resolve(__dirname, '../../database/schema.sql');
if (fs.existsSync(schemaPath)) {
const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schemaSql);
}
module.exports = db;