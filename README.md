# Unicon - Universal File Converter

A powerful desktop application for converting media files (video, audio, images) and documents (PDF, Word, Excel, PowerPoint) with a modern, user-friendly interface.

## Architecture

Unicon uses a hybrid Electron + Python architecture:

- **Frontend**: React + TypeScript + TailwindCSS + Zustand
- **Desktop Framework**: Electron
- **Backend**: Python Flask server with FFmpeg
- **Conversion Engine**: FFmpeg (media) + document libraries (PyPDF2, python-docx, etc.)

```
┌─────────────────────────────────────────────────────┐
│                 Electron Main Process                │
│  - Window Management                                 │
│  - Launches Python Server on startup                 │
│  - IPC Handler (forwards to Python HTTP API)         │
└───────────────────┬─────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐      ┌─────────────────────┐
│   Renderer   │      │   Python Server     │
│   (React)    │◄────►│   (Flask)           │
│              │ HTTP │                     │
│ - Drag/Drop  │      │ - /convert          │
│ - Progress   │◄────►│ - /batch_convert    │
│ - History    │ SSE  │ - /formats          │
│ - Settings   │      │ - /progress (SSE)   │
└──────────────┘      └─────┬───────────────┘
                            │
                    ┌───────┼───────┐
                    ▼               ▼
            ┌────────────┐   ┌──────────────┐
            │   FFmpeg   │   │  Conversion  │
            │  (bundled) │   │  Libraries   │
            │            │   │ - PyPDF2     │
            └────────────┘   │ - python-docx│
                             │ - openpyxl   │
                             └──────────────┘
```

## Features

### Media Conversion
- **Video**: MP4, AVI, MKV, MOV, WebM
- **Audio**: MP3, WAV, OGG, FLAC, M4A
- **Images**: JPG, PNG, GIF, BMP, WebP
- Special conversions:
  - Audio → PNG (waveform visualization)
  - Video → PNG (first frame extraction)

### Document Conversion
- **PDF** → DOCX, TXT
- **Word (DOCX)** → PDF, TXT
- **Excel (XLSX)** → CSV, PDF
- **PowerPoint (PPTX)** → PDF
- **Text** → PDF, DOCX

### UI Features
- Modern, intuitive interface with TailwindCSS
- Drag-and-drop file upload
- Real-time progress tracking with Server-Sent Events
- Batch folder conversion
- Output path selection
- Conversion history
- Settings panel

## Prerequisites

Before you begin, ensure you have the following installed:

