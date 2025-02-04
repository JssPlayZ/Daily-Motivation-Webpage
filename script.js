function updateGreeting() {
    const name = document.getElementById('nameInput').value;
    const greeting = document.getElementById('greeting');
    if (name) {
        greeting.textContent = `Hello, ${name}! Here's your quote for the day:`;
    } else {
        greeting.textContent = "Hello there! Here's your quote for the day:";
    }
}

async function fetchNewQuote() {
    try {
        const response = await fetch('https://api.quotable.io/random');
        const data = await response.json();
        const quoteElement = document.getElementById('quote');
        quoteElement.textContent = `"${data.content}" - ${data.author}`;
    } catch (error) {
        console.error('Error fetching quote:', error);
        const quoteElement = document.getElementById('quote');
        quoteElement.textContent = "Failed to fetch a new quote. Please try again later.";
    }
}

// Fetch a code
window.onload = fetchNewQuote;