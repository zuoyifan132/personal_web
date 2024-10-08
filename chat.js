// OpenAI API configuration
const OPENAI_API_KEY = 'api key'; // Replace with your actual API key
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// Get DOM elements
const chatWidget = document.getElementById('chat-widget');
const chatIcon = chatWidget.querySelector('.chat-icon');
const chatWindow = chatWidget.querySelector('.chat-window');
const chatMessages = chatWidget.querySelector('.chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = chatWidget.querySelector('.send-message');
const closeButton = chatWidget.querySelector('.close-chat');

// Open/close chat window
chatIcon.addEventListener('click', () => {
    chatWidget.classList.toggle('chat-open');
    if (chatWidget.classList.contains('chat-open')) {
        userInput.focus(); // Focus input when chat window opens
    }
});

closeButton.addEventListener('click', () => {
    chatWidget.classList.remove('chat-open');
});

// Send message
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        addMessageToChat('user', message);
        userInput.value = '';
        callOpenAIAPI(message);
    }
}

function addMessageToChat(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `${sender}-message`);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function callOpenAIAPI(message) {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message }],
                temperature: 0.7
            })
        });

        console.log('API Response:', data); // 打印API响应

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content.trim();
        addMessageToChat('ai', aiResponse);
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('ai', 'Sorry, something went wrong. Please try again later.');
    }
}

export async function sendMessageToAPI(message) {
    // Your existing function implementation
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: message }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

// Initialize chat window
document.addEventListener('DOMContentLoaded', () => {
    chatWidget.classList.add('chat-closed');
});