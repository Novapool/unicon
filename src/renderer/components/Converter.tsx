import React, { useState, useEffect } from 'react';
import { Button, Select, TextField, Typography, Box, MenuItem } from '@mui/material';
import { ElectronHandler } from '../../main/preload';

declare global {
  interface Window {
    electron: ElectronHandler;
  }
}

const Converter: React.FC = () => {
  const [inputPath, setInputPath] = useState('');
  const [outputFolder, setOutputFolder] = useState('');
  const [conversionType, setConversionType] = useState('');
  const [outputFormat, setOutputFormat] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    window.electron.ipcRenderer.on('file-selected', (filepath) => setInputPath(filepath as string));
    window.electron.ipcRenderer.on('folder-selected', (folderpath) => setInputPath(folderpath as string));
    window.electron.ipcRenderer.on('output-selected', (folderpath) => setOutputFolder(folderpath as string));
    window.electron.ipcRenderer.on('conversion-progress', (message) => setStatus(message as string));
    window.electron.ipcRenderer.on('conversion-error', (message) => setStatus(`Error: ${message as string}`));
    window.electron.ipcRenderer.on('conversion-complete', (code) => setStatus(`Conversion complete with code: ${code as number}`));
  }, []);

  const handleSelectFile = () => window.electron.ipcRenderer.sendMessage('select-file');
  const handleSelectFolder = () => window.electron.ipcRenderer.sendMessage('select-folder');
  const handleSelectOutput = () => window.electron.ipcRenderer.sendMessage('select-output');

  const handleConvert = () => {
    window.electron.ipcRenderer.sendMessage('convert', {
      inputPath,
      outputFolder,
      conversionType,
      outputFormat
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Unicon - Universal File Converter</Typography>
      <Button onClick={handleSelectFile} variant="contained" sx={{ mr: 1 }}>Select File</Button>
      <Button onClick={handleSelectFolder} variant="contained" sx={{ mr: 1 }}>Select Folder</Button>
      <Button onClick={handleSelectOutput} variant="contained" sx={{ mr: 1 }}>Select Output Folder</Button>
      <TextField 
        value={inputPath} 
        fullWidth 
        margin="normal" 
        label="Input Path" 
        InputProps={{ readOnly: true }} 
      />
      <TextField 
        value={outputFolder} 
        fullWidth 
        margin="normal" 
        label="Output Folder" 
        InputProps={{ readOnly: true }} 
      />
      <Select
  value={conversionType}
  onChange={(e) => setConversionType(e.target.value as string)}
  fullWidth
  sx={{ mt: 2, mb: 2 }}  // This adds margin top and bottom
>
  <MenuItem value="audio">Audio</MenuItem>
  <MenuItem value="video">Video</MenuItem>
  <MenuItem value="image">Image</MenuItem>
</Select>
      <TextField
        value={outputFormat}
        onChange={(e) => setOutputFormat(e.target.value)}
        fullWidth
        margin="normal"
        label="Output Format"
        placeholder="e.g., mp3, mp4, png"
      />
      <Button onClick={handleConvert} variant="contained" color="primary" sx={{ mt: 2 }}>Convert</Button>
      <Typography variant="body1" sx={{ mt: 2 }}>{status}</Typography>
    </Box>
  );
};

export default Converter;