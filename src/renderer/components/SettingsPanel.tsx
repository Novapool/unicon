import { useState } from 'react';
import { useConversionStore } from '../store/conversionStore';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { defaultOutputFormat, setDefaultOutputFormat } = useConversionStore();
  const [localFormat, setLocalFormat] = useState(defaultOutputFormat);

  if (!isOpen) return null;

  const handleSave = () => {
    setDefaultOutputFormat(localFormat);
    onClose();
  };

  const handleCancel = () => {
    setLocalFormat(defaultOutputFormat);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            {/* General Settings */}
            <section>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                General Settings
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Output Format
                  </label>
                  <input
                    type="text"
                    value={localFormat}
                    onChange={(e) => setLocalFormat(e.target.value)}
                    placeholder="e.g., mp4, mp3, jpg"
                    className="input w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This format will be pre-selected when converting files
                  </p>
                </div>
              </div>
            </section>

            {/* About Section */}
            <section className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">About</h3>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-700">App Name:</span>
                  <span>Unicon</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-700">Version:</span>
                  <span>1.0.0-alpha</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-gray-700">Description:</span>
                  <span>Universal File Converter</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="font-medium text-gray-700">Supported:</span>
                  <div className="flex-1">
                    <p>Video, Audio, Images, Documents</p>
                    <p className="text-xs text-gray-500 mt-1">
                      MP4, AVI, MKV, MP3, WAV, JPG, PNG, PDF, DOCX, XLSX, and more
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Advanced Settings (placeholder) */}
            <section className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Advanced Settings
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Advanced settings like quality presets, bitrate options, and conversion
                    parameters will be available in a future update.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button onClick={handleCancel} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleSave} className="btn-primary">
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
