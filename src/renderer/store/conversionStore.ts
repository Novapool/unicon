/**
 * Zustand store for managing conversion state
 */

import { create } from 'zustand';
import type {
  FileTypeInfo,
  FormatsData,
  ConversionJob,
  ProgressUpdate,
} from '../../types/ipc';

interface ConversionFile {
  id: string;
  path: string;
  name: string;
  type: string;
  size: number;
  outputPath?: string;
  outputFormat?: string;
  jobId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  message?: string;
  error?: string;
}

interface ConversionState {
  // Available formats from server
  formats: FormatsData | null;
  formatsLoading: boolean;

  // Files to convert
  files: ConversionFile[];
  currentFileId: string | null;

  // Batch conversion
  isBatchMode: boolean;
  inputFolder: string | null;
  outputFolder: string | null;
  batchJobId: string | null;

  // Settings
  defaultOutputFormat: string;

  // Actions
  setFormats: (formats: FormatsData) => void;
  setFormatsLoading: (loading: boolean) => void;

  addFile: (file: Omit<ConversionFile, 'id' | 'status' | 'progress'>) => void;
  removeFile: (fileId: string) => void;
  clearFiles: () => void;

  updateFile: (fileId: string, updates: Partial<ConversionFile>) => void;
  updateFileProgress: (fileId: string, progress: ProgressUpdate) => void;

  setCurrentFileId: (fileId: string | null) => void;
  setCurrentFile: (fileId: string | null) => void;

  toggleBatchMode: (enabled: boolean) => void;
  setBatchMode: (enabled: boolean) => void;
  setInputFolder: (folder: string | null) => void;
  setOutputFolder: (folder: string | null) => void;
  setBatchJobId: (jobId: string | null) => void;

  setDefaultOutputFormat: (format: string) => void;

  clearCompletedFiles: () => void;
  clearFailedFiles: () => void;

  // Computed
  getFile: (fileId: string) => ConversionFile | undefined;
  getFilesWithStatus: (status: ConversionFile['status']) => ConversionFile[];
  getTotalProgress: () => number;
  totalProgress: number;
}

export const useConversionStore = create<ConversionState>((set, get) => ({
  // Initial state
  formats: null,
  formatsLoading: false,
  files: [],
  currentFileId: null,
  isBatchMode: false,
  inputFolder: null,
  outputFolder: null,
  batchJobId: null,
  defaultOutputFormat: 'mp4',

  // Format actions
  setFormats: (formats) => set({ formats }),
  setFormatsLoading: (loading) => set({ formatsLoading: loading }),

  // File actions
  addFile: (file) => {
    const id = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newFile: ConversionFile = {
      ...file,
      id,
      status: 'pending',
      progress: 0,
    };
    set((state) => ({ files: [...state.files, newFile] }));
  },

  removeFile: (fileId) => {
    set((state) => ({
      files: state.files.filter((f) => f.id !== fileId),
      currentFileId:
        state.currentFileId === fileId ? null : state.currentFileId,
    }));
  },

  clearFiles: () => set({ files: [], currentFileId: null }),

  updateFile: (fileId, updates) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === fileId ? { ...f, ...updates } : f,
      ),
    }));
  },

  updateFileProgress: (fileId, progressUpdate) => {
    set((state) => ({
      files: state.files.map((f) =>
        f.id === fileId
          ? {
              ...f,
              status: (progressUpdate.status ||
                f.status) as ConversionFile['status'],
              progress:
                progressUpdate.progress !== undefined
                  ? progressUpdate.progress
                  : f.progress,
              message: progressUpdate.message || f.message,
              error: progressUpdate.error || f.error,
            }
          : f,
      ),
    }));
  },

  setCurrentFileId: (fileId) => set({ currentFileId: fileId }),
  setCurrentFile: (fileId) => set({ currentFileId: fileId }),

  // Batch actions
  toggleBatchMode: (enabled) => set({ isBatchMode: enabled }),
  setBatchMode: (enabled) => set({ isBatchMode: enabled }),
  setInputFolder: (folder) => set({ inputFolder: folder }),
  setOutputFolder: (folder) => set({ outputFolder: folder }),
  setBatchJobId: (jobId) => set({ batchJobId: jobId }),

  // Settings actions
  setDefaultOutputFormat: (format) => set({ defaultOutputFormat: format }),

  // Clear completed/failed files
  clearCompletedFiles: () => {
    set((state) => ({
      files: state.files.filter((f) => f.status !== 'completed'),
    }));
  },

  clearFailedFiles: () => {
    set((state) => ({
      files: state.files.filter((f) => f.status !== 'failed'),
    }));
  },

  // Computed getters
  getFile: (fileId) => {
    return get().files.find((f) => f.id === fileId);
  },

  getFilesWithStatus: (status) => {
    return get().files.filter((f) => f.status === status);
  },

  getTotalProgress: () => {
    const { files } = get();
    if (files.length === 0) return 0;
    const total = files.reduce((sum, file) => sum + file.progress, 0);
    return total / files.length;
  },

  get totalProgress() {
    const { files } = get();
    if (files.length === 0) return 0;
    const total = files.reduce((sum, file) => sum + file.progress, 0);
    return total / files.length;
  },
}));
