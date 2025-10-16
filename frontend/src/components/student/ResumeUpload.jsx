import { useState } from 'react';
import api from '../../services/api';

const ResumeUpload = ({ onSuccess, onSkip }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please upload a PDF, DOCX, or TXT file');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError(null);
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/student/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        onSuccess(response.data.extracted_data, response.data.missing_fields);
      } else {
        // AI parsing failed, show manual entry form
        onSuccess(null, ['all']);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.detail || 'Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-[#1a1a1a] rounded-2xl shadow-xl p-8 max-w-2xl w-full border border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Complete Your Profile
          </h1>
          <p className="text-gray-400">
            Upload your resume to automatically fill in your profile details
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive
              ? 'border-purple-500 bg-purple-900/20'
              : 'border-gray-700 bg-gray-900/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {file ? (
            <div className="space-y-4">
              <svg
                className="mx-auto h-16 w-16 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-lg font-medium text-white">{file.name}</p>
                <p className="text-sm text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-sm text-purple-400 hover:text-purple-300 font-medium"
              >
                Choose a different file
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <svg
                className="mx-auto h-16 w-16 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <div>
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-purple-400 hover:text-purple-300 font-medium"
                >
                  Click to upload
                </label>
                <span className="text-gray-400"> or drag and drop</span>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileInputChange}
                />
              </div>
              <p className="text-sm text-gray-400">
                PDF, DOCX, or TXT (max 10MB)
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="mt-8 flex gap-4">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
              !file || uploading
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-[#833fd4] text-white hover:bg-[#632aa0]'
            }`}
          >
            {uploading ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Uploading & Processing...
              </span>
            ) : (
              'Upload Resume'
            )}
          </button>

          <button
            onClick={onSkip}
            disabled={uploading}
            className="flex-1 py-3 px-6 rounded-lg font-medium border-2 border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Enter Details Manually
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Your resume will be processed securely and automatically
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
