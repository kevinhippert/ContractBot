#!/bin/bash
set -euo pipefail

# Install uv
export PATH="$PATH:$HOME/.local/bin"
if [ "$(which uv)" == "" ]; then
    echo "Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh;
fi

# Install Python and libraries
echo "Installing Python and library requirements..."
uv sync
source .venv/bin/activate

# Install node/npm and serve
mkdir -p $HOME/bin
export NODE_VER='node-v22.13.0-linux-x64'
export PATH="$HOME/bin/$NODE_VER/bin/:$PATH"
export NODE='https://nodejs.org/dist/v22.13.0/node-v22.13.0-linux-x64.tar.xz'
if [ "$(which npm)" == "" ]; then
    wget -q -O- $NODE | tar xJ -C $HOME/bin
fi
npm --silent install -g serve

# Rotate logs
echo "Rotating log files into $HOME/log/archive"
mkdir -p $HOME/log/archive

# Archive any old logs
gzip $HOME/log/backend-*.log || true
gzip $HOME/log/frontend-*.log || true
mv $HOME/log/*.log.gz $HOME/log/archive || true

# Shut down Node serve if running, or just anything on port 3000
PID=$(lsof -t -i:3000)
echo "Killing process(es) on port 3000 with PID(s) $PID"
if [ ! -z "$PID" ]; then
    kill -9 "$PID"
fi

# Start the Node serve process
echo "Launching the Node server..."
cd $HOME/BossBot/react
npm --silent install --production
npm install vite # TODO: Is this really a sound approach?
npm run build
# Check for npm install errors
if [ $? -ne 0 ]; then
    echo "Error occurred during npm install!"
    exit 1
fi

mkdir -p $HOME/log
FRONTEND_LOG=$HOME/log/frontend-$(date +"%Y-%m-%d-%H-%M-%S").log
serve -s dist -l 3000 > $FRONTEND_LOG 2>&1 & disown >/dev/null 2>&1
