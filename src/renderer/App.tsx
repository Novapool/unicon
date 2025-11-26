import { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useConversionStore } from './store/conversionStore';
import FileUpload from './components/FileUpload';
import FormatSelector from './components/FormatSelector';
import OutputPathSelector from './components/OutputPathSelector';
import ConversionProgress from './components/ConversionProgress';
import ConversionQueue from './components/ConversionQueue';
import SettingsPanel from './components/SettingsPanel';
import './styles/global.css';

function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    files,
    defaultOutputFormat,
    outputFolder,
    isBatchMode,
    inputFolder,
    setCurrentFileId,
    updateFileProgress,
  } = useConversionStore();

  const canConvert = () => {
    if (isBatchMode) {
      return inputFolder && outputFolder && defaultOutputFormat;
    }
    return files.length > 0 && outputFolder && defaultOutputFormat;
  };

  const handleConvert = async () => {
    if (!canConvert()) {
      setErrorMessage('Please select files, output location, and format');
      return;
    }

    setIsConverting(true);
    setErrorMessage(null);

    try {
      if (isBatchMode && inputFolder && outputFolder) {
        // Batch conversion
        const result = await window.electron.batchConvert(
          inputFolder,
          outputFolder,
          defaultOutputFormat,
        );

        if (result.success && result.jobId) {
          // Set the current job ID for progress tracking
          setCurrentFileId(result.jobId);

          // Mark all files as processing
          files.forEach((file) => {
            updateFileProgress(file.id, {
              progress: 0,
              message: 'Starting conversion...',
            });
          });
        } else {
          setErrorMessage(result.message || 'Batch conversion failed');
        }
      } else {
        // Single file conversions
        for (const file of files) {
          if (file.status !== 'pending') continue;

          // Update file status to processing
          updateFileProgress(file.id, {
            progress: 0,
            message: 'Starting conversion...',
          });

          // Set as current file
          setCurrentFileId(file.id);

          try {
            // Construct output path
            const outputPath = `${outputFolder}/${file.name.split('.')[0]}.${defaultOutputFormat}`;

            const result = await window.electron.convertFile(
              file.path,
              outputPath,
              defaultOutputFormat,
            );

            if (result.success) {
              updateFileProgress(file.id, {
                progress: 100,
                message: 'Conversion complete!',
              });
            } else {
              updateFileProgress(file.id, {
                progress: 0,
                message: result.message || 'Conversion failed',
              });
            }
          } catch (error) {
            const errorMsg =
              error instanceof Error ? error.message : 'Unknown error';
            updateFileProgress(file.id, {
              progress: 0,
              message: `Error: ${errorMsg}`,
            });
          }
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage(`Conversion error: ${errorMsg}`);
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">U</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Unicon</h1>
                <p className="text-xs text-gray-500">
                  Universal File Converter
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <FileUpload />
            <FormatSelector />
            <OutputPathSelector />

            {/* Convert Button */}
            <div className="card">
              <button
                onClick={handleConvert}
                disabled={!canConvert() || isConverting}
                className={`
                  w-full py-4 rounded-lg font-semibold text-lg transition-all
                  ${
                    canConvert() && !isConverting
                      ? 'bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                {isConverting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    <span>Converting...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center space-x-2">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>Start Conversion</span>
                  </span>
                )}
              </button>

              {errorMessage && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{errorMessage}</p>
                </div>
              )}

              {!canConvert() && !errorMessage && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    {!files.length && !inputFolder && '📁 Upload files first'}
                    {(files.length > 0 || inputFolder) &&
                      !defaultOutputFormat &&
                      '🎯 Select output format'}
                    {(files.length > 0 || inputFolder) &&
                      defaultOutputFormat &&
                      !outputFolder &&
                      '📂 Choose output location'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <ConversionProgress />
            <ConversionQueue />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <p>© 2025 Unicon - Universal File Converter</p>
            <p>Supports: Video • Audio • Images • Documents</p>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