### Required
- **Node.js** 14.x or higher ([Download](https://nodejs.org/))
- **Python** 3.6+ ([Download](https://www.python.org/downloads/))
- **FFmpeg** ([Download](https://ffmpeg.org/download.html))
  - Windows: Download from [gyan.dev](https://www.gyan.dev/ffmpeg/builds/) or use `winget install FFmpeg`
  - macOS: `brew install ffmpeg`
  - Linux: `sudo apt-get install ffmpeg` or `sudo yum install ffmpeg`

### Optional (for document conversion)
- **LibreOffice** (for DOCX/XLSX/PPTX → PDF conversion)
  - Download from [libreoffice.org](https://www.libreoffice.org/)

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Novapool/unicon.git
cd unicon
```

### 2. Install Node.js Dependencies

```bash
npm install
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

Or create a virtual environment (recommended):

```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Run Development Mode

Start the Electron app (this will also start the Python server):

```bash
npm start
```

The application will:
1. Start the Python Flask server on `http://localhost:5000`
2. Launch the Electron window with hot-reload enabled
3. Connect the frontend to the backend via HTTP/SSE

## Building for Production

### 1. Build the Python Server

First, bundle the Python server with PyInstaller:

```bash
cd conversion_functions

# Windows:
build_server.bat

# macOS/Linux:
chmod +x build_server.sh
./build_server.sh
```

This creates `conversion_functions/dist/unicon-server/` with the bundled Python executable.

### 2. Download FFmpeg Static Binaries

You need to include FFmpeg binaries for all platforms you're building for:

```bash
# Create ffmpeg directory in project root
mkdir -p ffmpeg

# Download static FFmpeg builds:
# Windows: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
# macOS: https://evermeet.cx/ffmpeg/
# Linux: https://johnvansickle.com/ffmpeg/
```

Extract the `ffmpeg` executable (and `ffmpeg.exe` for Windows) into the `ffmpeg/` folder.

### 3. Build the Electron App

```bash
npm run package
```

This will:
- Build the TypeScript main and renderer processes
- Bundle the Python server from `conversion_functions/dist/`
- Include FFmpeg binaries from `ffmpeg/`
- Create platform-specific installers in `release/build/`

### Platform-Specific Builds

```bash
# Build for current platform
npm run package

# Build for specific platform (requires platform-specific tools)
npm run package -- --mac
npm run package -- --win
npm run package -- --linux
```

## Project Structure

```
unicon/
├── src/
│   ├── main/                 # Electron main process
│   │   ├── main.ts           # Main process entry, Flask server launcher
│   │   ├── preload.ts        # IPC bridge with typed API
│   │   └── menu.ts           # Application menu
│   ├── renderer/             # React frontend
│   │   ├── App.tsx           # Main app component
│   │   ├── store/            # Zustand state management
│   │   │   └── conversionStore.ts
│   │   └── styles/           # Global styles with Tailwind
│   │       └── global.css
│   └── types/                # TypeScript type definitions
│       └── ipc.ts            # IPC interface types
│
├── conversion_functions/     # Python backend
│   ├── server.py             # Flask API server
│   ├── media_conversion.py   # FFmpeg-based media conversion
│   ├── document_conversion.py # Document conversion logic
│   ├── server.spec           # PyInstaller configuration
│   ├── build_server.sh       # Build script (macOS/Linux)
│   └── build_server.bat      # Build script (Windows)
│
├── tests/                    # Python tests
│   └── test_conversion_functions.py
│
├── requirements.txt          # Python dependencies
├── package.json              # Node.js dependencies & scripts
├── tailwind.config.js        # TailwindCSS configuration
├── postcss.config.js         # PostCSS configuration
└── README.md                 # This file
```

## Configuration

### Environment Variables

- `FFMPEG_PATH`: Path to FFmpeg binary (auto-detected if in PATH)
- `UNICON_PORT`: Port for Python Flask server (default: 5000)

### Electron Builder Configuration

See `package.json` → `build` section for electron-builder settings.

Key configuration:
- `extraResources`: Bundles Python server and FFmpeg binaries
- Platform-specific settings for macOS, Windows, Linux

## Testing

### Frontend Tests

```bash
npm test
```

### Python Backend Tests

```bash
# Requires FFmpeg installed
pytest

# Run specific test file
pytest tests/test_conversion_functions.py

# Run with verbose output
pytest -v
```

## Troubleshooting

### Python Server Not Starting

**Issue**: Application shows "Server Error" dialog on startup.

**Solutions**:
1. Check Python is installed: `python --version` or `python3 --version`
2. Verify dependencies: `pip install -r requirements.txt`
3. Check logs in Electron console (Ctrl+Shift+I)

### FFmpeg Not Found

**Issue**: Conversions fail with "FFmpeg not found" error.

**Solutions**:
1. Install FFmpeg: See [Prerequisites](#prerequisites)
2. Verify installation: `ffmpeg -version`
3. If bundled FFmpeg not working, set `FFMPEG_PATH` environment variable

### Document Conversion Failures

**Issue**: DOCX/XLSX/PPTX → PDF conversion fails.

**Solutions**:
- Install LibreOffice (required for Office → PDF)
- Some document conversions require `docx2pdf` library which depends on Microsoft Word (Windows) or LibreOffice (Linux/Mac)

### Build Errors

**Issue**: `npm run package` fails.

**Solutions**:
1. Ensure Python server is built first: `cd conversion_functions && ./build_server.sh`
2. Ensure FFmpeg binaries are in `ffmpeg/` folder
3. Check `conversion_functions/dist/unicon-server/` exists with compiled Python server
4. Run `npm run build` first to check for TypeScript errors

## Development Tips

### Hot Reload

The development environment supports hot reload for both frontend and backend:
- Frontend: Webpack Dev Server with React Fast Refresh
- Backend: Restart the Python server manually or use `electronmon`

### Debugging

**Frontend**:
- Open DevTools: Ctrl+Shift+I (Windows/Linux) or Cmd+Option+I (Mac)
- React DevTools extension is automatically installed in development

**Backend**:
- Python logs are visible in Electron main process console
- Add `logging.info()` statements in Python code
- Check Flask server logs: `conversion_functions/server.log`

**Main Process**:
- Use `console.log()` or `electron-log` for logging
- Logs visible in terminal where you ran `npm start`

### Adding New Conversion Formats

1. **Media formats**: Add to `get_possible_formats()` in `media_conversion.py`
2. **Document formats**: Add converter function in `document_conversion.py` and update `conversion_map`
3. **Update types**: Add format to TypeScript interfaces in `src/types/ipc.ts`

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and test thoroughly
4. Run linting: `npm run lint:fix`
5. Run tests: `npm test` and `pytest`
6. Commit with descriptive messages
7. Push and create a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Credits

- Built with [Electron React Boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate)
- FFmpeg for media conversion
- Flask for Python backend
- TailwindCSS for UI styling

## Support

- **Issues**: [GitHub Issues](https://github.com/Novapool/unicon/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Novapool/unicon/discussions)
- **Email**: laitho4325@gmail.com

---

**Made with ❤️ by Laith Assaf**
