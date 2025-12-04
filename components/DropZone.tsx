import React, { useState, useRef } from 'react';
import { UploadedFile } from '../types';

interface DropZoneProps {
  onFileSelected: (file: UploadedFile) => void;
  disabled?: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelected, disabled }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const isImage = file.type.startsWith('image/');
    const isPdf = file.type === 'application/pdf';

    if (!isImage && !isPdf) {
      alert('Please upload a valid PDF or Image file.');
      return;
    }
    // Limit to 20MB for inlineData safety
    if (file.size > 20 * 1024 * 1024) {
      alert('File is too large. Please upload a file smaller than 20MB.');
      return;
    }

    onFileSelected({
      file,
    });
  };

  return (
    <div
      className={`relative w-full transition-all duration-300 ease-in-out border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer group
        ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="application/pdf,image/*"
        className="hidden"
        disabled={disabled}
      />
      
      <div className={`p-4 rounded-full bg-indigo-100 mb-4 transition-transform duration-300 ${isDragging ? 'scale-110' : 'group-hover:scale-110'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-slate-800 mb-1">
        Click to upload or drag and drop
      </h3>
      <p className="text-sm text-slate-500 mb-4">
        PDF or Images (max 20MB)
      </p>

      <button 
        className={`px-4 py-2 rounded-lg bg-white border border-slate-300 text-sm font-medium text-slate-700 shadow-sm transition-colors
          ${!disabled && 'group-hover:text-indigo-600 group-hover:border-indigo-300'}
        `}
      >
        Select File
      </button>
    </div>
  );
};