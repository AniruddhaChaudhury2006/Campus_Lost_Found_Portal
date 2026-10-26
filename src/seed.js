const db = require('./config/db');
const seedItems = [
    [2, 'Laptop', 'Silver Dell laptop with programming stickers', 'Electronics', 'Student Center', '2026-03-11', 'Lost', 'Open'],
    [2, 'Book', 'Data Structures and Algorithms textbook', 'Books', 'Main Library', '2026-03-11', 'Lost', 'Open'],
    [1, 'Headphones', 'Wireless Bluetooth headphones in black case', 'Electronics', 'Student Center', '2026-03-11', 'Found', 'Open'],
    [1, 'Air Pod', 'Single Apple Airpod Pro left earbud', 'Accessories', 'Parking Lot', '2026-03-11', 'Found', 'Open'],
    [2, 'Calculator', 'Casio scientific calculator fx-991ES', 'Electronics', 'Science Block Room 402', '2026-03-12', 'Lost', 'Open'],
    [1, 'Water Bottle', 'Blue insulated steel flask with stickers', 'Accessories', 'Cafeteria', '2026-03-12', 'Found', 'Open'],
    [2, 'ID Card', 'University Student ID card for Computer Science Dept', 'Accessories', 'Auditorium Hall', '2026-03-13', 'Lost', 'Open'],
    [1, 'Smartwatch', 'Black fitness band with silicone strap', 'Electronics', 'Sports Complex', '2026-03-13', 'Found', 'Open'],
    [2, 'Lab Coat', 'White cotton laboratory coat size M', 'Other', 'Chemistry Lab 3', '2026-03-14', 'Lost', 'Open'],
    [1, 'Umbrella', 'Compact black folding umbrella', 'Other', 'Main Gate Security Post', '2026-03-14', 'Found', 'Open'],
    [2, 'Keychain', 'Metal ring with 3 keys and a red keychain strap', 'Accessories', 'Bus Stop', '2026-03-15', 'Lost', 'Open'],
    [1, 'Charger', 'Apple 65W USB-C power adapter and cable', 'Electronics', 'Computer Lab 2', '2026-03-15', 'Found', 'Open'],
    [2, 'Notebook', 'Spiral-bound ruled notebook with lecture notes', 'Books', 'Lecture Hall 1', '2026-03-16', 'Lost', 'Open'],
    [1, 'Sunglasses', 'Ray-Ban aviator sunglasses with brown case', 'Accessories', 'Botanical Garden', '2026-03-16', 'Found', 'Open'],
    [2, 'Flash Drive', 'SanDisk 64GB USB 3.0 thumb drive', 'Electronics', 'Library Reading Room', '2026-03-17', 'Lost', 'Open']
];
db.serialize(() => {
    db.run(`INSERT OR IGNORE INTO USERS (USER_ID, EMAIL, FULL_NAME, ROLE) VALUES (1, 'admin@campus.edu', 'System Administrator', 'Admin')`);
    db.run(`INSERT OR IGNORE INTO USERS (USER_ID, EMAIL, FULL_NAME, ROLE) VALUES (2, 'student@campus.edu', 'Aniruddha Chaudhury', 'Student')`);
    const stmt = db.prepare(`INSERT OR IGNORE INTO ITEMS (USER_ID, TITLE, DESCRIPTION, CATEGORY, LOCATION, DATE_EVENT, TYPE, STATUS) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
    seedItems.forEach(item => stmt.run(item));
    stmt.finalize(() => {
        db.get(`SELECT COUNT(*) AS count FROM ITEMS`, (err, row) => {
            if (!err) console.log(`SUCCESS: Total items currently in database -> ${row.count}`);
            db.close();
        });
    });
});