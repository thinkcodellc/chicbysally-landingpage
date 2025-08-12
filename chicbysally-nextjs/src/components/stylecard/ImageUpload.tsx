"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

export interface ImageUploadProps {
  // After compression, emit the compressed File; parent will create an object URL for preview
  onImageUpload: (file: File, type: 'input' | 'swap') => void;
  // Parent controls preview by passing the preview object URL back in
  previewUrls?: {
    input?: string;
    swap?: string;
  };
  // Optional labels for the upload areas
  labels?: {
    input?: string;
    swap?: string;
  };
  // Optional descriptions for the upload areas
  descriptions?: {
    input?: string;
    swap?: string;
  };
}

export default function ImageUpload({ 
  onImageUpload, 
  previewUrls = {}, 
  labels = {},
  descriptions = {}
}: ImageUploadProps) {
  // State for input image (user's face)
  const [inputState, setInputState] = useState({
    isDragging: false,
    error: null as string | null,
    compressing: false,
  });
  
  // State for swap image (reference style)
  const [swapState, setSwapState] = useState({
    isDragging: false,
    error: null as string | null,
    compressing: false,
  });

  const inputFileRef = useRef<HTMLInputElement>(null);
  const swapFileRef = useRef<HTMLInputElement>(null);
  const isActiveRef = useRef(true);
  const isOpeningRef = useRef({ input: false, swap: false });

  // Default labels
  const defaultLabels = {
    input: "Upload Your Photo",
    swap: "Choose Reference Style",
    ...labels
  };

  // Default descriptions
  const defaultDescriptions = {
    input: "Drag and drop your photo here, or click to browse",
    swap: "Drag and drop the reference style image here, or click to browse",
    ...descriptions
  };

  // Cleanup on unmount
  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
    };
  }, []);

  const handleDragOver = (e: React.DragEvent, type: 'input' | 'swap') => {
    e.preventDefault();
    if (type === 'input') {
      setInputState(prev => ({ ...prev, isDragging: true }));
    } else {
      setSwapState(prev => ({ ...prev, isDragging: true }));
    }
  };

  const handleDragLeave = (e: React.DragEvent, type: 'input' | 'swap') => {
    e.preventDefault();
    if (type === 'input') {
      setInputState(prev => ({ ...prev, isDragging: false }));
    } else {
      setSwapState(prev => ({ ...prev, isDragging: false }));
    }
  };

  const handleDrop = (e: React.DragEvent, type: 'input' | 'swap') => {
    e.preventDefault();
    if (type === 'input') {
      setInputState(prev => ({ ...prev, isDragging: false }));
    } else {
      setSwapState(prev => ({ ...prev, isDragging: false }));
    }
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file, type);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, type: 'input' | 'swap') => {
    setTimeout(() => { 
      isOpeningRef.current = { ...isOpeningRef.current, [type]: false }; 
    }, 0);
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file, type);
    }
  };

  const handleFile = async (file: File, type: 'input' | 'swap') => {
    const setState = type === 'input' ? setInputState : setSwapState;
    
    setState(prev => ({ ...prev, error: null }));
    
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!file.type.startsWith("image/") || !allowedTypes.has(file.type)) {
      setState(prev => ({ ...prev, error: "Please upload a JPEG, PNG, or WebP image." }));
      return;
    }
    
    try {
      let workingFile = file;
      const ONE_MB = 1_000_000;
      
      if (workingFile.size > ONE_MB) {
        setState(prev => ({ ...prev, compressing: true }));
        workingFile = await compressImage(workingFile, ONE_MB);
        setState(prev => ({ ...prev, compressing: false }));
        
        if (workingFile.size > ONE_MB) {
          setState(prev => ({ ...prev, error: "Could not compress below 1 MB. Please choose a smaller image." }));
          return;
        }
      }

      // Emit the compressed File with type information
      onImageUpload(workingFile, type);
    } catch (err) {
      console.error("Image upload error:", err);
      setState(prev => ({ ...prev, compressing: false }));
      if (isActiveRef.current) {
        setState(prev => ({ ...prev, error: "Failed to process the image. Please try again." }));
      }
    } finally {
      // Always clear the file input
      const fileRef = type === 'input' ? inputFileRef : swapFileRef;
      if (fileRef.current) {
        try {
          fileRef.current.value = "";
        } catch {}
      }
      // Ensure dialog guard is released
      isOpeningRef.current = { ...isOpeningRef.current, [type]: false };
    }
  };

  const handleClick = (type: 'input' | 'swap') => {
    const state = type === 'input' ? inputState : swapState;
    const fileRef = type === 'input' ? inputFileRef : swapFileRef;
    
    if (state.compressing) return;
    
    if (isOpeningRef.current[type]) return;
    isOpeningRef.current = { ...isOpeningRef.current, [type]: true };
    
    setTimeout(() => {
      if (fileRef.current) {
        fileRef.current.click();
      }
      setTimeout(() => { 
        isOpeningRef.current = { ...isOpeningRef.current, [type]: false }; 
      }, 500);
    }, 0);
  };

  const renderUploadArea = (type: 'input' | 'swap') => {
    const state = type === 'input' ? inputState : swapState;
    const previewUrl = previewUrls[type];
    const label = defaultLabels[type];
    const description = defaultDescriptions[type];
    const fileRef = type === 'input' ? inputFileRef : swapFileRef;

    return (
      <div className="w-full">
        <input
          type="file"
          ref={fileRef}
          onChange={(e) => handleFileInput(e, type)}
          accept="image/*"
          className="hidden"
        />

        {/* Error banner */}
        {state.error && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="status" aria-live="polite">
            {state.error}
          </div>
        )}
        
        <div 
          role="button"
          aria-disabled={state.compressing}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            state.isDragging 
              ? 'border-pink-500 bg-pink-50 ring-2 ring-pink-200' 
              : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50'
          } ${state.compressing ? 'opacity-80' : ''}`}
          onDragOver={(e) => handleDragOver(e, type)}
          onDragLeave={(e) => handleDragLeave(e, type)}
          onDrop={(e) => handleDrop(e, type)}
          onClick={() => handleClick(type)}
        >
          {previewUrl ? (
            <div className="relative block w-full aspect-[4/5] md:aspect-square min-h-[240px]">
              <Image 
                src={previewUrl} 
                alt={`Preview - ${label}`} 
                fill
                sizes="100vw"
                className="object-cover rounded-lg"
                unoptimized
                priority
              />
              <img 
                src={previewUrl} 
                alt={`Preview - ${label}`} 
                className="hidden w-full h-full object-cover rounded-lg" 
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).classList.remove("hidden");
                }} 
              />
            </div>
          ) : (
            <>
              <div className="mb-4">
                <i className={`fas ${type === 'input' ? 'fa-user' : 'fa-image'} text-4xl text-gray-400`}></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{label}</h3>
              <p className="text-gray-500 text-sm mb-4">
                {description}
              </p>
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(type);
                }}
                className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition duration-300"
                aria-busy={state.compressing}
                disabled={state.compressing}
              >
                {state.compressing ? "Compressing..." : "Choose File"}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Input Image Upload Area */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Your Photo</h4>
        {renderUploadArea('input')}
      </div>
      
      {/* Swap Image Upload Area */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Reference Style</h4>
        {renderUploadArea('swap')}
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
  const width = img.naturalWidth;
  const height = img.naturalHeight;
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

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

function fileToHTMLImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("FileReader failed"));
    reader.onload = () => {
      // Explicitly construct an HTMLImageElement to satisfy TS during build
      const img: HTMLImageElement = document.createElement("img");
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image decode failed"));
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
