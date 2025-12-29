'use client';

import { useState, useRef } from 'react';
import { aiApi } from '@/lib/api/services';
import { useAuth } from '@/lib/context/AuthContext';

interface HotelDocumentUploadProps {
  hotelId: number;
  onUploadComplete?: () => void;
}

const DOCUMENT_TYPES = [
  { value: 'brochure', label: 'Brochure' },
  { value: 'policy', label: 'Policy' },
  { value: 'menu', label: 'Menu' },
  { value: 'guide', label: 'Guide' },
  { value: 'contract', label: 'Contract' }
];

export default function HotelDocumentUpload({ hotelId, onUploadComplete }: HotelDocumentUploadProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('brochure');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    document_id?: number;
    file_url?: string;
    document_type?: string;
    rag_status?: string;
    message: string;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a document');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('document_type', documentType);

      const result = await aiApi.uploadHotelDocument(hotelId, formData);

      setUploadResult(result);

      if (result.success) {
        // Clear form
        setSelectedFile(null);
        setDocumentType('brochure');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Callback
        onUploadComplete?.();
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadResult({
        success: false,
        message: error.message || 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Hotel Document</h2>

      {/* Document Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document Type *
        </label>
        <select
          value={documentType}
          onChange={(e) => setDocumentType(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {DOCUMENT_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-gray-500">
          Select the type of document you're uploading
        </p>
      </div>

      {/* File Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Document
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            cursor-pointer"
        />
        <p className="mt-1 text-xs text-gray-500">
          Accepted formats: PDF, DOCX, DOC, TXT (max 50MB)
        </p>
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="mb-6 border rounded-lg p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{selectedFile.name}</p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Type: {DOCUMENT_TYPES.find(t => t.value === documentType)?.label}
              </p>
            </div>
            <button
              onClick={handleRemoveFile}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
        className={`w-full py-3 px-4 rounded-md font-semibold text-white
          ${uploading || !selectedFile
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }
          transition-colors duration-200`}
      >
        {uploading ? 'Uploading & Indexing...' : 'Upload Document'}
      </button>

      {/* Info Box */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Documents will be automatically indexed for RAG (Retrieval-Augmented Generation).
          This allows the AI chatbot to answer questions about the content of your documents.
        </p>
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className={`mt-6 p-4 rounded-lg ${
          uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className={`font-semibold mb-2 ${
            uploadResult.success ? 'text-green-800' : 'text-red-800'
          }`}>
            {uploadResult.message}
          </h3>

          {uploadResult.success && uploadResult.document_id && (
            <div className="text-sm text-gray-700 space-y-1">
              <p>Document ID: {uploadResult.document_id}</p>
              <p>RAG Status: <span className="font-medium">{uploadResult.rag_status}</span></p>
              {uploadResult.rag_status === 'pending' && (
                <p className="text-yellow-700 mt-2">
                  ⏳ Document is queued for RAG indexing. This may take a few minutes.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
