const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to the SQLite database file in the project root
const dbPath = path.resolve(__dirname, '../../database.sqlite');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log(`Connected to SQLite database at ${dbPath}`);
    }
});

// Load and execute schema.sql automatically
const schemaLocations = [
    path.resolve(__dirname, '../../schema.sql'),
    path.resolve(__dirname, '../../database/schema.sql')
];

for (const schemaPath of schemaLocations) {
    if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        db.exec(schemaSql, (err) => {
            if (err) {
                console.error('Error applying schema.sql:', err.message);
            }
        });
        break;
    }
}

module.exports = db;
