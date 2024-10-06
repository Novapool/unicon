import { useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

const Home = () => {
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<string>('');
  const [conversionStatus, setConversionStatus] = useState<string>('');

  const handleFileSelect = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('dialog:openFile');
      if (!result.canceled && result.filePaths.length > 0) {
        setSelectedPath(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Error selecting file:', error);
    }
  };

  const handleConvert = async () => {
    if (selectedPath && outputFormat) {
      setConversionStatus('Converting...');
      try {
        const result = await window.electron.ipcRenderer.invoke('convert-file', selectedPath, outputFormat);
        if (result.success) {
          setConversionStatus('Conversion successful!');
        } else {
          setConversionStatus(`Conversion failed: ${result.message}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        setConversionStatus(`Error during conversion: ${errorMessage}`);
      }
    } else {
      setConversionStatus('Please select a file and output format');
    }
  };

  return (
    <div>
      <h1>Unicon Media Converter</h1>
      <div>
        <button onClick={handleFileSelect}>Select File or Folder</button>
        {selectedPath && <p>Selected: {selectedPath}</p>}
      </div>
      <div>
        <select value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)}>
          <option value="">Select Output Format</option>
          <option value="mp4">MP4</option>
          <option value="mp3">MP3</option>
          <option value="jpg">JPG</option>
        </select>
      </div>
      <div>
        <button onClick={handleConvert}>Convert</button>
      </div>
      {conversionStatus && <p>{conversionStatus}</p>}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}