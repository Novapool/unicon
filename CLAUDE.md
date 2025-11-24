# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Unicon is a universal file converter desktop application built with Electron, React, TypeScript (frontend) and Python (backend). It converts media files (audio, video, images) using FFmpeg through a Python backend, with a user-friendly Electron desktop interface.

## Development Commands

### Starting the Application
```bash
npm start                    # Start the Electron app in development mode
npm run dev                  # Alternative development mode command
```

### Building
```bash
npm run build                # Build both main and renderer processes
npm run build:main           # Build Electron main process only
npm run build:renderer       # Build React renderer only
npm run package              # Package the application for distribution
```

### Testing
```bash
npm test                     # Run Jest tests for frontend
pytest                       # Run Python backend tests
pytest tests/test_conversion_functions.py  # Run specific Python test file
```

### Linting
```bash
npm run lint                 # Lint TypeScript/JavaScript files
npm run lint:fix             # Auto-fix linting issues
```

## Architecture

### Hybrid Architecture: Electron + Python

The application uses a unique dual-process architecture:

1. **Electron Main Process** (src/main/main.ts): Manages the desktop window, IPC communication, and spawns Python subprocesses for file conversion
2. **React Renderer** (src/renderer/): Provides the UI, communicates with main process via IPC
3. **Python Backend** (conversion_functions/): Handles actual media conversion using FFmpeg

### IPC Communication Flow

Frontend → Electron Preload → Main Process → Python Subprocess → FFmpeg

Key IPC channels:
- `dialog:openFile` - File selection dialog
- `convert-file` - Triggers conversion (passes to Python backend)

### Python Integration

The Electron main process spawns Python scripts using Node's `child_process.spawn`. The Python script path is resolved relative to the built application structure:
```typescript
path.join(__dirname, '..', '..', '..', 'conversion_functions', 'media_conversion.py')
```

This means Python files must be accessible at runtime, not bundled in webpack.

### Media Conversion Backend

Located in `conversion_functions/media_conversion.py`:
- Uses `ffmpeg-python` wrapper for media operations
- Asynchronous processing with asyncio for performance
- Progress tracking via FFmpeg's progress output
- Supports batch conversion with parallel processing

Key functions:
- `convert_file(input_path, output_path, output_format, progress_callback)` - Single file conversion
- `batch_convert(input_folder, output_folder, output_format, progress_callback)` - Batch folder conversion
- `get_file_type(file_path)` - MIME type detection using python-magic
- Special handling: audio → PNG (waveform), video → PNG (first frame)

### File Type Detection

Uses `python-magic` library to detect MIME types rather than relying on file extensions. This ensures proper format detection regardless of file naming.

## Dependencies

### System Requirements
- **FFmpeg** must be installed and available in system PATH (critical for media conversion)
- **Python 3.6+** with packages: ffmpeg-python, Pillow, python-magic, pytest, psutil
- **Node.js 14+**

### Python Dependencies
Install via: `pip install -r requirements.txt`

### Frontend Stack
- Electron 31.3.0
- React 18.2.0 with React Router
- TypeScript
- Webpack (custom ERB config)

## Project Structure

```
src/
├── main/           # Electron main process (IPC, window management)
├── renderer/       # React frontend components
└── __tests__/      # Frontend Jest tests

conversion_functions/  # Python backend for media conversion
tests/                 # Python pytest test suite
.erb/                  # Electron React Boilerplate webpack configs
```

## Testing Notes

- Frontend tests use Jest with jsdom environment
- Backend tests use pytest and require FFmpeg installed
- Backend tests create temporary test files (images, videos, audio) dynamically
- Tests clean up FFmpeg processes on Windows (`kill_ffmpeg_processes()`)

## Important Constraints

- Python backend must remain accessible outside webpack bundle (spawned as subprocess)
- FFmpeg must be in system PATH for both development and production
- Conversion timeout is set to 30 seconds per file (configurable in media_conversion.py:119)
- Progress tracking relies on FFmpeg's `-progress pipe:1` output format
