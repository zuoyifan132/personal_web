// 照片轮播
const carouselImages = document.querySelectorAll('.carousel-image');
const carouselDots = document.querySelector('.carousel-dots');
let currentImageIndex = 0;

// 创建轮播点
carouselImages.forEach((_, index) => {
    const dot = document.createElement('div');
    dot.classList.add('carousel-dot');
    if (index === 0) dot.classList.add('active');
    dot.addEventListener('click', () => setActiveImage(index));
    carouselDots.appendChild(dot);
});

function setActiveImage(index) {
    carouselImages[currentImageIndex].classList.remove('active');
    carouselDots.children[currentImageIndex].classList.remove('active');
    currentImageIndex = index;
    carouselImages[currentImageIndex].classList.add('active');
    carouselDots.children[currentImageIndex].classList.add('active');
}

function nextImage() {
    setActiveImage((currentImageIndex + 1) % carouselImages.length);
}

setInterval(nextImage, 5000); // 每5秒切换一次图片

// 聊天窗口功能
const chatIcon = document.querySelector('.chat-icon');
const chatWindow = document.querySelector('.chat-window');
const closeChat = document.querySelector('.close-chat');
const sendMessage = document.querySelector('.send-message');
const chatInput = document.querySelector('.chat-input input');
const chatMessages = document.querySelector('.chat-messages');

chatIcon.addEventListener('click', () => {
    chatWindow.style.display = 'block';
    chatIcon.style.display = 'none';
});

closeChat.addEventListener('click', () => {
    chatWindow.style.display = 'none';
    chatIcon.style.display = 'flex';
});

sendMessage.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});

async function sendChatMessage() {
    const message = chatInput.value.trim();
    if (message) {
        addMessageToChat('user', message);
        chatInput.value = '';
        
        // 显示加载指示器
        const loadingIndicator = document.createElement('div');
        loadingIndicator.classList.add('message', 'ai', 'loading');
        loadingIndicator.textContent = '正在思考...';
        chatMessages.appendChild(loadingIndicator);
        
        try {
            // 调用 chat.js 中的 API 函数
            const response = await sendMessageToAPI(message);
            
            // 移除加载指示器
            chatMessages.removeChild(loadingIndicator);
            
            // 添加 AI 回复到聊天窗口
            addMessageToChat('ai', response);
        } catch (error) {
            console.error('API 调用出错:', error);
            
            // 移除加载指示器
            chatMessages.removeChild(loadingIndicator);
            
            // 显示错误消息
            addMessageToChat('ai', '错啦,你被耍啦哈哈哈');
        }
    }
}

function addMessageToChat(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}