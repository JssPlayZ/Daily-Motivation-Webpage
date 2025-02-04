function updateGreeting() {
    const name = document.getElementById('nameInput').value;
    const greeting = document.getElementById('greeting');
    if (name) {
        greeting.textContent = `Hello, ${name}! Here's your quote for the day:`;
    } else {
        greeting.textContent = "Hello there! Here's your quote for the day:";
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
    quoteElement.textContent = `"${quote.text}" - ${quote.author}`;
}

// Fetch a random quote when the page loads
window.onload = fetchNewQuote;