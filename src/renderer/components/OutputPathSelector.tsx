import { useConversionStore } from '../store/conversionStore';

export default function OutputPathSelector() {
  const { outputFolder, setOutputFolder, isBatchMode, files } = useConversionStore();

  const handleBrowse = async () => {
    try {
      if (isBatchMode) {
        // For batch mode, select a folder
        const result = await window.electron.openFolderDialog();
        if (!result.canceled && result.filePaths.length > 0) {
          setOutputFolder(result.filePaths[0]);
        }
      } else {
        // For single file mode, select a save location
        const defaultFileName = files.length > 0 ? files[0].name : 'output';
        const result = await window.electron.saveFileDialog(defaultFileName);
        if (!result.canceled && result.filePath) {
          // Extract just the folder path
          const folderPath = result.filePath.substring(0, result.filePath.lastIndexOf('/'));
          setOutputFolder(folderPath || result.filePath.substring(0, result.filePath.lastIndexOf('\\')));
        }
      }
    } catch (error) {
      console.error('Error selecting output path:', error);
    }
  };

  const truncatePath = (path: string, maxLength: number = 50) => {
    if (path.length <= maxLength) return path;
    const start = path.substring(0, maxLength / 2);
    const end = path.substring(path.length - maxLength / 2);
    return `${start}...${end}`;
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Output Location</h2>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          {isBatchMode ? 'Output Folder:' : 'Save Location:'}
        </label>

        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <div className="input bg-gray-50 text-gray-700 flex items-center pr-10">
              <span className="mr-2 text-gray-400">
                {isBatchMode ? '📁' : '📄'}
              </span>
              <span
                className="flex-1 truncate"
                title={outputFolder || 'No location selected'}
              >
                {outputFolder ? truncatePath(outputFolder) : 'No location selected'}
              </span>
            </div>
            {outputFolder && (
              <button
                onClick={() => setOutputFolder(null)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Clear selection"
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <button
            onClick={handleBrowse}
            className="btn-primary"
          >
            Browse
          </button>
        </div>

        {!outputFolder && (
          <p className="text-sm text-gray-500">
            {isBatchMode
              ? 'Select a folder where all converted files will be saved'
              : 'Choose where to save the converted file'}
          </p>
        )}

        {outputFolder && (
          <div className="p-3 bg-green-50 rounded-lg flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <div className="flex-1">
              <p className="text-sm text-green-700 font-medium">
                Output location set
              </p>
              <p className="text-xs text-green-600 mt-1 break-all">
                {outputFolder}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
