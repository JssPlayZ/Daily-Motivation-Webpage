function toggleTheme() {
    document.body.classList.toggle("light-mode");
}

function getMotivation() {
    alert("Stay positive and keep pushing forward!");
}

function newQuote() {
    document.getElementById("quote").innerText = "The best way to predict the future is to create it. - Peter Drucker";
}

async function submitQuote() {
    const text = document.getElementById("quote-text").value;
    const author = document.getElementById("quote-author").value;
    const token = localStorage.getItem("token");

    console.log("Stored Token Before Fetch:", token); // ✅ Debugging

    if (!token) {
        alert("You must be logged in to submit a quote!");
        window.location.href = "login.html";
        return;
    }

    const response = await fetch("http://localhost:5000/api/submit-quote", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // ✅ Make sure it's "Bearer <token>"
        },
        body: JSON.stringify({ text, author })
    });

    const data = await response.json();
    console.log("Quote Submission Response:", data);

    if (!response.ok) {
        alert(`Error submitting quote: ${data.error || "Unknown error"}`);
    } else {
        alert("Quote submitted successfully!");
    }
}


async function signup() {
    const username = document.getElementById("signup-username").value;
    const password = document.getElementById("signup-password").value;
    const response = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    alert(data.message);
}

async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    console.log("Logging in with:", username, password); // Debugging

    const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
        console.error("Server Error:", response.status);
        alert("Login failed: Server error");
        return;
    }

    const data = await response.json();
    console.log("Login Response:", data);

    if (data.token) {
        localStorage.setItem("token", data.token);
        alert("Login successful!");
        window.location.href = "index.html";
    } else {
        alert("Login failed: " + (data.error || data.message));
    }
}


function logout() {
    localStorage.removeItem("token"); // Remove token from storage
    alert("Logged out successfully!");
    window.location.href = "login.html"; // Redirect to login page
}

async function getUserProfile() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to view this page!");
        window.location.href = "login.html";
        return;
    }

    const response = await fetch("http://localhost:5000/api/profile", { // ✅ Fixed URL
        method: "GET",
        headers: { "Authorization": token }
    });

    if (!response.ok) {
        console.error("Server Error:", response.status);
        alert("Failed to fetch user profile.");
        return;
    }

    const data = await response.json();
    console.log("User Profile:", data);

    if (data.user) {
        document.getElementById("user-info").innerText = `Welcome, ${data.user.username}!`;
    } else {
        alert("Session expired, please login again.");
        logout();
    }
}

async function fetchMyQuotes() {
    const token = localStorage.getItem("token");

    if (!token) return;

    const response = await fetch("http://localhost:5000/api/my-quotes", {
        method: "GET",
        headers: { "Authorization": token }
    });

    const data = await response.json();
    console.log("User Quotes Response:", data); // ✅ Debugging

    if (!data.quotes || !Array.isArray(data.quotes)) {
        console.error("Quotes data is invalid:", data);
        return;
    }

    const quotesContainer = document.getElementById("submitted-quotes");
    quotesContainer.innerHTML = "";

    data.quotes.forEach(q => {
        const quoteElement = document.createElement("div");
        quoteElement.innerText = `"${q.text}" - ${q.author}`;
        quotesContainer.appendChild(quoteElement);
    });
}

fetchMyQuotes();