'use client';

import { useState, useRef } from 'react';
import { attendanceApi } from '@/lib/api/services';
import { Camera, Upload, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export default function AttendancePage() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [eventType, setEventType] = useState<'CHECK_IN' | 'CHECK_OUT'>('CHECK_IN');
  const [location, setLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setUploadStatus('idle');
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setUploadStatus('error');
      setStatusMessage('Please select an image first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('event_type', eventType);
      if (location) {
        formData.append('location', location);
      }

      await attendanceApi.uploadAttendance(formData);

      setUploadStatus('success');
      setStatusMessage(`${eventType === 'CHECK_IN' ? 'Check-in' : 'Check-out'} recorded successfully!`);

      // Reset form
      setSelectedImage(null);
      setPreview(null);
      setLocation('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setUploadStatus('error');
      setStatusMessage(error.response?.data?.message || 'Failed to upload attendance');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Staff Attendance</h1>
        <p className="text-gray-600 mt-2">Upload your photo for check-in or check-out</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Attendance Photo</h2>

          {/* Event Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Type
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setEventType('CHECK_IN')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition ${
                  eventType === 'CHECK_IN'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-700 hover:border-green-300'
                }`}
              >
                Check In
              </button>
              <button
                onClick={() => setEventType('CHECK_OUT')}
                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition ${
                  eventType === 'CHECK_OUT'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-700 hover:border-red-300'
                }`}
              >
                Check Out
              </button>
            </div>
          </div>

          {/* Location Input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Front Desk, Staff Room"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />

            {!preview ? (
              <button
                onClick={triggerFileInput}
                className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition flex flex-col items-center justify-center text-gray-500 hover:text-blue-500"
              >
                <Camera className="w-16 h-16 mb-2" />
                <p className="font-medium">Click to upload photo</p>
                <p className="text-sm">or drag and drop</p>
              </button>
            ) : (
              <div className="relative">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setPreview(null);
                    setSelectedImage(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Status Message */}
          {uploadStatus !== 'idle' && (
            <div
              className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
                uploadStatus === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {uploadStatus === 'success' ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
              <p>{statusMessage}</p>
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedImage || isUploading}
            className="w-full"
          >
            {isUploading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                Submit Attendance
              </span>
            )}
          </Button>
        </Card>

        {/* Instructions */}
        <Card>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Instructions</h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Select Event Type</h3>
                <p className="text-sm">Choose whether you are checking in or checking out</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Take a Clear Photo</h3>
                <p className="text-sm">Make sure your face is clearly visible and well-lit</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Add Location (Optional)</h3>
                <p className="text-sm">Specify where you are checking in/out from</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                4
              </div>
              <div>
                <h3 className="font-semibold mb-1">Submit</h3>
                <p className="text-sm">Click submit to record your attendance</p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
            <h4 className="font-semibold text-yellow-800 mb-2">Tips for best results:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Face the camera directly</li>
              <li>• Ensure good lighting</li>
              <li>• Remove sunglasses and face masks</li>
              <li>• Keep a neutral expression</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
