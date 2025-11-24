/**
 * TypeScript interfaces for IPC communication between main and renderer processes
 */

// File dialog responses
export interface FileDialogResponse {
  canceled: boolean;
  filePaths: string[];
}

export interface FolderDialogResponse {
  canceled: boolean;
  filePaths: string[];
}

export interface SaveFileDialogResponse {
  canceled: boolean;
  filePath: string | null;
}

// File type detection
export interface FileTypeInfo {
  type: 'media' | 'document' | 'unknown';
  subtype: string;
  formats: string[];
}

export interface FileTypeResponse {
  success: boolean;
  fileType: string;
  data?: FileTypeInfo;
  error?: string;
}

// Format information
export interface MediaFormats {
  video: string[];
  audio: string[];
  image: string[];
}

export interface DocumentFormats {
  [key: string]: string[];
}

export interface FormatsData {
  video: string[];
  audio: string[];
  image: string[];
  document: string[];
}

export interface FormatsResponse {
  success: boolean;
  formats?: FormatsData;
  error?: string;
}

// Conversion job
export interface ConversionJob {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  input_path?: string;
  output_path?: string;
  output_format?: string;
  error?: string;
  success_count?: number;
  total_count?: number;
}

export interface ConversionResponse {
  success: boolean;
  jobId?: string;
  message?: string;
  error?: string;
}

export interface JobStatusResponse {
  success: boolean;
  job?: ConversionJob;
  error?: string;
}

// Progress updates
export interface ProgressUpdate {
  status?: 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  error?: string;
  output_path?: string;
  success_count?: number;
  total_count?: number;
}

/**
 * Electron API exposed to renderer process
 */
export interface ElectronAPI {
  // File dialogs
  openFileDialog: () => Promise<FileDialogResponse>;
  openFolderDialog: () => Promise<FolderDialogResponse>;
  saveFileDialog: (defaultPath?: string) => Promise<SaveFileDialogResponse>;

  // File type detection
  detectFileType: (filePath: string) => Promise<FileTypeResponse>;

  // Format information
  getFormats: () => Promise<FormatsResponse>;

  // Conversion operations
  convertFile: (
    inputPath: string,
    outputPath: string,
    outputFormat: string
  ) => Promise<ConversionResponse>;

  batchConvert: (
    inputFolder: string,
    outputFolder: string,
    outputFormat: string
  ) => Promise<ConversionResponse>;

  // Job status
  getJobStatus: (jobId: string) => Promise<JobStatusResponse>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}
