# Unicon Development TODO List

This document tracks remaining tasks to complete the Unicon universal file converter application.

## ✅ Completed

### Backend Architecture
- [x] Create Flask API server with RESTful endpoints
- [x] Add Server-Sent Events endpoint for real-time progress
- [x] Update Python conversion functions to use bundled FFmpeg
- [x] Add document conversion libraries (PyPDF2, python-docx, openpyxl, python-pptx)
- [x] Create PyInstaller configuration for bundling Python server
- [x] Create build scripts for Windows/Mac/Linux

### Electron Integration
- [x] Update Electron main process to launch Flask server
- [x] Replace subprocess spawn with HTTP client
- [x] Add server lifecycle management (start/stop)
- [x] Fix electron-builder configuration with extraResources
- [x] Add typed IPC interfaces for API calls
- [x] Update preload script with type-safe methods

### Frontend Foundation
- [x] Add axios and zustand to dependencies
- [x] Create Zustand store for state management
- [x] Install and configure TailwindCSS
- [x] Create global CSS with custom components
- [x] Update dependencies (Pillow to 10.3.0, etc.)

### Documentation
- [x] Create comprehensive README with architecture diagram
- [x] Add setup instructions for development
- [x] Add production build guide
- [x] Add troubleshooting section

---

## 🚧 In Progress / TODO

### 1. Frontend UI Components (HIGH PRIORITY)

#### 1.1 Main App Component
**File**: `src/renderer/App.tsx`

**Tasks**:
- [ ] Import and use the Zustand store (`useConversionStore`)
- [ ] Import global CSS styles (`import './styles/global.css'`)
- [ ] Replace current basic UI with new component structure
- [ ] Add layout container with header, main content, and footer
- [ ] Integrate all child components (FileUpload, ConversionQueue, etc.)
- [ ] Add error boundary for graceful error handling

**Reference**:
```typescript
import { useConversionStore } from './store/conversionStore';
import './styles/global.css';

function App() {
  const { files, formats } = useConversionStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your components here */}
    </div>
  );
}
```

#### 1.2 File Upload Component with Drag-and-Drop
**File**: `src/renderer/components/FileUpload.tsx` (CREATE NEW)

**Tasks**:
- [ ] Create drag-and-drop zone component
- [ ] Handle file selection via button click
- [ ] Handle folder selection for batch mode
- [ ] Use `window.electron.openFileDialog()` for file picker
- [ ] Use `window.electron.openFolderDialog()` for folder picker
- [ ] Detect file types using `window.electron.detectFileType()`
- [ ] Add files to Zustand store
- [ ] Show file preview (name, size, type)
- [ ] Visual feedback for drag-over state
- [ ] Support multiple file selection

**Design Requirements**:
- Dashed border with primary color on hover
- Icon indicating upload action
- Text: "Drag & drop files here or click to browse"
- Show selected files below the drop zone
- Remove file button for each selected file

#### 1.3 Format Selection Component
**File**: `src/renderer/components/FormatSelector.tsx` (CREATE NEW)

**Tasks**:
- [ ] Fetch available formats from `window.electron.getFormats()`
- [ ] Store formats in Zustand on mount
- [ ] Create dropdown/select for output format
- [ ] Filter formats based on input file type
- [ ] Show format suggestions (e.g., "Recommended: MP4")
- [ ] Update selected format in store
- [ ] Handle both single and batch mode

**Design Requirements**:
- Clean dropdown with icons for each format type
- Group formats by category (Video, Audio, Image, Document)
- Show format description on hover
- Disabled state for incompatible formats

#### 1.4 Output Path Selection Component
**File**: `src/renderer/components/OutputPathSelector.tsx` (CREATE NEW)

**Tasks**:
- [ ] Input field to display output path
- [ ] "Browse" button using `window.electron.saveFileDialog()`
- [ ] For batch mode, use folder dialog
- [ ] Store output path in Zustand
- [ ] Validate output path exists (for folders)
- [ ] Show default output location
- [ ] Remember last used location in settings

**Design Requirements**:
- Input field with browse button
- Path truncation for long paths with tooltip
- Icon indicating file vs folder

#### 1.5 Conversion Progress Component
**File**: `src/renderer/components/ConversionProgress.tsx` (CREATE NEW)

