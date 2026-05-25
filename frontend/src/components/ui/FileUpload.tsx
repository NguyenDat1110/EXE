import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, File } from 'lucide-react';
import { clsx } from 'clsx';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in bytes
  maxFiles?: number;
  preview?: boolean;
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  multiple = false,
  accept = '*',
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles = 5,
  preview = false,
  className,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFiles = (files: FileList) => {
    const newFiles: File[] = [];

    for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
      const file = files[i];
      if (file.size <= maxSize) {
        newFiles.push(file);
      }
    }

    setSelectedFiles(prev => {
      const combined = multiple ? [...prev, ...newFiles] : newFiles;
      return combined.slice(0, maxFiles);
    });

    onFilesSelected(newFiles);

    if (preview) {
      const newPreviews: string[] = [];
      for (const file of newFiles) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string);
            setPreviews(prev => [...prev, ...newPreviews].slice(0, maxFiles));
          }
        };
        reader.readAsDataURL(file);
      }
    }

    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    processFiles(e.dataTransfer.files);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={className}>
      {/* Upload Zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        animate={{
          backgroundColor: isDragging ? 'rgba(0, 212, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
          borderColor: isDragging ? 'rgba(0, 212, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)',
        }}
        className={clsx(
          'glass-panel rounded-xl p-8 text-center cursor-pointer transition-colors border border-white/10',
          isDragging && 'border-cyan'
        )}
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-cyan mx-auto mb-2" />
        <p className="text-white font-medium">Kéo thả hoặc click để tải lên</p>
        <p className="text-silver/60 text-sm mt-1">
          Max {maxSize / (1024 * 1024)}MB
          {multiple && ` • Max ${maxFiles} tệp`}
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
      </motion.div>

      {/* File List & Previews */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-3">
          {preview && previews.length > 0 ? (
            // Image Preview Grid
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {previews.map((src, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group"
                >
                  <img
                    src={src}
                    alt={`Preview ${i + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                  >
                    <X className="w-5 h-5 text-white" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            // File List
            <div className="space-y-2">
              {selectedFiles.map((file, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="glass-panel px-4 py-3 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <File className="w-4 h-4 text-cyan flex-shrink-0" />
                    <span className="text-white text-sm truncate">{file.name}</span>
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="text-silver/60 hover:text-white transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
