import React, { useState, useRef } from 'react';
import { Button, Input } from '../components/ui';

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  preview: string;
}

const FileUploader = ({ onFilesAdded, disabled }: { onFilesAdded: (files: FileAttachment[]) => void; disabled?: boolean }) => {
  const [files, setFiles] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles: FileAttachment[] = Array.from(e.target.files).map((file) => ({
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : `${file.type} file (${Math.round(file.size / 1024)}KB)`
    }));

    setFiles(prev => [...prev, ...newFiles]);
    onFilesAdded(newFiles);

    // Clear input for next selection
    e.target.value = '';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎬';
    if (type.startsWith('audio/')) return '🎵';
    if (type === 'application/pdf') return '📄';
    if (type.includes('wordprocessing')) return '📄';
    if (type.includes('spreadsheet')) return '📊';
    return '📁';
  };

  const removeFile = (fileId: string) => {
    setFiles(files.filter(f => f.id !== fileId));
  };

  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        disabled={disabled}
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className="px-3 py-1"
      >
        📎 Attach Files
      </Button>
      
      {files.length > 0 && (
        <div className="mt-2 p-3 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-500 mb-2">Attached ({files.length})</p>
          <div className="space-y-2">
            {files.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getFileIcon(file.type)}</span>
                  <div>
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => removeFile(file.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;