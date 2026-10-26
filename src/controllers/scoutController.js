const db = require('../config/db');
exports.handleChat = (req, res) => {
    const { USER_ID, MESSAGE } = req.body;
    const lowerMsg = (MESSAGE || '').toLowerCase();
    if (lowerMsg.includes('claim') || lowerMsg.includes('status')) {
        const query = `
            SELECT CLAIMS.*, ITEMS.TITLE AS ITEM_TITLE 
            FROM CLAIMS 
            JOIN ITEMS ON CLAIMS.ITEM_ID = ITEMS.ITEM_ID 
            WHERE CLAIMS.CLAIMANT_ID = ?
        `;
        db.all(query, [USER_ID], (err, claims) => {
            if (err) return res.status(500).json({ REPLY: "Sorry, I couldn't fetch your claims right now." });
            if (claims.length === 0) {
                return res.json({ REPLY: "You don't have any active claims submitted yet. Browse items and submit a claim to get started!" });
            }
            let reply = "Here are your current claim statuses:\n";
            claims.forEach(c => {
                reply += `- ${c.ITEM_TITLE}: Status is **${c.CLAIM_STATUS}**\n`;
            });
            return res.json({ REPLY: reply });
        });
    }
    else if (lowerMsg.includes('find') || lowerMsg.includes('lost') || lowerMsg.includes('search') || lowerMsg.length > 3) {
        const query = `SELECT * FROM ITEMS WHERE STATUS = 'Open' AND (TITLE LIKE ? OR DESCRIPTION LIKE ? OR CATEGORY LIKE ?)`;
        const searchTerm = `%${MESSAGE}%`;       
        db.all(query, [searchTerm, searchTerm, searchTerm], (err, items) => {
            if (err) return res.status(500).json({ REPLY: "Sorry, I had trouble searching the item registry." });
            if (items.length === 0) {
                return res.json({ REPLY: `I searched open campus items, but couldn't find anything matching "${MESSAGE}". Try searching a broader term like 'Electronics' or 'Book'.` });
            }
            let reply = `I found ${items.length} matching open item(s):\n`;
            items.forEach(i => {
                reply += `- **${i.TITLE}** (${i.TYPE}) found at ${i.LOCATION} on ${i.DATE_EVENT}. ${i.DESCRIPTION}\n`;
            });
            return res.json({ REPLY: reply });
        });
    }
    else {
        res.json({ 
            REPLY: "I'm Scout, your offline campus assistant! You can ask me things like:\n• 'Do you have my keys?'\n• 'Show my claim status'\n• 'Search for electronics'" 
        });
    }
};