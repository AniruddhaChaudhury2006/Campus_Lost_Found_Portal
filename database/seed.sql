-- =======================================================
-- CAMPUS LOST AND FOUND PORTAL - SEED / DUMMY DATA (SQL)
-- =======================================================

-- 1. SEED DEFAULT USERS (Student & Administrator)
INSERT OR IGNORE INTO USERS (USER_ID, EMAIL, FULL_NAME, ROLE) VALUES
(1, 'admin@campus.edu', 'System Administrator', 'Admin'),
(2, 'student@campus.edu', 'Aniruddha Chaudhury', 'Student'),
(3, 'priya.sharma@campus.edu', 'Priya Sharma', 'Student');

-- 2. SEED SAMPLE LOST AND FOUND ITEMS
INSERT OR IGNORE INTO ITEMS (ITEM_ID, USER_ID, TITLE, DESCRIPTION, CATEGORY, LOCATION, DATE_EVENT, TYPE, STATUS) VALUES
(1, 2, 'Silver Dell Laptop', 'Dell Inspiron 15 with programming stickers on the lid. Left near the charging outlet.', 'Electronics', 'Student Center', '2026-03-11', 'Lost', 'Open'),
(2, 2, 'Data Structures Book', 'CLRS algorithms textbook with highlighted yellow pages and student notes inside.', 'Books', 'Main Library', '2026-03-11', 'Lost', 'Open'),
(3, 1, 'Black Over-Ear Headphones', 'Sony wireless noise-canceling headphones inside a black zippered case. Found on a study desk.', 'Electronics', 'Student Center', '2026-03-11', 'Found', 'Open'),
(4, 1, 'Left AirPod Pro', 'Single Apple AirPods Pro (left earbud) found near Parking Lot slot B-14.', 'Electronics', 'Parking Lot', '2026-03-11', 'Found', 'Open'),
(5, 2, 'Scientific Calculator', 'Casio FX-991EX scientific calculator with a faded math formula sticker.', 'Electronics', 'Science Block Room 402', '2026-03-12', 'Lost', 'Open'),
(6, 1, 'Blue Insulated Water Bottle', 'Stainless steel blue Milton thermos flask with a campus sports sticker.', 'Accessories', 'Cafeteria', '2026-03-12', 'Found', 'Open'),
(7, 2, 'University Student ID Card', 'CS Department student ID card with lanyard found on auditorium chairs.', 'Accessories', 'Auditorium Hall', '2026-03-13', 'Lost', 'Open'),
(8, 1, 'Smart Fitness Band', 'Black fitness tracker band with silicone strap and magnetic charger port.', 'Electronics', 'Sports Complex', '2026-03-13', 'Found', 'Open'),
(9, 2, 'Chemistry Lab Coat', 'White cotton laboratory coat, size Medium, with red ballpoint pen in pocket.', 'Other', 'Chemistry Lab 3', '2026-03-14', 'Lost', 'Open'),
(10, 1, 'Black Folding Umbrella', 'Compact automatic three-fold black umbrella handed to security desk.', 'Other', 'Main Gate Security Post', '2026-03-14', 'Found', 'Open');

-- 3. SEED A SAMPLE PENDING CLAIM (FOR ADMIN REVIEW QUEUE DEMO)
INSERT OR IGNORE INTO CLAIMS (CLAIM_ID, ITEM_ID, CLAIMANT_ID, PROOF_DESCRIPTION, CLAIM_STATUS) VALUES
(1, 3, 2, 'Private Proof: The headphone case has my initials "A.C." written in white ink on the bottom inside pouch.', 'Pending');

