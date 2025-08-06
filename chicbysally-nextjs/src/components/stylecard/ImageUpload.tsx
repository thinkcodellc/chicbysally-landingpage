"use client";

import { useState, useRef, useEffect } from "react";

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  previewUrl?: string;
}

export default function ImageUpload({ onImageUpload, previewUrl }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | undefined>(previewUrl);
  const [error, setError] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);
  const isActiveRef = useRef(true);

  // Cleanup object URL and mark inactive on unmount
  // Prevents setState after unmount and ensures we don't revoke an already-removed node
  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
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

  const handleFile = async (file: File) => {
    setError(null);
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!file.type.startsWith("image/") || !allowedTypes.has(file.type)) {
      setError("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    try {
      let workingFile = file;
      const ONE_MB = 1_000_000;
      if (workingFile.size > ONE_MB) {
        setCompressing(true);
        workingFile = await compressImage(workingFile, ONE_MB);
        setCompressing(false);
        if (workingFile.size > ONE_MB) {
          setError("Could not compress below 1 MB. Please choose a smaller image.");
          return;
        }
      }

      // Revoke previous object URL if any
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      // Prefer object URL for preview; avoids large base64 strings and allows safe revoke
      const objectUrl = URL.createObjectURL(workingFile);
      objectUrlRef.current = objectUrl;
      if (isActiveRef.current) {
        setPreview(objectUrl);
      }

      // Pass file upward
      onImageUpload(workingFile);
    } catch (err) {
      console.error("Image handling error:", err);
      setCompressing(false);
      if (isActiveRef.current) {
        setError("Failed to process the image. Please try again.");
      }
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

      {/* Error banner */}
      {error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="status" aria-live="polite">
          {error}
        </div>
      )}
      
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
              aria-busy={compressing}
            >
              {compressing ? "Compressing..." : "Choose File"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Compress image to be under a target byte size using canvas.
 * Steps:
 *  - Try WebP with descending quality. If still large, progressively downscale.
 *  - Fallback to JPEG if WebP unsupported by the browser.
 */
async function compressImage(file: File, targetBytes = 1_000_000): Promise<File> {
  const img = await fileToHTMLImageElement(file);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context not available");

  // Helper to export canvas to blob at quality and type
  const toBlob = (type: string, quality: number) =>
    new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Canvas toBlob failed"));
      }, type, quality);
    });

  // Initial draw
  let width = img.naturalWidth;
  let height = img.naturalHeight;
  const maxEdgeStart = Math.max(width, height);
  const minQuality = 0.5;
  const qualitySteps = [0.9, 0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.5];
  const downscaleSteps = [1600, 1400, 1200, 1000, 900, 800];

  const tryExport = async (typePreferred: "image/webp" | "image/jpeg") => {
    for (const maxEdge of [maxEdgeStart, ...downscaleSteps]) {
      // Resize keeping aspect ratio if needed
      const scale =
        Math.max(width, height) > maxEdge ? maxEdge / Math.max(width, height) : 1;
      const w = Math.round(width * scale);
      const h = Math.round(height * scale);

      canvas.width = w;
      canvas.height = h;
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);

      for (const q of qualitySteps) {
        try {
          const blob = await toBlob(typePreferred, q);
          if (blob.size <= targetBytes) {
            return new File([blob], file.name, { type: typePreferred, lastModified: Date.now() });
          }
        } catch {
          // continue trying
        }
      }
      // if not small enough, continue to next downscale step
    }
    return null;
  };

  // Prefer WebP if supported; otherwise, fallback to JPEG
  let outFile = await tryExport("image/webp");
  if (!outFile) {
    outFile = await tryExport("image/jpeg");
  }
  if (!outFile) {
    // If all attempts failed, return original so caller can show message
    return file;
  }
  return outFile;
}

function fileToHTMLImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image decode failed"));
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
