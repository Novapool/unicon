#!/bin/bash
# Build script for bundling Python server with PyInstaller

echo "Building Unicon Python server..."

# Install dependencies
pip install -r ../requirements.txt

# Run PyInstaller
pyinstaller server.spec --clean --noconfirm

echo "Build complete! Server executable is in dist/unicon-server/"
