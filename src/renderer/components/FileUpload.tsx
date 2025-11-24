import { useState, useCallback } from 'react';
import { useConversionStore } from '../store/conversionStore';

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const { addFile, isBatchMode, setInputFolder } = useConversionStore();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);

    for (const file of files) {
      try {
        const fileType = await window.electron.detectFileType(file.path);
        addFile({
          name: file.name,
          path: file.path,
          type: fileType.fileType,
          size: file.size,
        });
      } catch (error) {
        console.error('Error detecting file type:', error);
      }
    }
  }, [addFile]);

  const handleFileSelect = useCallback(async () => {
    try {
      const result = await window.electron.openFileDialog();
      if (!result.canceled && result.filePaths.length > 0) {
        for (const filePath of result.filePaths) {
          try {
            const fileType = await window.electron.detectFileType(filePath);
            const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'Unknown';
            addFile({
              name: fileName,
              path: filePath,
              type: fileType.fileType,
              size: 0, // Size not available from dialog
            });
          } catch (error) {
            console.error('Error detecting file type:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  }, [addFile]);

  const handleFolderSelect = useCallback(async () => {
    try {
      const result = await window.electron.openFolderDialog();
      if (!result.canceled && result.filePaths.length > 0) {
        setInputFolder(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Error selecting folder:', error);
    }
  }, [setInputFolder]);

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {isBatchMode ? 'Select Folder' : 'Upload Files'}
      </h2>

      <div
        className={`
          border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer
          ${isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 bg-gray-50 hover:bg-gray-100'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={isBatchMode ? handleFolderSelect : handleFileSelect}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <svg
            className={`w-16 h-16 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="text-lg font-medium text-gray-700">
            {isBatchMode
              ? 'Click to select a folder'
              : 'Drag & drop files here or click to browse'}
          </p>
          <p className="text-sm text-gray-500">
            {isBatchMode
              ? 'All files in the folder will be converted'
              : 'Supports multiple file selection'}
          </p>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isBatchMode}
            onChange={(e) => useConversionStore.getState().toggleBatchMode(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">Batch Mode (Convert entire folder)</span>
        </label>
      </div>
    </div>
  );
}
