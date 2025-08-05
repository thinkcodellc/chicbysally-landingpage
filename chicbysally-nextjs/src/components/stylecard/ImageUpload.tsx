"use client";

import { useState, useRef } from "react";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  previewUrl?: string;
}

export default function ImageUpload({ onImageUpload, previewUrl }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(previewUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      onImageUpload(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="image/*"
        className="hidden"
      />
      
      <div 
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
          isDragging 
            ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-200' 
            : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {preview ? (
          <div className="relative aspect-square">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
              <div className="bg-white bg-opacity-90 px-4 py-2 rounded-lg">
                <i className="fas fa-sync-alt mr-2"></i>
                Change Photo
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <i className="fas fa-cloud-upload-alt text-4xl text-gray-400"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload Your Photo</h3>
            <p className="text-gray-500 text-sm mb-4">
              Drag and drop your photo here, or click to browse
            </p>
            <button 
              type="button"
              className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition duration-300"
            >
              Choose File
            </button>
          </>
        )}
      </div>
    </div>
  );
}
