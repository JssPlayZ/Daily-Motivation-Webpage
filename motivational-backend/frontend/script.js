// Dark/Light Mode Toggle
const themeButton = document.getElementById('themeToggle');
const body = document.body;

// Check localStorage for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.classList.add(savedTheme);
    updateThemeButtonText();
}

themeButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    updateThemeButtonText();
    // Save theme preference to localStorage
    const currentTheme = body.classList.contains('dark-mode') ? 'dark-mode' : '';
    localStorage.setItem('theme', currentTheme);
});

function updateThemeButtonText() {
    if (body.classList.contains('dark-mode')) {
        themeButton.textContent = '☀️ Light Mode';
    } else {
        themeButton.textContent = '🌙 Dark Mode';
    }
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
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    try {
        const response = await fetch("http://localhost:5000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            throw new Error(`Signup failed: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        alert(data.message || "Signup successful! Redirecting...");

        // ✅ Redirect to login page after successful signup
        window.location.href = "login.html";

    } catch (error) {
        console.error("Signup Error:", error);
        alert("Failed to sign up. Please try again.");
    }
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

document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submitQuote");
    const quoteText = document.getElementById("quoteText");
    const quoteAuthor = document.getElementById("quoteAuthor");
    const quotesContainer = document.getElementById("quotesList"); // Container for quotes

    // Fetch stored token from local storage
    const token = localStorage.getItem("token");

    // Function to submit a quote
    submitButton.addEventListener("click", async () => {
        const text = quoteText.value.trim();
        const author = quoteAuthor.value.trim();

        if (!text || !author) {
            alert("Please fill in both fields!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/submit-quote", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify({ text, author })
            });

            const data = await response.json();
            if (response.ok) {
                alert("✅ Quote submitted successfully!");
                quoteText.value = ""; // Clear input field
                quoteAuthor.value = ""; // Clear input field
                fetchQuotes(); // Refresh quotes instantly
            } else {
                alert(`❌ Error submitting quote: ${data.error}`);
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("❌ Failed to submit quote!");
        }
    });

    // Function to fetch and display quotes
    async function fetchQuotes() {
        try {
            const response = await fetch("http://localhost:5000/api/my-quotes", {
                headers: { "Authorization": token }
            });

            const data = await response.json();
            if (response.ok) {
                quotesContainer.innerHTML = ""; // Clear existing quotes
                data.quotes.forEach((quote) => {
                    const quoteElement = document.createElement("p");
                    quoteElement.textContent = `"${quote.text}" - ${quote.author}`;
                    quotesContainer.appendChild(quoteElement);
                });
            } else {
                console.error("Error fetching quotes:", data.error);
            }
        } catch (error) {
            console.error("Fetch Quotes Error:", error);
        }
    }

    fetchQuotes(); // Load quotes on page load
});

fetchMyQuotes();