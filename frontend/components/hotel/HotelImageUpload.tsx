'use client';

import { useState, useRef } from 'react';
import { aiApi } from '@/lib/api/services';
import { useAuth } from '@/lib/context/AuthContext';

interface HotelImageUploadProps {
  hotelId: number;
  onUploadComplete?: () => void;
}

interface UploadedImage {
  success: boolean;
  image_id: number;
  image_url: string;
  image_type: string;
  hotel_id: number;
  message: string;
}

const IMAGE_TYPES = [
  { value: 'hotel_exterior', label: 'Hotel Exterior' },
  { value: 'room_interior', label: 'Room Interior' },
  { value: 'facility', label: 'Facility' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'general', label: 'General' }
];

export default function HotelImageUpload({ hotelId, onUploadComplete }: HotelImageUploadProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imageTypes, setImageTypes] = useState<string[]>([]);
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    total_uploaded: number;
    total_failed: number;
    images: UploadedImage[];
    errors: string[];
    message: string;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
    setImageTypes(files.map(() => 'general'));
    setDescriptions(files.map(() => ''));
    setUploadResult(null);
  };

  const handleTypeChange = (index: number, type: string) => {
    const newTypes = [...imageTypes];
    newTypes[index] = type;
    setImageTypes(newTypes);
  };

  const handleDescriptionChange = (index: number, description: string) => {
    const newDescriptions = [...descriptions];
    newDescriptions[index] = description;
    setDescriptions(newDescriptions);
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newTypes = imageTypes.filter((_, i) => i !== index);
    const newDescriptions = descriptions.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setImageTypes(newTypes);
    setDescriptions(newDescriptions);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one image');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();

      // Append files
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      // Append metadata
      formData.append('image_types', imageTypes.join(','));
      formData.append('descriptions', descriptions.join(','));

      // Upload
      const result = await aiApi.uploadHotelImages(hotelId, formData);

      setUploadResult(result);

      if (result.success) {
        // Clear form
        setSelectedFiles([]);
        setImageTypes([]);
        setDescriptions([]);
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
        total_uploaded: 0,
        total_failed: selectedFiles.length,
        images: [],
        errors: [error.message || 'Upload failed'],
        message: 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Upload Hotel Images</h2>

      {/* File Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Images
        </label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
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
          Accepted formats: JPG, PNG, WEBP (max 50MB per file, 20 files max)
        </p>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mb-6 space-y-4">
          <h3 className="font-semibold text-gray-700">Selected Images ({selectedFiles.length})</h3>

          {selectedFiles.map((file, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-start gap-4">
                {/* Preview */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-24 h-24 object-cover rounded"
                />

                {/* Details */}
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  {/* Image Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Image Type *
                    </label>
                    <select
                      value={imageTypes[index] || 'general'}
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {IMAGE_TYPES.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={descriptions[index] || ''}
                      onChange={(e) => handleDescriptionChange(index, e.target.value)}
                      placeholder="Describe this image..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading || selectedFiles.length === 0}
        className={`w-full py-3 px-4 rounded-md font-semibold text-white
          ${uploading || selectedFiles.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }
          transition-colors duration-200`}
      >
        {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
      </button>

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

          <p className="text-sm text-gray-700">
            Uploaded: {uploadResult.total_uploaded} | Failed: {uploadResult.total_failed}
          </p>

          {uploadResult.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-red-700">Errors:</p>
              <ul className="list-disc list-inside text-sm text-red-600">
                {uploadResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {uploadResult.images.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-green-700">Successfully uploaded:</p>
              <ul className="list-disc list-inside text-sm text-green-600">
                {uploadResult.images.map((img, index) => (
                  <li key={index}>
                    {img.image_type} - ID: {img.image_id}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
