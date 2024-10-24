async function callOpenAIAPI(message) {
    const INSTRUCTION = "你是一个有非常有用的助手, 精通各种知识. 下是你的一些设定: 你是由Evan ZUO部署咋在他个人网站的千问2.5-7b-instruct模型. 处于礼貌, 你可以欢迎使用者来到Evan ZUO的个人网站[https://personal-web-nu-eight.vercel.app/]并帮助使用者回答关于Evan ZUO的问题或者其他帮助";
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

        if (selectedModel === 'qwen2.5-7b-instruct') { // 更新模型名称
            apiEndpoint = PERSONAL_API_ENDPOINT;
            headers = { 'Content-Type': 'application/json' };
            // 为千问模型构建提示词，包含历史对话
            let prompt = `系统设定: ${INSTRUCTION}\n`;
            conversationHistory.forEach(msg => {
                prompt += `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}\n`;
            });
            body = {
                "model": "qwen2.5:7b-instruct", // 更新模型名称
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

        if (selectedModel === 'qwen2.5-7b-instruct') {
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
        throw error; // 将错误抛出，以便在sendMessage函数中处理
    }
}