**Tasks**:
- [ ] Display progress bar for active conversion
- [ ] Connect to SSE endpoint for real-time updates
- [ ] Poll job status using `window.electron.getJobStatus(jobId)`
- [ ] Update progress in Zustand store
- [ ] Show percentage (0-100%)
- [ ] Show current status message
- [ ] Cancel conversion button (future feature)
- [ ] Handle multiple simultaneous conversions

**Design Requirements**:
- Animated progress bar with primary color
- Percentage text overlay
- Status message below bar
- Smooth transitions for progress updates

#### 1.6 Conversion Queue Component
**File**: `src/renderer/components/ConversionQueue.tsx` (CREATE NEW)

**Tasks**:
- [ ] Display list of files to convert
- [ ] Show file info: name, type, status, progress
- [ ] Color-coded status badges (pending, processing, completed, failed)
- [ ] Remove file from queue button
- [ ] Clear all completed button
- [ ] Clear all failed button
- [ ] Show total progress for batch
- [ ] Reorder queue items (drag to reorder - optional)

**Design Requirements**:
- Card-based layout for each file
- Status badge with icon and color
- Mini progress bar for each file
- Hover effects for interactive elements
- Empty state message when no files

#### 1.7 Settings Panel Component
**File**: `src/renderer/components/SettingsPanel.tsx` (CREATE NEW)

**Tasks**:
- [ ] Modal or sidebar panel for settings
- [ ] Default output format selector
- [ ] Default output location selector
- [ ] Quality/bitrate settings (advanced)
- [ ] Theme toggle (light/dark mode - optional)
- [ ] About section with app version
- [ ] Save settings to localStorage or config file
- [ ] Load settings on app start

**Design Requirements**:
- Clean form layout with labels
- Section headers for grouping settings
- Save/Cancel buttons
- Visual feedback on save

#### 1.8 Conversion History Component
**File**: `src/renderer/components/ConversionHistory.tsx` (CREATE NEW)

**Tasks**:
- [ ] Display list of recently converted files
- [ ] Store history in localStorage or SQLite
- [ ] Show conversion details (input → output, timestamp)
- [ ] "Open file location" button
- [ ] "Reconvert" button to repeat conversion
- [ ] Clear history button
- [ ] Search/filter history
- [ ] Limit history to last N items (e.g., 50)

**Design Requirements**:
- Table or list layout
- Timestamp in human-readable format ("2 hours ago")
- Icons for file types
- Hover actions for each entry

### 2. Backend Enhancements (MEDIUM PRIORITY)

#### 2.1 Server Logging
**File**: `conversion_functions/server.py`

**Tasks**:
- [ ] Add file-based logging (not just console)
- [ ] Create `logs/` directory on startup
- [ ] Log all API requests and responses
- [ ] Log errors with stack traces
- [ ] Rotate log files (daily or by size)

#### 2.2 Job Cleanup
**File**: `conversion_functions/server.py`

**Tasks**:
- [ ] Implement job cleanup after completion
- [ ] Remove old jobs from `conversion_jobs` dict (after 1 hour)
- [ ] Close progress queues when job completes
- [ ] Add background cleanup thread

#### 2.3 Configuration File
**File**: `conversion_functions/config.py` (CREATE NEW)

**Tasks**:
- [ ] Create configuration module
- [ ] Load settings from environment variables
- [ ] Default values for all settings
- [ ] Expose settings via `/config` endpoint

**Settings to include**:
- Server port
- FFmpeg path
- Conversion timeout
- Max concurrent conversions
- Output quality presets

#### 2.4 Error Handling Improvements
**Files**: `conversion_functions/media_conversion.py`, `conversion_functions/document_conversion.py`

**Tasks**:
- [ ] Add retry logic for transient failures
- [ ] Better error messages (user-friendly)
- [ ] Validate file paths before conversion
- [ ] Check disk space before starting
- [ ] Handle corrupted input files gracefully

### 3. Development & Testing (MEDIUM PRIORITY)

#### 3.1 Unit Tests for Frontend
**File**: `src/__tests__/ConversionStore.test.tsx` (CREATE NEW)

**Tasks**:
- [ ] Test Zustand store actions
- [ ] Test state updates
- [ ] Test computed getters
- [ ] Mock IPC calls

#### 3.2 Integration Tests
**File**: `tests/test_integration.py` (CREATE NEW)

**Tasks**:
- [ ] Test Flask API endpoints
- [ ] Test file conversion end-to-end
- [ ] Test batch conversion
- [ ] Test error scenarios

