import { useEffect, useState } from 'react';
import { useConversionStore } from '../store/conversionStore';

export default function ConversionProgress() {
  const { currentFileId, files, updateFileProgress } = useConversionStore();
  const [isPolling, setIsPolling] = useState(false);

  const currentFile = files.find((f) => f.id === currentFileId);

  useEffect(() => {
    if (!currentFileId || !currentFile) {
      setIsPolling(false);
      return;
    }

    // Only poll if the file is processing
    if (currentFile.status !== 'processing') {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    // Poll job status every 500ms
    const pollInterval = setInterval(async () => {
      try {
        const jobStatus = await window.electron.getJobStatus(currentFileId);

        if (jobStatus.success && jobStatus.job) {
          const { status, progress, message, error } = jobStatus.job;

          // Map backend status to frontend status
          const mappedStatus =
            status === 'completed' ? 'completed' :
            status === 'failed' ? 'failed' :
            'processing';

          // Update progress with proper status
          updateFileProgress(currentFileId, {
            status: mappedStatus,
            progress: progress || 0,
            message: message || '',
            error: error,
          });

          // Stop polling when done
          if (status === 'completed' || status === 'failed') {
            setIsPolling(false);
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Error polling job status:', error);
      }
    }, 500);

    return () => {
      clearInterval(pollInterval);
    };
  }, [currentFileId, currentFile, updateFileProgress]);

  if (!currentFile || currentFile.status !== 'processing') {
    return null;
  }

  const progress = currentFile.progress || 0;

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Conversion Progress
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Converting: {currentFile.name}
            </span>
            <span className="text-sm font-semibold text-primary-600">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-300 ease-out flex items-center justify-end pr-2"
              style={{ width: `${progress}%` }}
            >
              {progress > 10 && (
                <span className="text-xs text-white font-medium">
                  {Math.round(progress)}%
                </span>
              )}
            </div>
          </div>
        </div>

        {currentFile.message && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">{currentFile.message}</p>
          </div>
        )}

        {isPolling && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent" />
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}
