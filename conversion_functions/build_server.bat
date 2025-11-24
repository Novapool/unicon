@echo off
REM Build script for bundling Python server with PyInstaller (Windows)

echo Building Unicon Python server...

REM Install dependencies
pip install -r ../requirements.txt

REM Run PyInstaller
pyinstaller server.spec --clean --noconfirm

echo Build complete! Server executable is in dist\unicon-server\
pause
