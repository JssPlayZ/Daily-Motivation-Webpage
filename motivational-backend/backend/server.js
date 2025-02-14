require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("./database"); 
const authenticateToken = require("./middleware");

const app = express();
app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
    console.log("Received Signup Request:", req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) { 
        return res.status(400).json({ error: "Missing username, email, or password" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.query(
            "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)", 
            [username, email, hashedPassword], 
            (err, result) => {
                if (err) {
                    console.error("Database Insert Error:", err.sqlMessage);
                    return res.status(500).json({ error: "Database error", details: err.sqlMessage });
                }
                res.json({ message: "Signup successful!" });
            }
        );
    } catch (error) {
        console.error("Unexpected Signup Error:", error);
        res.status(500).json({ error: "Unexpected server error" });
    }
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log("Login Attempt:", username, password);

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
        console.log("Retrieved User:", user);

        if (!user.password_hash) {
            console.error("User record does not contain a password_hash field");
            return res.status(500).json({ error: "Password field is missing in database" });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log("Password Match:", isMatch);

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

        console.log("Fetching quotes for:", decoded.username);

        const query = `
            SELECT text, author 
            FROM user_submissions 
            WHERE user_id = (SELECT id FROM users WHERE username = ?)
        `;

        db.query(query, [decoded.username], (err, results) => {
            if (err) {
                console.error("Database Error:", err.sqlMessage);
                return res.status(500).json({ error: "Database error", details: err.sqlMessage });
            }
            console.log("Quotes Retrieved:", results);
            res.json({ quotes: results });
        });
    });
});

app.post("/api/submit-quote", authenticateToken, (req, res) => {
    console.log("User submitting quote:", req.user);
    const user_id = req.user.id;
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

app.get("/random-quote", async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT text, author FROM quotes ORDER BY RAND() LIMIT 1");
        if (rows.length === 0) return res.status(404).json({ error: "No quotes found" });

        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching quote:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));