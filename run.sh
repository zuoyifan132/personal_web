#!/bin/bash
set +ex

# 启动 ngrok，并将输出重定向到日志文件
nohup ngrok http --url=warm-sadly-warthog.ngrok-free.app 11434 &

# 启动 Ollama 服务
export OLLAMA_ORIGINS="*"
export OLLAMA_HOST="0.0.0.0"
# export OLLAMA_MODELS="/Users/evan/.ollama/models/manifests/registry.ollama.ai/library/qwen2.5/7b-instruct"
export OLLAMA_MAX_QUEUE=3
ollama serve
