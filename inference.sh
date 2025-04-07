#!/bin/bash
# NOTE: This script should only be run on an Inference Engine.

# Check that ollama is present on system
if command -v ollama; then
    echo "Ollama is available"
else
    echo "Ollama is not installed. Please install ollama first."
    exit 1
fi

# Pull/refresh all the models we use
MODELS="
    deepseek-r1:7b
    deepseek-r1:32b
    deepseek-r1-70b
    gemma3:27b
    qwq:latest
"
for model in $MODELS; do
    ollama pull $model
done

# Make sure ollama server is running
if pgrep ollama >/dev/null; then
    echo "Ollama is running"
else
    ollama serve
fi

# Setup the log file
mkdir -p $HOME/log
INFERENCE_LOG=$HOME/log/inference-$(date +"%Y-%m-%d").log

# Launch the watcher (kill old one, if running)
if [ -z "$(pgrep -fl engine/watch)" ]; then
    echo "Inference Watcher is not running."
else
    echo "Shutting down old Inference Watcher"
    kill $(ps ax | grep engine/watch | grep -v grep | cut -c-6)
fi
echo "Starting Inference Watcher..."
source .venv/bin/activate
nohup engine/watch 2>$INFERENCE_LOG &
