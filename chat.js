// OpenAI API configuration
let OPENAI_API_KEY = ''; // Initially set to empty
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const PERSONAL_API_ENDPOINT = 'https://00a3-202-101-22-90.ngrok-free.app/api/generate';

// Get DOM elements
const chatWidget = document.getElementById('chat-widget');
const chatIcon = chatWidget.querySelector('.chat-icon');
const chatWindow = chatWidget.querySelector('.chat-window');
const chatMessages = chatWidget.querySelector('.chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = chatWidget.querySelector('.send-message');
const closeButton = chatWidget.querySelector('.close-chat');

// Model selection dropdown
const modelSelect = document.getElementById('model-select');

// Add API key input field
const apiKeyInput = document.createElement('input');
apiKeyInput.type = 'text';
apiKeyInput.placeholder = '请输入您的API密钥';
apiKeyInput.classList.add('api-key-input');
chatWindow.insertBefore(apiKeyInput, chatMessages);

// Toggle chat window open/close
chatIcon.addEventListener('click', () => {
    chatWidget.classList.toggle('chat-open');
    if (chatWidget.classList.contains('chat-open')) {
        chatWindow.style.display = 'flex'; // Ensure window is visible
        const selectedModel = modelSelect.value;
        if (selectedModel !== 'qwen2.5-3b-instruct' && !OPENAI_API_KEY) {
            apiKeyInput.focus(); // Focus on API key input if needed
        } else {
            userInput.focus();
        }
    } else {
        chatWindow.style.display = 'none'; // Ensure window is hidden
    }
});

closeButton.addEventListener('click', () => {
    chatWidget.classList.remove('chat-open');
    chatWindow.style.display = 'none'; // Ensure window is hidden
});

// Handle sending message
sendButton.addEventListener('click', () => handleSendMessage());
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSendMessage();
});

function handleSendMessage() {
    const message = userInput.value.trim();
    const selectedModel = modelSelect.value;

    if (!message) return; // Don't send empty messages

    if (selectedModel !== 'qwen2.5-3b-instruct' && !OPENAI_API_KEY) {
        OPENAI_API_KEY = apiKeyInput.value.trim();
        if (!OPENAI_API_KEY) {
            alert('请先输入API密钥');
            return;
        }
    }

    addMessageToChat('user', message); // Display user's message in chat
    userInput.value = ''; // Clear input field

    // Call the appropriate API depending on the selected model
    callAPI(selectedModel, message);
}

// Function to add message to chat window
function addMessageToChat(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', `${sender}-message`);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the latest message
}

// Call the appropriate API depending on model
async function callAPI(selectedModel, message) {
    try {
        let apiEndpoint = API_ENDPOINT;
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        };
        let body = {
            model: selectedModel,
            messages: [{ role: 'user', content: message }],
            temperature: 0.7
        };

        if (selectedModel === 'qwen2.5-3b-instruct') {
            // Use the personal API endpoint for this model
            apiEndpoint = PERSONAL_API_ENDPOINT;
            headers = { 'Content-Type': 'application/json' }; // Remove Authorization header
            body = { prompt: message };
        }

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        let aiResponse = '';

        if (selectedModel === 'qwen2.5-3b-instruct') {
            // Handle custom API response format
            aiResponse = data.response?.trim() || '未获得有效回复。';
        } else {
            // Handle OpenAI response format
            aiResponse = data.choices[0].message.content.trim();
        }

        addMessageToChat('ai', aiResponse);
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('ai', '抱歉, 出现了错误。请稍后再试。');
    }
}

// Initialize chat window
document.addEventListener('DOMContentLoaded', () => {
    chatWidget.classList.add('chat-closed');
    chatWindow.style.display = 'none'; // Ensure window is hidden on load
    makeDraggable(chatWidget); // Enable drag-and-drop functionality
});

// Make chat window draggable
function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    element.addEventListener('mousedown', (e) => {
        if (e.target !== chatIcon) return; // Only start drag when the icon is clicked
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = element.offsetLeft;
        initialY = element.offsetTop;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function onMouseMove(e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const newX = initialX + dx;
        const newY = initialY + dy;

        // Prevent dragging the window off-screen
        const maxX = window.innerWidth - element.offsetWidth;
        const maxY = window.innerHeight - element.offsetHeight;
        element.style.left = `${Math.min(Math.max(0, newX), maxX)}px`;
        element.style.top = `${Math.min(Math.max(0, newY), maxY)}px`;
    }

    function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}