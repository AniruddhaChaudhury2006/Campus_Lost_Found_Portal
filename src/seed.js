const db = require('./config/db');
const fs = require('fs');
const path = require('path');

const seedLocations = [
    path.resolve(__dirname, '../database/seed.sql'),
    path.resolve(__dirname, '../../seed.sql'),
    path.resolve(__dirname, '../seed.sql')
];

let seedSql = null;
for (const p of seedLocations) {
    if (fs.existsSync(p)) {
        seedSql = fs.readFileSync(p, 'utf-8');
        break;
    }
}

if (!seedSql) {
    console.error('Could not find seed.sql file.');
    process.exit(1);
}

db.exec(seedSql, (err) => {
    if (err) {
        console.error('Seeding error:', err.message);
        db.close();
        process.exit(1);
    }

    db.get('SELECT COUNT(*) AS count FROM ITEMS', (err, row) => {
        if (!err) {
            console.log(`SUCCESS: Total campus records in database -> ${row.count}`);
        }
        db.close();
    });
});
