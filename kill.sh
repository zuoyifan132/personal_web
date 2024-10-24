#!/bin/bash
set +ex

# 查找并杀掉ngrok的进程
NGROK_PID=$(ps aux | grep '[n]grok http' | awk '{print $2}')
if [ -n "$NGROK_PID" ]; then
  echo "Killing ngrok process with PID: $NGROK_PID"
  kill -9 $NGROK_PID
else
  echo "ngrok process not found."
fi

# 查找并杀掉ollama服务的进程
OLLAMA_PID=$(ps aux | grep '[o]llama serve' | awk '{print $2}')
if [ -n "$OLLAMA_PID" ]; then
  echo "Killing ollama process with PID: $OLLAMA_PID"
  kill -9 $OLLAMA_PID
else
  echo "ollama serve process not found."
fi

echo "All relevant processes have been terminated."
