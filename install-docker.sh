#!/bin/bash

# Update package list
echo "Updating package list..."
sudo apt-get update

# Install required packages
echo "Installing required packages..."
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common

# Add Docker GPG key
echo "Adding Docker GPG key..."
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "Adding Docker repository..."
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

# Update package index
echo "Updating package index..."
sudo apt-get update

# Install Docker
echo "Installing Docker..."
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Start Docker and enable on boot
echo "Starting Docker and enabling on boot..."
sudo systemctl start docker
sudo systemctl enable docker

# Add user to docker group
echo "Adding your user to the docker group..."
sudo usermod -aG docker $USER

echo "Docker installation completed!"
echo "Please restart your session or log out and back in to apply the Docker group changes."

# --- Other prerequisites ---
# The rendiv-video agent skill (already bundled at .opencode/skill/rendiv-video/)
# must be loaded in your agent environment (pi / Claude Code / Codex) before
# writing or editing rendiv compositions. It provides frame-driven animation
# guidance, package import rules, and the rendiv CLI workflow.
#
# Additionally, the following are required for voiceover generation and timing:
#   pip install uv     # or: pip install edge-tts  (Microsoft neural TTS)
#   sudo apt-get install -y ffmpeg   # for audio muxing and duration probing
#   python3            # already present on most Linux setups
