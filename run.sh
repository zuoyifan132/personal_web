#!/bin/bash
set +ex

# 确保日志文件存在
LOG_FILE="ngrok_output.log"
if [ ! -f "$LOG_FILE" ]; then
  echo "Creating $LOG_FILE..."
  touch "$LOG_FILE"
fi

# 启动 ngrok，并将输出重定向到日志文件
nohup ngrok http --url=warm-sadly-warthog.ngrok-free.app 11434 --log=stdout > "$LOG_FILE" 2>&1 &

# 启动 Ollama 服务
export OLLAMA_ORIGINS="*"
export OLLAMA_HOST="0.0.0.0"
ollama serve
