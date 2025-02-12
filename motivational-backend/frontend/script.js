document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded and parsed");
});

function updateGreeting() {
    const name = document.getElementById('nameInput').value;
    const greeting = document.getElementById('greeting');
    if (name) {
        greeting.textContent = `Hello, ${name}! Here's your quote for the day:`;
    } else {
        greeting.textContent = "Hello there! Here's your quote for the day:";
    }
}

// Dark/Light Mode Toggle
const themeButton = document.getElementById('themeButton');
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

const quotes = [
    {
        text: "The only limit to our realization of tomorrow is our doubts of today.",
        author: "Franklin D. Roosevelt"
    },
    {
        text: "Do what you can, with what you have, where you are.",
        author: "Theodore Roosevelt"
    },
    {
        text: "Believe you can and you're halfway there.",
        author: "Theodore Roosevelt"
    },
    {
        text: "It always seems impossible until it's done.",
        author: "Nelson Mandela"
    },
    {
        text: "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        author: "Winston Churchill"
    },
    {
        text: "The best time to plant a tree was 20 years ago. The second best time is now.",
        author: "Chinese Proverb"
    },
    {
        text: "You are never too old to set another goal or to dream a new dream.",
        author: "C.S. Lewis"
    },
    {
        text: "The future belongs to those who believe in the beauty of their dreams.",
        author: "Eleanor Roosevelt"
    },
    {
        text: "Strive not to be a success, but rather to be of value.",
        author: "Albert Einstein"
    },
    {
        text: "Your time is limited, don't waste it living someone else's life.",
        author: "Steve Jobs"
    }
];

function getRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
}

function fetchNewQuote() {
    const quote = getRandomQuote();
    const quoteElement = document.getElementById('quote');
    quoteElement.style.opacity = 0;
    setTimeout(() => {
        quoteElement.textContent = `"${quote.text}" - ${quote.author}`;
        quoteElement.style.opacity = 1;
    }, 100);
}

// Fetch a random quote when the page loads
window.onload = fetchNewQuote;

function loadSubmittedQuotes() {
    const quotes = JSON.parse(localStorage.getItem('userQuotes')) || [];
    const quoteList = document.getElementById('quoteList');
    quoteList.innerHTML = ''; 
    quotes.forEach((quote, index) => {
        const li = document.createElement('li');
        li.textContent = `"${quote.text}" - ${quote.author || 'Anonymous'}`;
        quoteList.appendChild(li);
    });
}

document.getElementById('quoteForm').addEventListener('submit', (e) => {
    e.preventDefault(); 
    const userQuote = document.getElementById('userQuote').value;
    const userAuthor = document.getElementById('userAuthor').value;

    if (userQuote) {
        const newQuote = {
            text: userQuote,
            author: userAuthor || 'Anonymous'
        };

        // Save the quote to localStorage
        const quotes = JSON.parse(localStorage.getItem('userQuotes')) || [];
        quotes.push(newQuote);
        localStorage.setItem('userQuotes', JSON.stringify(quotes));

        loadSubmittedQuotes();

        document.getElementById('userQuote').value = '';
        document.getElementById('userAuthor').value = '';
    }
});

// Load submitted quotes when the page loads
window.onload = () => {
    fetchNewQuote();
    loadSubmittedQuotes();
};

async function signup() {
    const username = document.getElementById("signup-username").value;
    const email = document.getElementById("signup-email").value;
    const password = document.getElementById("signup-password").value;

    const response = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
    });

    const data = await response.json();
    alert(data.message);
}

async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (response.ok) {
        alert("Login successful!");
        localStorage.setItem("token", data.token); // Store JWT Token
    } else {
        alert(data.error);
    }
}

async function fetchProtectedData() {
    const token = localStorage.getItem("token"); // Get token from localStorage

    const response = await fetch("http://localhost:5000/protected", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}` // Send token in header
        }
    });

    const data = await response.json();
    console.log(data);
}