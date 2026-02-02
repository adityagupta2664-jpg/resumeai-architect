import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { FileData } from '../types';

interface FileUploadProps {
  onFileSelected: (file: FileData) => void;
  isProcessing?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    setError(null);
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'image/png', 'image/jpeg'];
    
    if (!validTypes.includes(file.type)) {
      setError("Unsupported file type. Please upload PDF, DOCX, TXT, or PNG/JPG.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File is too large. Max 5MB.");
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = (e.target?.result as string).split(',')[1];
      onFileSelected({
        base64: base64String,
        mimeType: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  }, [onFileSelected]);

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div 
        className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all duration-200 ease-in-out
          ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 bg-white'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : 'hover:border-blue-400'}
        `}
        onDragEnter={onDrag} 
        onDragLeave={onDrag} 
        onDragOver={onDrag} 
        onDrop={onDrop}
      >
        <input 
          type="file" 
          id="file-upload" 
          className="hidden" 
          onChange={handleChange}
          accept=".pdf,.docx,.txt,.png,.jpg"
          disabled={isProcessing}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          {isProcessing ? (
             <div className="animate-spin text-blue-600">
                <Loader2 size={48} />
             </div>
          ) : (
            <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                <Upload size={32} />
            </div>
          )}
          
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {isProcessing ? 'Analyzing Resume...' : 'Upload your resume'}
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              Drag and drop or <label htmlFor="file-upload" className="text-blue-600 font-medium cursor-pointer hover:underline">browse</label>
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-wider font-medium mt-4">
            <FileText size={12} />
            PDF, DOCX, TXT, Images
          </div>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm animate-fade-in">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};
