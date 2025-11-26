import { useConversionStore } from '../store/conversionStore';

export default function ConversionQueue() {
  const {
    files,
    removeFile,
    clearCompletedFiles,
    clearFailedFiles,
    totalProgress,
    getFilesWithStatus,
  } = useConversionStore();

  const pendingFiles = getFilesWithStatus('pending');
  const processingFiles = getFilesWithStatus('processing');
  const completedFiles = getFilesWithStatus('completed');
  const failedFiles = getFilesWithStatus('failed');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'failed':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'processing':
        return '⚙️';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      default:
        return '⏳';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '—';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
  };

  if (files.length === 0) {
    return (
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Conversion Queue
        </h2>
        <div className="text-center py-12">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-500 text-lg">No files in queue</p>
          <p className="text-gray-400 text-sm mt-2">
            Upload files to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Conversion Queue ({files.length})
        </h2>
        <div className="flex space-x-2">
          {completedFiles.length > 0 && (
            <button
              onClick={clearCompletedFiles}
              className="btn-secondary text-xs"
            >
              Clear Completed
            </button>
          )}
          {failedFiles.length > 0 && (
            <button onClick={clearFailedFiles} className="btn-danger text-xs">
              Clear Failed
            </button>
          )}
        </div>
      </div>

      {/* Total progress bar for batch operations */}
      {files.length > 1 && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Total Progress
            </span>
            <span className="text-sm font-semibold text-primary-600">
              {Math.round(totalProgress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-full bg-primary-600 rounded-full transition-all duration-300"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>Completed: {completedFiles.length}</span>
            <span>Processing: {processingFiles.length}</span>
            <span>Pending: {pendingFiles.length}</span>
            <span>Failed: {failedFiles.length}</span>
          </div>
        </div>
      )}

      {/* File list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {files.map((file) => (
          <div
            key={file.id}
            className={`
              border rounded-lg p-4 transition-all hover:shadow-md
              ${getStatusColor(file.status)}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xl">{getStatusIcon(file.status)}</span>
                  <h3 className="font-medium truncate">{file.name}</h3>
                </div>

                <div className="flex items-center space-x-4 text-xs text-gray-600">
                  <span className="font-mono">{file.type}</span>
                  <span>{formatFileSize(file.size)}</span>
                  <span className="capitalize">{file.status}</span>
                </div>

                {/* Progress bar for individual file */}
                {file.status === 'processing' && (
                  <div className="mt-3">
                    <div className="w-full bg-white rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${file.progress || 0}%` }}
                      />
                    </div>
                    {file.message && (
                      <p className="text-xs text-gray-600 mt-1">
                        {file.message}
                      </p>
                    )}
                  </div>
                )}

                {file.status === 'failed' && file.message && (
                  <p className="text-xs text-red-600 mt-2">{file.message}</p>
                )}

                {file.status === 'completed' && (
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Conversion complete
                  </p>
                )}
              </div>

              <button
                onClick={() => removeFile(file.id)}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                title="Remove from queue"
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
