function updateGreeting() {
    const name = document.getElementById('nameInput').value;
    const greeting = document.getElementById('greeting');
    if (name) {
        greeting.textContent = `Hello, ${name}! Here's your quote for the day:`;
    } else {
        greeting.textContent = "Hello there! Here's your quote for the day:";
    }
}