// OpenAI API configuration
let OPENAI_API_KEY = ''; // 初始化为空
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const PERSONAL_API_ENDPOINT = 'https://00a3-202-101-22-90.ngrok-free.app/api/generate';

// 获取DOM元素
const chatWidget = document.getElementById('chat-widget');
const chatIcon = chatWidget.querySelector('.chat-icon');
const chatWindow = chatWidget.querySelector('.chat-window');
const chatMessages = chatWidget.querySelector('.chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = chatWidget.querySelector('.send-message');
const closeButton = chatWidget.querySelector('.close-chat');

// 添加API密钥输入框
const apiKeyInput = document.createElement('input');
apiKeyInput.type = 'text';
apiKeyInput.placeholder = '请输入您的API密钥';
apiKeyInput.classList.add('api-key-input');
chatWindow.insertBefore(apiKeyInput, chatMessages);

// 打开/关闭聊天窗口
chatIcon.addEventListener('click', () => {
    chatWidget.classList.toggle('chat-open');
    if (chatWidget.classList.contains('chat-open')) {
        chatWindow.style.display = 'flex'; // 确保窗口显示
        const selectedModel = modelSelect.value;
        if (selectedModel !== 'qwen2.5-3b-instruct' && !OPENAI_API_KEY) {
            apiKeyInput.focus(); // 当聊天窗口打开时，聚焦API密钥输入框
        } else {
            userInput.focus();
        }
    } else {
        chatWindow.style.display = 'none'; // 确保窗口隐藏
    }
});

closeButton.addEventListener('click', () => {
    chatWidget.classList.remove('chat-open');
    chatWindow.style.display = 'none'; // 确保窗口隐藏
});

// 发送消息
sendButton.addEventListener('click', () => {
    const selectedModel = modelSelect.value;
    if (selectedModel !== 'qwen2.5-3b-instruct' && !OPENAI_API_KEY) {
        OPENAI_API_KEY = apiKeyInput.value.trim();
        if (!OPENAI_API_KEY) {
            alert('请先输入API密钥');
            return;
        }
    }
    sendMessage();
});

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const selectedModel = modelSelect.value;
        if (selectedModel !== 'qwen2.5-3b-instruct' && !OPENAI_API_KEY) {
            OPENAI_API_KEY = apiKeyInput.value.trim();
            if (!OPENAI_API_KEY) {
                alert('请先输入API密钥');
                return;
            }
        }
        sendMessage();
    }
});

function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        const selectedModel = modelSelect.value;
        if (selectedModel !== 'qwen2.5-3b-instruct' && !OPENAI_API_KEY) {
            OPENAI_API_KEY = apiKeyInput.value.trim();
            if (!OPENAI_API_KEY) {
                alert('请先输入API密钥');
                return;
            }
        }
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

// 在文件顶部添加
const modelSelect = document.getElementById('model-select');

// 修改 callOpenAIAPI 函数
async function callOpenAIAPI(message) {
    try {
        const selectedModel = modelSelect.value;
        let apiEndpoint = API_ENDPOINT;
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        };
        let body = {
            model: selectedModel,
            messages: [{ role: "user", content: message }],
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

        const data = await response.json();
        console.log('API Response:', data);

        if (!response.ok) {
            throw new Error('API request failed');
        }

        let aiResponse;
        if (selectedModel === 'qwen2.5-3b-instruct') {
            aiResponse = data.response.trim();
        } else {
            aiResponse = data.choices[0].message.content.trim();
        }
        addMessageToChat('ai', aiResponse);
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('ai', '抱歉,出现了错误。请稍后再试。');
    }
}

// 初始化聊天窗口
document.addEventListener('DOMContentLoaded', () => {
    chatWidget.classList.add('chat-closed');
    chatWindow.style.display = 'none'; // 确保窗口初始状态为隐藏
    // 移除以下两行以避免覆盖CSS中的位置设置
    // chatWidget.style.left = 'calc(100% - 420px)';
    // chatWidget.style.top = 'calc(100% - 520px)';
    makeDraggable(chatWidget); // 使聊天窗口可拖拽
});

// 使元素可拖拽的函数
function makeDraggable(element) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    element.addEventListener('mousedown', (e) => {
        if (e.target !== chatIcon) return; // 仅在点击图标时开始拖拽
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

        // 确保对话框不会被拖出屏幕
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