#### 3.3 E2E Tests
**File**: `e2e/app.spec.ts` (CREATE NEW) - OPTIONAL

**Tasks**:
- [ ] Set up Playwright or Spectron
- [ ] Test app launch
- [ ] Test file selection
- [ ] Test conversion workflow
- [ ] Test settings persistence

### 4. Production Preparation (HIGH PRIORITY)

#### 4.1 Download FFmpeg Binaries
**Location**: `ffmpeg/` directory in project root

**Tasks**:
- [ ] Create `ffmpeg/` directory
- [ ] Download Windows FFmpeg binary (ffmpeg.exe)
- [ ] Download macOS FFmpeg binary (ffmpeg)
- [ ] Download Linux FFmpeg binary (ffmpeg)
- [ ] Test binaries work on each platform
- [ ] Update `.gitignore` to exclude binaries (optional, they're large)

**Download Links**:
- Windows: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
- macOS: https://evermeet.cx/ffmpeg/
- Linux: https://johnvansickle.com/ffmpeg/

#### 4.2 Build Python Server
**Location**: `conversion_functions/`

**Tasks**:
- [ ] Test Python dependencies: `pip install -r requirements.txt`
- [ ] Run build script: `./build_server.sh` or `build_server.bat`
- [ ] Verify `dist/unicon-server/` directory created
- [ ] Test bundled server runs: `./dist/unicon-server/unicon-server`
- [ ] Check all dependencies bundled correctly

#### 4.3 Test Development Mode
**Tasks**:
- [ ] Install all Node.js dependencies: `npm install`
- [ ] Install all Python dependencies: `pip install -r requirements.txt`
- [ ] Start app in dev mode: `npm start`
- [ ] Verify Python server starts on port 5000
- [ ] Verify Electron window opens
- [ ] Test file conversion in dev mode
- [ ] Check console for errors

#### 4.4 Update Webpack Config for PostCSS/Tailwind
**File**: `.erb/configs/webpack.config.renderer.dev.ts` and `.erb/configs/webpack.config.renderer.prod.ts`

**Tasks**:
- [ ] Add PostCSS loader to CSS processing chain
- [ ] Ensure Tailwind directives are processed
- [ ] Test Tailwind classes render correctly
- [ ] Verify production build minifies CSS

**Reference**:
```typescript
{
  test: /\.css$/,
  use: [
    'style-loader',
    'css-loader',
    'postcss-loader', // Add this
  ],
}
```

#### 4.5 Test Production Build
**Tasks**:
- [ ] Build Python server (see 4.2)
- [ ] Download FFmpeg binaries (see 4.1)
- [ ] Build Electron app: `npm run package`
- [ ] Test packaged app on current platform
- [ ] Verify Python server starts within app
- [ ] Verify FFmpeg conversions work
- [ ] Test document conversions
- [ ] Check app size (should be 150-200MB)

#### 4.6 Code Signing & Notarization (macOS)
**File**: `.erb/scripts/notarize.js`

**Tasks**:
- [ ] Obtain Apple Developer ID certificate
- [ ] Configure code signing in package.json
- [ ] Set up notarization credentials
- [ ] Test signed build on macOS
- [ ] Verify Gatekeeper doesn't block app

**Note**: Only needed for macOS public distribution

#### 4.7 Windows Installer Configuration
**File**: `package.json` → `build.win`

**Tasks**:
- [ ] Configure NSIS installer options
- [ ] Add custom installer images/icons
- [ ] Test installer on Windows
- [ ] Verify app launches after install
- [ ] Test uninstaller

### 5. UI/UX Polish (LOW PRIORITY)

#### 5.1 Animations & Transitions
**Tasks**:
- [ ] Add fade-in animations for components
- [ ] Smooth progress bar animations
- [ ] Drag-and-drop visual feedback
- [ ] Success/error toast notifications
- [ ] Loading spinners for async operations

#### 5.2 Responsive Design
**Tasks**:
- [ ] Test UI at different window sizes
- [ ] Add responsive breakpoints (Tailwind classes)
- [ ] Ensure components stack properly on small windows
- [ ] Mobile-friendly layout (if applicable)

#### 5.3 Keyboard Shortcuts
**Tasks**:
- [ ] Ctrl/Cmd+O for file open dialog
- [ ] Ctrl/Cmd+S for settings
- [ ] Escape to cancel/close dialogs
- [ ] Enter to start conversion
- [ ] Add keyboard shortcut hints to UI

#### 5.4 Dark Mode
**Tasks**:
- [ ] Add dark mode toggle to settings
- [ ] Create dark mode color scheme in Tailwind config
- [ ] Apply dark mode classes throughout app
- [ ] Save theme preference to localStorage
- [ ] Match system theme on first launch

### 6. Advanced Features (OPTIONAL / FUTURE)

#### 6.1 Conversion Presets
**Tasks**:
- [ ] Create preset system (e.g., "Video for Web", "Audio for iTunes")
- [ ] Store presets in config file
- [ ] UI for selecting presets
- [ ] Custom preset creation

#### 6.2 Video Preview
**Tasks**:
- [ ] Show video thumbnail for video files
- [ ] Play video in-app before conversion
- [ ] Show video metadata (resolution, duration, codec)

#### 6.3 Batch Queue Management
**Tasks**:
- [ ] Pause/resume conversions
- [ ] Prioritize items in queue
- [ ] Save queue state on app close
- [ ] Restore queue on app open

#### 6.4 Cloud Storage Integration
**Tasks**:
- [ ] Dropbox integration
- [ ] Google Drive integration
- [ ] Save converted files to cloud
- [ ] OAuth authentication flow

#### 6.5 Command Line Interface
**Tasks**:
- [ ] Create CLI wrapper for Python server
- [ ] Support batch conversion from terminal
- [ ] Arguments for all conversion options
- [ ] Progress output to stdout

#### 6.6 Localization (i18n)
**Tasks**:
- [ ] Set up i18next or similar
- [ ] Extract all UI strings
- [ ] Add language selector to settings
- [ ] Translate to multiple languages

---

## 📋 Current Priorities

### Immediate (This Week)
1. ✅ Update Webpack config to support PostCSS/Tailwind
2. ✅ Create main App component with new layout
3. ✅ Create FileUpload component with drag-and-drop
4. ✅ Create FormatSelector component
5. ✅ Create OutputPathSelector component
6. ✅ Test development mode end-to-end

### Short Term (Next 2 Weeks)
1. Create ConversionProgress component
2. Create ConversionQueue component
3. Create SettingsPanel component
4. Add error handling and user feedback
5. Download and integrate FFmpeg binaries
6. Build and test Python server with PyInstaller
7. Test production build

### Medium Term (Next Month)
1. Add conversion history
2. Improve error messages and validation
3. Add backend logging
4. Write unit tests for critical components
5. Polish UI/UX with animations
6. Add keyboard shortcuts
7. Create installers for all platforms

### Long Term (Future Releases)
1. Dark mode
2. Conversion presets
3. Video preview
4. Cloud storage integration
5. CLI interface
6. Localization

---

## 🐛 Known Issues

### Critical
- [ ] Webpack config needs PostCSS loader for Tailwind
- [ ] No error handling in current App.tsx
- [ ] No UI components exist yet (using old minimal UI)

### Non-Critical
- [ ] Old menu.ts still references "ElectronReact"
- [ ] No cleanup of old conversion jobs in Flask server
- [ ] No retry logic for failed conversions
- [ ] Conversion timeout is hardcoded (30 seconds)

---

## 📝 Notes

### Development Tips
- Use `npm start` for hot-reload during development
- Python server logs appear in Electron main process console
- Open DevTools with Ctrl+Shift+I (Cmd+Option+I on Mac)
- React DevTools automatically loaded in development

### File Naming Conventions
- Components: PascalCase (e.g., `FileUpload.tsx`)
- Utilities: camelCase (e.g., `formatUtils.ts`)
- Styles: kebab-case (e.g., `global.css`)

### Git Workflow
1. Create feature branch: `git checkout -b feature/file-upload`
2. Make changes and test
3. Lint and format: `npm run lint:fix`
4. Commit with descriptive message
5. Push and create PR

### Testing Checklist Before Release
- [ ] All conversions work (media + documents)
- [ ] Progress updates display correctly
- [ ] Batch conversion works
- [ ] Settings persist across app restarts
- [ ] App works on fresh install (no dependencies)
- [ ] Error messages are user-friendly
- [ ] No console errors in production
- [ ] App size is reasonable (<250MB)
- [ ] Installer works on target platforms

---

**Last Updated**: 2025-11-24
**Version**: 1.0.0-alpha
**Maintainer**: Laith Assaf
