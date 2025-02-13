const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
    const authHeader = req.headers["authorization"];
    console.log("Received Authorization Header:", authHeader); // ✅ Debugging

    const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
        console.log("No token provided");
        return res.status(401).json({ error: "No token provided" });
    }

    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            console.log("Invalid token:", err);
            return res.status(403).json({ error: "Invalid token" });
        }

        console.log("Decoded JWT User:", user); // ✅ Debugging
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;