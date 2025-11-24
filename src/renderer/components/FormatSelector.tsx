import { useEffect, useMemo } from 'react';
import { useConversionStore } from '../store/conversionStore';

export default function FormatSelector() {
  const { formats, files, defaultOutputFormat, setDefaultOutputFormat, setFormats } = useConversionStore();

  useEffect(() => {
    const fetchFormats = async () => {
      try {
        const result = await window.electron.getFormats();
        if (result.success && result.formats) {
          setFormats(result.formats);
        }
      } catch (error) {
        console.error('Error fetching formats:', error);
      }
    };

    fetchFormats();
  }, [setFormats]);

  // Get the file type of the first file (for filtering compatible formats)
  const firstFileType = useMemo(() => {
    if (files.length === 0) return null;
    return files[0].type;
  }, [files]);

  // Get available formats based on the first file's type
  const availableFormats = useMemo(() => {
    if (!formats || !firstFileType) return [];

    // Determine the category based on file type
    let category: keyof typeof formats | null = null;
    if (firstFileType.startsWith('video/')) {
      category = 'video';
    } else if (firstFileType.startsWith('audio/')) {
      category = 'audio';
    } else if (firstFileType.startsWith('image/')) {
      category = 'image';
    } else if (
      firstFileType.includes('pdf') ||
      firstFileType.includes('document') ||
      firstFileType.includes('spreadsheet') ||
      firstFileType.includes('presentation')
    ) {
      category = 'document';
    }

    if (!category) return [];

    return formats[category] || [];
  }, [formats, firstFileType]);

  // Group all formats by category for display
  const formatGroups = useMemo(() => {
    if (!formats) return [];

    return [
      { name: 'Video', formats: formats.video || [], icon: '🎥' },
      { name: 'Audio', formats: formats.audio || [], icon: '🎵' },
      { name: 'Image', formats: formats.image || [], icon: '🖼️' },
      { name: 'Document', formats: formats.document || [], icon: '📄' },
    ].filter((group) => group.formats.length > 0);
  }, [formats]);

  const handleFormatChange = (format: string) => {
    setDefaultOutputFormat(format);
  };

  if (!formats) {
    return (
      <div className="card">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Output Format</h2>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select format to convert to:
        </label>

        <select
          value={defaultOutputFormat}
          onChange={(e) => handleFormatChange(e.target.value)}
          className="input w-full text-base"
          disabled={files.length === 0}
        >
          <option value="">-- Select Format --</option>

          {files.length > 0 && availableFormats.length > 0 && (
            <optgroup label="📌 Compatible Formats">
              {availableFormats.map((format) => (
                <option key={format} value={format}>
                  {format.toUpperCase()}
                </option>
              ))}
            </optgroup>
          )}

          {formatGroups.map((group) => (
            <optgroup key={group.name} label={`${group.icon} ${group.name}`}>
              {group.formats.map((format) => (
                <option
                  key={format}
                  value={format}
                  disabled={
                    files.length > 0 && !availableFormats.includes(format)
                  }
                >
                  {format.toUpperCase()}
                  {files.length > 0 && !availableFormats.includes(format)
                    ? ' (incompatible)'
                    : ''}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {files.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            Please select files first to see compatible formats
          </p>
        )}

        {files.length > 0 && defaultOutputFormat && (
          <div className="mt-3 p-3 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-700">
              <span className="font-semibold">Selected:</span> {defaultOutputFormat.toUpperCase()}
            </p>
            {availableFormats.includes(defaultOutputFormat) && (
              <p className="text-xs text-primary-600 mt-1">
                ✓ Compatible with your selected file(s)
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
