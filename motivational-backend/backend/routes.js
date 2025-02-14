const express = require("express");
const db = require("./database");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authenticate = require("./middleware");

const router = express.Router();

router.post("/signup", async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "User registered successfully" });
    });
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;

    db.query("SELECT * FROM users WHERE username = ?", [username], async (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: "Invalid credentials" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.id, username: user.username }, process.env.SECRET_KEY, { expiresIn: "1h" });
        res.json({ token });
    });
});

router.get("/profile", authenticate, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;