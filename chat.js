import OpenAI from 'openai';

const client = new OpenAI();

// OpenAI API配置
const OPENAI_API_KEY = 'OPENAI_API_KEY'; // 请替换为您的实际API密钥
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';

// 获取DOM元素
const chatWidget = document.getElementById('chat-widget');
const chatIcon = chatWidget.querySelector('.chat-icon');
const chatWindow = chatWidget.querySelector('.chat-window');
const chatMessages = chatWidget.querySelector('.chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = chatWidget.querySelector('.send-message');
const closeButton = chatWidget.querySelector('.close-chat');

// 打开/关闭聊天窗口
chatIcon.addEventListener('click', () => {
    chatWidget.classList.toggle('chat-open');
    if (chatWidget.classList.contains('chat-open')) {
        userInput.focus(); // 聊天窗口打开时，让输入框获得焦点
    }
});

closeButton.addEventListener('click', () => {
    chatWidget.classList.remove('chat-open');
});

// 发送消息
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
                model: "gpt-4o-mini",
                messages: [{role: "user", content: message}],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('API请求失败');
        }

        const data = await response.json();
        const aiResponse = data.choices[0].message.content.trim();
        addMessageToChat('ai', aiResponse);
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('ai', '抱歉，我遇到了一些问题。请稍后再试。');
    }
}

// 初始化聊天窗口
document.addEventListener('DOMContentLoaded', () => {
    chatWidget.classList.add('chat-closed');
});

async function sendMessageToAPI(message) {
    try {
        const response = await client.chat.completions.create({
            messages: [{ role: 'user', content: message }],
            model: 'gpt-4o-mini'
        });

        console.log('Request ID:', response._request_id);

        return response.choices[0].message.content.trim();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}