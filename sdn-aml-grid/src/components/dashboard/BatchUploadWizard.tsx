import React, { useState } from 'react';
import { X, Upload, Check, AlertCircle, FileText, RefreshCw } from 'lucide-react';

interface BatchUploadWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

const BatchUploadWizard: React.FC<BatchUploadWizardProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [results, setResults] = useState<{
    total: number;
    processed: number;
    flagged: number;
    errors: number;
  }>({
    total: 0,
    processed: 0,
    flagged: 0,
    errors: 0,
  });

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    if (e.dataTransfer.files) {
      const fileArray = Array.from(e.dataTransfer.files);
      setFiles([...files, ...fileArray]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileArray = Array.from(e.target.files);
      setFiles([...files, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const startUpload = () => {
    setUploading(true);
    
    // Simulate API call
    setTimeout(() => {
      setUploading(false);
      setUploadComplete(true);
      
      // Mock results
      setResults({
        total: files.length,
        processed: files.length,
        flagged: Math.floor(files.length * 0.3), // 30% flagged
        errors: Math.floor(files.length * 0.05), // 5% errors
      });
      
      setStep(3);
    }, 2000);
  };

  const resetWizard = () => {
    setStep(1);
    setFiles([]);
    setUploading(false);
    setUploadComplete(false);
    setResults({
      total: 0,
      processed: 0,
      flagged: 0,
      errors: 0,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[700px] max-w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-slate-800">Batch Upload</h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Steps */}
          <div className="mb-8">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step >= 1 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > 1 ? <Check size={16} /> : '1'}
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                step > 1 ? 'bg-emerald-500' : 'bg-slate-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step >= 2 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                {step > 2 ? <Check size={16} /> : '2'}
              </div>
              <div className={`flex-1 h-1 mx-2 ${
                step > 2 ? 'bg-emerald-500' : 'bg-slate-200'
              }`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                step >= 3 ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
              }`}>
                3
              </div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-slate-600">
              <span>Upload Files</span>
              <span>Confirm</span>
              <span>Results</span>
            </div>
          </div>

          {/* Step 1: Upload Files */}
          {step === 1 && (
            <div>
              {/* File upload area */}
              <div 
                className="border-2 border-dashed border-slate-300 rounded-lg p-8 mb-6 text-center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Upload size={36} className="mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium mb-2">Drag and drop files here</h3>
                <p className="text-sm text-slate-500 mb-4">
                  or
                </p>
                <div>
                  <label className="cursor-pointer bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors">
                    Browse Files
                    <input 
                      type="file" 
                      className="hidden" 
                      onChange={handleFileChange} 
                      multiple 
                    />
                  </label>
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  Supported formats: CSV, XLSX, JSON (Max 10MB per file)
                </p>
              </div>

              {/* File list */}
              {files.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Selected Files ({files.length})</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-slate-50 p-3 rounded-md">
                        <div className="flex items-center">
                          <FileText size={16} className="text-slate-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium text-slate-700">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFile(index)}
                          className="text-slate-400 hover:text-slate-600"
                          aria-label="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end space-x-2 mt-6">
                <button 
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => setStep(2)} 
                  className="btn-primary"
                  disabled={files.length === 0}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirmation */}
          {step === 2 && (
            <div>
              {/* Confirmation details */}
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-3">Upload Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Files to upload</span>
                    <span className="font-medium">{files.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total size</span>
                    <span className="font-medium">{(files.reduce((acc, file) => acc + file.size, 0) / 1024).toFixed(2)} KB</span>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <div className="flex items-start">
                  <AlertCircle size={20} className="text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-yellow-700">Important Information</h4>
                    <p className="text-sm text-yellow-600 mt-1">
                      Uploading entities in bulk will automatically screen them against multiple sanctions lists.
                      Flagged entities will be added to your watchlist for review.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end space-x-2 mt-6">
                <button 
                  onClick={() => setStep(1)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-md hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
                <button 
                  onClick={startUpload} 
                  className="btn-primary"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Upload Files'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {step === 3 && (
            <div>
              {/* Success message */}
              <div className="mb-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-xl font-medium text-slate-800 mb-2">Upload Complete</h3>
                <p className="text-slate-600">
                  Your files have been processed successfully!
                </p>
              </div>

              {/* Results summary */}
              <div className="bg-slate-50 p-4 rounded-lg mb-6">
                <h3 className="font-medium mb-3">Processing Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-md">
                    <p className="text-sm text-slate-500">Total Entities</p>
                    <p className="text-xl font-bold text-slate-800">{results.total}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md">
                    <p className="text-sm text-slate-500">Processed</p>
                    <p className="text-xl font-bold text-emerald-500">{results.processed}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md">
                    <p className="text-sm text-slate-500">Flagged</p>
                    <p className="text-xl font-bold text-yellow-500">{results.flagged}</p>
                  </div>
                  <div className="bg-white p-3 rounded-md">
                    <p className="text-sm text-slate-500">Errors</p>
                    <p className="text-xl font-bold text-red-500">{results.errors}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between mt-6">
                <button 
                  onClick={resetWizard}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-md hover:bg-slate-50 transition-colors flex items-center"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Upload More Files
                </button>
                <button 
                  onClick={onClose} 
                  className="btn-primary"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchUploadWizard;
