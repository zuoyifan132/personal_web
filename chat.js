// OpenAI API configuration
let OPENAI_API_KEY = ''; // 初始化为空
const API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
const PERSONAL_API_ENDPOINT = 'https://28d5-2409-891f-9247-6bda-6146-a222-5b73-162c.ngrok-free.app/api/generate';

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

// 在文件顶部添加
const modelSelect = document.getElementById('model-select');

// 添加模型选择变更事件监听器
modelSelect.addEventListener('change', () => {
    const selectedModel = modelSelect.value;
    if (selectedModel === 'qwen2.5-3b-instruct') {
        apiKeyInput.style.display = 'none';
        apiKeyInput.value = ''; // 清空 API 密钥
        OPENAI_API_KEY = ''; // 重置 API 密钥
    } else {
        apiKeyInput.style.display = 'block';
    }
});

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

// 在文件顶部添加一个变量来存储对话历史
let conversationHistory = [];

// 修改 sendMessage 函数
function sendMessage() {
    const message = userInput.value.trim();
    if (message) {
        const selectedModel = modelSelect.value;
        if (selectedModel !== 'qwen2.5-3b-instruct') {
            OPENAI_API_KEY = apiKeyInput.value.trim();
            if (!OPENAI_API_KEY) {
                alert('请先输入API密钥');
                return;
            }
        }
        addMessageToChat('user', message);
        // 将用户消息添加到对话历史
        conversationHistory.push({ role: "user", content: message });
        userInput.value = '';
        callOpenAIAPI(message);
    }
}

function addMessageToChat(sender, message) {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container', `${sender}-message-container`);

    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar', `${sender}-avatar`);
    avatar.textContent = sender === 'user' ? 'U' : 'AI';

    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = message;

    if (sender === 'user') {
        messageContainer.appendChild(messageElement);
        messageContainer.appendChild(avatar);
    } else {
        messageContainer.appendChild(avatar);
        messageContainer.appendChild(messageElement);
    }

    chatMessages.appendChild(messageContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function callOpenAIAPI(message) {
    const INSTRUCTION = "你是一个有非常有用的助手, 精通各种知识. 下是你的一些设定: 你是由Evan ZUO部署咋在他个人网站的千问2.5-3b-instruct模型. 处于礼貌, 你可以欢迎使用者来到Evan ZUO的个人网站[https://personal-web-nu-eight.vercel.app/]并帮助使用者回答关于Evan ZUO的问题或者其他帮助";
    try {
        const selectedModel = modelSelect.value;
        let apiEndpoint = API_ENDPOINT;
        let headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        };
        let body = {
            model: selectedModel,
            messages: [
                { role: "system", content: INSTRUCTION },
                ...conversationHistory // 添加整个对话历史
            ],
            temperature: 0.7
        };

        if (selectedModel === 'qwen2.5-3b-instruct') {
            apiEndpoint = PERSONAL_API_ENDPOINT;
            headers = { 'Content-Type': 'application/json' };
            // 为千问模型构建提示词，包含历史对话
            let prompt = `系统设定: ${INSTRUCTION}\n`;
            conversationHistory.forEach(msg => {
                prompt += `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}\n`;
            });
            body = {
                "model": "qwen2.5:3b-instruct",
                "prompt": prompt,
                "stream": true
            };
        }

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        let aiResponse = '';

        if (selectedModel === 'qwen2.5-3b-instruct') {
            // 处理流式响应
            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split('\n');

                for (let line of lines) {
                    if (line.trim()) {
                        try {
                            const responseData = JSON.parse(line);
                            aiResponse += responseData['response'];
                        } catch (e) {
                            console.error('Error parsing JSON:', e);
                            continue;
                        }
                    }
                }
            }
        } else {
            // 非流式处理
            const data = await response.json();
            console.log('API Response:', data);
            aiResponse = data.choices[0].message.content.trim();
        }

        // 将AI响应添加到对话历史
        conversationHistory.push({ role: "assistant", content: aiResponse });

        // 最终更新聊天窗口
        addMessageToChat('ai', aiResponse);
    } catch (error) {
        console.error('Error:', error);
        addMessageToChat('ai', '抱歉，出现了错误。请稍后再试。');
    }
}

// 初始化时检查当前选择的模型
document.addEventListener('DOMContentLoaded', () => {
    const selectedModel = modelSelect.value;
    if (selectedModel === 'qwen2.5-3b-instruct') {
        apiKeyInput.style.display = 'none';
    }
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

// 添加一个清除对话历史的函数
function clearConversation() {
    conversationHistory = [];
    chatMessages.innerHTML = '';
    addMessageToChat('ai', '对话已重置。有什么我可以帮您的吗？');
}

// 在 chat-header 中添加一个重置按钮
document.addEventListener('DOMContentLoaded', () => {
    const chatHeader = document.querySelector('.chat-header');
    const resetButton = document.createElement('button');
    resetButton.textContent = '重置对话';
    resetButton.classList.add('reset-chat');
    resetButton.addEventListener('click', clearConversation);
    chatHeader.appendChild(resetButton);
});
