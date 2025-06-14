import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
}

export default function FileDropZone({ 
  onFileSelect, 
  accept = ".xlsx,.xls,.csv",
  maxSize = 10 * 1024 * 1024 // 10MB
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check file size
    if (file.size > maxSize) {
      alert(`Dosya boyutu çok büyük. Maksimum ${maxSize / 1024 / 1024}MB olmalıdır.`);
      return;
    }

    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = accept.split(',').map(ext => ext.trim().replace('.', ''));
    
    if (fileExtension && !allowedExtensions.includes(fileExtension)) {
      alert(`Desteklenmeyen dosya formatı. İzin verilen formatlar: ${accept}`);
      return;
    }

    onFileSelect(file);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`
        border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
        transition-all duration-200 ease-in-out
        ${isDragOver 
          ? 'border-primary-500 bg-primary-50 scale-105' 
          : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={openFileDialog}
    >
      <div className="mb-4">
        <i className={`text-4xl ${isDragOver ? 'text-primary-500' : 'text-slate-400'}`}>
          📁
        </i>
      </div>
      
      <h4 className="text-lg font-medium text-slate-700 mb-2">
        Excel dosyanızı sürükleyin veya seçin
      </h4>
      
      <p className="text-slate-500 text-sm mb-4">
        Maksimum dosya boyutu: {maxSize / 1024 / 1024}MB
      </p>
      
      <Button 
        type="button"
        className="bg-primary-600 text-white hover:bg-primary-700"
        onClick={(e) => {
          e.stopPropagation();
          openFileDialog();
        }}
      >
        Dosya Seç
      </Button>
      
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}
