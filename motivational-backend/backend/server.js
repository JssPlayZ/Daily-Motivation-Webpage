require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("./database"); // ✅ Fix: Import database connection
const authenticateToken = require("./middleware"); // ✅ Fix: Import middleware

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Signup Route
app.post("/signup", async (req, res) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ error: "Database error" });
        res.json({ message: "Signup successful!" });
    });
});

// ✅ Login Route
app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log("Login Attempt:", username, password); // Debugging log

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        if (results.length === 0) {
            console.log("User not found");
            return res.status(401).json({ error: "User not found" });
        }

        const user = results[0];
        console.log("Retrieved User:", user); // Debugging log

        // ✅ Fix: Use `password_hash` instead of `password`
        if (!user.password_hash) {
            console.error("User record does not contain a password_hash field");
            return res.status(500).json({ error: "Password field is missing in database" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log("Password Match:", isMatch); // ✅ Debugging log

        if (!isMatch) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: "1h" });
        res.json({ token });
    });
});

app.get("/api/profile", (req, res) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Invalid token" });

        res.json({ user: { username: decoded.username } });
    });
});

app.get("/api/my-quotes", (req, res) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Invalid token" });

        console.log("Fetching quotes for:", decoded.username); // ✅ Debugging

        const query = `
            SELECT text, author 
            FROM user_submissions 
            WHERE user_id = (SELECT id FROM users WHERE username = ?)
        `;

        db.query(query, [decoded.username], (err, results) => {
            if (err) {
                console.error("Database Error:", err.sqlMessage); // ✅ Log full SQL error
                return res.status(500).json({ error: "Database error", details: err.sqlMessage });
            }
            console.log("Quotes Retrieved:", results); // ✅ Debugging
            res.json({ quotes: results });
        });
    });
});

app.post("/api/submit-quote", authenticateToken, (req, res) => {
    console.log("User submitting quote:", req.user);
    const user_id = req.user.id; // ERROR LINE
    const { text, author } = req.body;
    
    if (!text || !author) {
        return res.status(400).json({ error: "Missing quote text or author" });
    }

    db.query(
        "INSERT INTO user_submissions (user_id, text, author) VALUES (?, ?, ?)",
        [user_id, text, author],
        (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ message: "Quote submitted successfully" });
        }
    );
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));