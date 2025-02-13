const bcrypt = require("bcryptjs");

async function generatePassword() {
    const hashedPassword = await bcrypt.hash("password123", 10);
    console.log(hashedPassword);
}

generatePassword();