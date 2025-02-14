const themeButton = document.getElementById('themeToggle');
const body = document.body;

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    body.classList.add(savedTheme);
    updateThemeButtonText();
}

themeButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    updateThemeButtonText();
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

async function newQuote() {
    try {
        const response = await fetch("http://localhost:5000/random-quote");
        if (!response.ok) throw new Error("Failed to fetch quote");

        const data = await response.json();
        document.getElementById("quote").innerText = `"${data.text}" - ${data.author}`;
    } catch (error) {
        console.error("Error fetching new quote:", error);
        document.getElementById("quote").innerText = "Failed to load a new quote.";
    }
}


async function submitQuote() {
    const text = document.getElementById("quote-text").value.trim();
    const author = document.getElementById("quote-author").value.trim();
    const token = localStorage.getItem("token");

    console.log("Stored Token Before Fetch:", token);

    if (!token) {
        alert("You must be logged in to submit a quote!");
        window.location.href = "login.html";
        return;
    }

    if (!text || !author) {
        alert("Please enter both the quote text and the author's name.");
        return;
    }

    try {
        const response = await fetch("http://localhost:5000/api/submit-quote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ text, author })
        });

        const data = await response.json();
        console.log("Quote Submission Response:", data);

        if (!response.ok) {
            alert(`Error submitting quote: ${data.error || "Unknown error"}`);
        } else {
            alert("Quote submitted successfully!");
            
            document.getElementById("quote-text").value = "";
            document.getElementById("quote-author").value = "";
        }
    } catch (error) {
        console.error("Error submitting quote:", error);
        alert("Failed to submit quote. Please try again later.");
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

        window.location.href = "login.html";

    } catch (error) {
        console.error("Signup Error:", error);
        alert("Failed to sign up. Please try again.");
    }
}

async function login() {
    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    console.log("Logging in with:", username, password); 

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
    localStorage.removeItem("token"); 
    alert("Logged out successfully!");
    window.location.href = "login.html"; 
}

async function getUserProfile() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to view this page!");
        window.location.href = "login.html";
        return;
    }

    const response = await fetch("http://localhost:5000/api/profile", {
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
    console.log("User Quotes Response:", data); 

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
    const quotesContainer = document.getElementById("quotesList"); 

    const token = localStorage.getItem("token");

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
                quoteText.value = ""; 
                quoteAuthor.value = ""; 
                fetchQuotes();
            } else {
                alert(`❌ Error submitting quote: ${data.error}`);
            }
        } catch (error) {
            console.error("Submission Error:", error);
            alert("❌ Failed to submit quote!");
        }
    });

    async function fetchQuotes() {
        try {
            const response = await fetch('/quotes');
            const quotes = await response.json();
    
            const quoteList = document.getElementById('quoteList');
            quoteList.innerHTML = '';
    
            quotes.forEach(quote => {
                const li = document.createElement('li');
                li.innerHTML = `"${quote.text}" - <strong>${quote.author}</strong>`;
                quoteList.appendChild(li);
            });
        } catch (error) {
            console.error('Error fetching quotes:', error);
        }
    }

    fetchQuotes();
});

fetchMyQuotes();