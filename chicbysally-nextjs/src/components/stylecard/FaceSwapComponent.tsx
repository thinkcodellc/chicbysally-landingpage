"use client";

import { useState, useCallback, useEffect } from "react";
import { FaChevronDown, FaUser, FaImage, FaTimes, FaSpinner } from "react-icons/fa";
import { FaceSwapService, FaceSwapInput, FaceSwapOutput } from "./FaceSwapService";
import ResultsDisplay from "./ResultsDisplay";
import Image from "next/image";
import { ReferenceImage } from "@/lib/data";
import ReferenceImageGrid from "./ReferenceImageGrid";
import "./FaceSwapLayout.css";

interface FaceSwapComponentProps {
  // Optional callback for when face-swap is completed
  onFaceSwapComplete?: (result: FaceSwapOutput) => void;
  // Optional callback for errors
  onError?: (error: string) => void;
  // Optional pre-selected reference image URL (for integration with existing flow)
  referenceImageUrl?: string;
  // Optional reference image title
  referenceImageTitle?: string;
  // Reference images data
  referenceImages?: ReferenceImage[];
  // Selected image ID
  selectedImageId?: string | null;
  // Image selection handler
  onImageSelect?: (image: ReferenceImage | null) => void;
}

interface EnhancedError extends Error {
  originalError?: unknown;
  originalMessage?: string;
  details?: unknown;
}

export default function FaceSwapComponent({ 
  onFaceSwapComplete, 
  onError,
  referenceImageUrl,
  referenceImageTitle,
  referenceImages = [],
  selectedImageId: propSelectedImageId,
  onImageSelect: propOnImageSelect
}: FaceSwapComponentProps) {
  // State for managing reference image selection internally
  const [internalSelectedImageId, setInternalSelectedImageId] = useState<string | null>(propSelectedImageId || null);
  
  // Use external handler if provided, otherwise use internal state
  const selectedImageId = propSelectedImageId ?? internalSelectedImageId;
  
  // Handle image selection
  const handleImageSelect = useCallback((image: ReferenceImage) => {
    console.log('FaceSwapComponent: handleImageSelect called with image:', image);
    if (propOnImageSelect) {
      propOnImageSelect(image);
    } else {
      setInternalSelectedImageId(image.id);
    }
  }, [propOnImageSelect]);

  useEffect(() => {
    console.log('FaceSwapComponent: selectedImageId (prop) updated to:', propSelectedImageId);
    console.log('FaceSwapComponent: internalSelectedImageId updated to:', internalSelectedImageId);
  }, [propSelectedImageId, internalSelectedImageId]);
  
  // Find the selected image
  const selectedImage = referenceImages.find(img => img.id === selectedImageId);
  // State for uploaded images
  const [uploadedImages, setUploadedImages] = useState<{
    input?: File;
    swap?: File;
  }>({});

  // State for preview URLs
  const [previewUrls, setPreviewUrls] = useState<{
    input?: string;
    swap?: string;
  }>({});

  console.log('FaceSwapComponent: previewUrls initialized to:', previewUrls);
  // Initialize preview URLs with selected image
  useEffect(() => {
    if (selectedImage?.url) {
      // Apply transformation string to ImageKit URLs from environment variable
      const imageUrl = selectedImage.url;
      const imageKitTransformations = process.env.NEXT_PUBLIC_IMAGEKIT_TRANSFORMATIONS || "/tr:w-600,h-800,e-contrast,e-sharpen,c-at_max:b-20_FFFFFF:b-2_000000:l-text,i-CHICBYSALLY,ff-Audiowide,fs-18,co-FFFFFF,lx-bh_mul_0.65,ly-bh_mul_0.9,l-end:l-text,i-stylecard%20by,ff-Audiowide,fs-12,co-FFFFFF,lx-bh_mul_0.7,ly-bh_mul_0.87,l-end";
      const transformedUrl = imageUrl.includes('ik.imagekit.io') 
        ? imageUrl + imageKitTransformations
        : imageUrl;
      setPreviewUrls(prev => ({ ...prev, swap: transformedUrl }));
      console.log('FaceSwapComponent: previewUrls updated to:', previewUrls);
    }
  }, [selectedImage?.url]);
  // State for face-swap process
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<FaceSwapOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState<{
    remainingRequests: number;
    maxRequests: number;
    resetTime: number | null;
  } | null>(null);

  // Compress image function (copied from ImageUpload component)
  const compressImage = useCallback(async (file: File, targetBytes = 1_000_000): Promise<File> => {
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
  }, []);

  // Helper functions for compression
  const fileToHTMLImageElement = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("FileReader failed"));
      reader.onload = () => {
        const img: HTMLImageElement = document.createElement("img");
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Image decode failed"));
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle image upload (only for input image now)
  const handleImageUpload = useCallback(async (file: File, type: 'input' | 'swap') => {
    // Only allow input image uploads
    if (type !== 'input') {
      return;
    }

    try {
      let workingFile = file;
      const ONE_MB = 1_000_000;
      
      // Compress image if larger than 1MB
      if (workingFile.size > ONE_MB) {
        console.log('Compressing image...', { originalSize: workingFile.size });
        workingFile = await compressImage(workingFile, ONE_MB);
        console.log('Image compressed', { compressedSize: workingFile.size });
        
        if (workingFile.size > ONE_MB) {
          setError("Could not compress below 1 MB. Please choose a smaller image.");
          return;
        }
      }

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(workingFile);
      
      setUploadedImages(prev => ({ ...prev, [type]: workingFile }));
      setPreviewUrls(prev => ({ ...prev, [type]: objectUrl }));
      
      // Clear previous results and errors when new images are uploaded
      setResult(null);
      setError(null);
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Failed to process the image. Please try again.");
    }
  }, [compressImage]);

  // Convert blob URL to data URL
  const convertBlobToDataUrl = useCallback(async (blobUrl: string): Promise<string> => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error converting blob to data URL:', error);
      throw new Error('Failed to process uploaded image');
    }
  }, []);

  // Handle face-swap
  const handleFaceSwap = useCallback(async () => {
    if (!uploadedImages.input || (!uploadedImages.swap && !referenceImageUrl)) {
      setError("Please upload your photo and select a reference style image.");
      return;
    }

    // Get current rate limit status
    const currentRateLimit = FaceSwapService.getRateLimitStatus();
    setRateLimitStatus(currentRateLimit);

    if (currentRateLimit.remainingRequests <= 0) {
      const resetTime = currentRateLimit.resetTime 
        ? new Date(currentRateLimit.resetTime).toLocaleTimeString()
        : 'unknown time';
      setError(`Rate limit exceeded. Please subscribe for more StyleCards!`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Convert user uploaded photo URL if it's a blob URL
      let userPhotoUrl = previewUrls.input || '';
      if (userPhotoUrl.startsWith('blob:')) {
        console.log('Converting blob URL to data URL for user photo');
        userPhotoUrl = await convertBlobToDataUrl(userPhotoUrl);
      }

      // Get reference image URL (already transformed in useEffect)
      const referenceImageUrlWithTransform = previewUrls.swap || '';

      const faceSwapInput: FaceSwapInput = {
        inputImage: referenceImageUrlWithTransform, // Reference image (target) - this should be the face to receive the swap
        swapImage: userPhotoUrl                     // User uploaded photo (swap) - this should be the face to transplant
      };

      console.log('Face-swap input:', {
        inputImageType: referenceImageUrlWithTransform.startsWith('data:') ? 'data URL' : 'regular URL',
        inputImageLength: referenceImageUrlWithTransform.length,
        swapImageType: userPhotoUrl.startsWith('data:') ? 'data URL' : 'regular URL',
        swapImageLength: userPhotoUrl.length
      });

      // Call face-swap API
      const faceSwapResult = await FaceSwapService.performFaceSwap(faceSwapInput);
      
      setResult(faceSwapResult);
      onFaceSwapComplete?.(faceSwapResult);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      
      // Log detailed error information to browser console
      console.error('Face swap error:', err);
      console.error('Error details:', {
        message: errorMessage,
        error: err,
        stack: err instanceof Error ? err.stack : 'No stack trace available',
        timestamp: new Date().toISOString(),
        uploadedImages: {
          input: uploadedImages.input ? `${uploadedImages.input.name} (${uploadedImages.input.size} bytes)` : null,
          swap: uploadedImages.swap ? `${uploadedImages.swap.name} (${uploadedImages.swap.size} bytes)` : null
        },
        previewUrls: {
          input: previewUrls.input ? 'URL present' : null,
          swap: previewUrls.swap || referenceImageUrl ? 'URL present' : null
        },
        rateLimitStatus: currentRateLimit,
        // Enhanced error details from FaceSwapService
        originalError: (err as EnhancedError).originalError,
        originalMessage: (err as EnhancedError).originalMessage,
        serviceDetails: (err as EnhancedError).details
      });
      
      // Also log a warning about checking server logs
      console.warn('🔍 Debug Tip: Check the terminal window where Next.js is running for detailed server-side error logs.');
      console.warn('🔍 Server logs will show more detailed information about the Replicate API call and any issues.');
      
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImages, previewUrls, referenceImageUrl, onFaceSwapComplete, onError, convertBlobToDataUrl]);

  // Reset the component
  const handleReset = useCallback(() => {
    // Clean up object URLs
    Object.values(previewUrls).forEach(url => {
      if (url && !url.startsWith('http')) { // Don't revoke external URLs
        URL.revokeObjectURL(url);
      }
    });
    
    setUploadedImages({});
    setPreviewUrls({});
    setResult(null);
    setError(null);
    setRateLimitStatus(null);
    
    // Clear selected reference image
    if (propOnImageSelect) {
      // Call the external handler with null to clear selection
      propOnImageSelect(null);
    } else {
      // Clear internal selection
      setInternalSelectedImageId(null);
    }
  }, [previewUrls, propOnImageSelect]);

  // Check if we can perform face-swap
  const canPerformFaceSwap = uploadedImages.input && (uploadedImages.swap || referenceImageUrl);

  // Handle collapsible sections
  const handleCollapsibleToggle = useCallback((section: string) => {
    const element = document.querySelector(`.stylecard-collapsible[data-section="${section}"]`);
    if (element) {
      element.classList.toggle('expanded');
    }
  }, []);

  return (
    <div className="stylecard-container">    
      <div className="stylecard-main-grid">
        {/* Upload Section */}
        <div className="stylecard-upload-section">
          <div className="stylecard-collapsible expanded" data-section="upload">
            <div className="stylecard-collapsible-header" onClick={() => handleCollapsibleToggle('upload')}>
              <span className="stylecard-collapsible-title">Upload Your Photo</span>
              <FaChevronDown className="stylecard-collapsible-icon" />
            </div>
            <div className="stylecard-collapsible-content">
              <div className="stylecard-collapsible-body">
                <div 
                  role="button"
                  aria-disabled={uploadedImages.input ? false : true}
                  className={`stylecard-image-area ${
                    uploadedImages.input 
                      ? 'stylecard-image-area active' 
                      : ''
                  }`}
                  onClick={() => {
                    if (!uploadedImages.input) {
                      // Trigger file input click
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          handleImageUpload(file, 'input');
                        }
                      };
                      input.click();
                    }
                  }}
                >
                  {previewUrls.input ? (
                    <div className="stylecard-image-preview">
                      <Image 
                        src={previewUrls.input} 
                        alt="Your uploaded photo" 
                        fill
                        sizes="100vw"
                        className="object-cover rounded-lg"
                        unoptimized
                        priority
                      />
                    </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <FaImage className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Reference Style</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Choose from our curated collection below
                        </p>
                      </>
                    )}
                  {selectedImage?.title && (
                    <p className="text-center text-sm text-gray-600 font-semibold mt-2">
                      {selectedImage.title}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reference Section */}
        <div className="stylecard-reference-section">
          <div className="stylecard-collapsible expanded" data-section="reference">
            <div className="stylecard-collapsible-header" onClick={() => handleCollapsibleToggle('reference')}>
              <span className="stylecard-collapsible-title">Reference Style</span>
              <FaChevronDown className="stylecard-collapsible-icon" />
            </div>
            <div className="stylecard-collapsible-content">
              <div className="stylecard-collapsible-body">
                {/* Main Reference Image Display Area */}
                <div className="stylecard-image-area active max-w-xs mx-auto">
                  {selectedImage ? (
                    <div className="stylecard-image-preview">
                      <Image 
                        src={previewUrls.swap || selectedImage.url} 
                        alt={selectedImage.title || "Selected reference style"} 
                        fill
                        sizes="100vw"
                        className="object-cover rounded-lg"
                        unoptimized
                        priority
                      />
                    </div>
                  ) : (
                    /* Display a larger version of the selected reference image */
                    selectedImageId && referenceImages.length > 0 ? (
                      <div className="stylecard-image-preview relative">
                        <Image 
                          src={referenceImages.find(img => img.id === selectedImageId)?.url || ''} 
                          alt={referenceImages.find(img => img.id === selectedImageId)?.title || "Selected reference style"} 
                          fill
                          sizes="100vw"
                          className="object-cover object-top object-center rounded-lg"
                          unoptimized
                          priority
                        />
                        {/* Left Arrow Button */}
                        <button
                          onClick={() => {
                            const currentIndex = referenceImages.findIndex(img => img.id === selectedImageId);
                            const newIndex = (currentIndex - 1 + referenceImages.length) % referenceImages.length;
                            handleImageSelect(referenceImages[newIndex]);
                          }}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200 z-10"
                        >
                          {'<'}
                        </button>
                        {/* Right Arrow Button */}
                        <button
                          onClick={() => {
                            const currentIndex = referenceImages.findIndex(img => img.id === selectedImageId);
                            const newIndex = (currentIndex + 1) % referenceImages.length;
                            handleImageSelect(referenceImages[newIndex]);
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition-all duration-200 z-10"
                        >
                          {'>'}
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="mb-4">
                          <FaImage className="text-4xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Select a Reference Style</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Choose from our curated collection below
                        </p>
                      </>
                    ))}
                  {selectedImage?.title && (
                    <p className="text-center text-sm text-gray-600 font-semibold mt-2">
                      {selectedImage.title}
                    </p>
                  )}
                </div>

                {/* Curated Reference Images - Dock Container */}
                <div className="mt-4 bg-white rounded-xl shadow-lg p-4 overflow-x-auto">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Curated Reference Images</h2>
                  
                  {/* Loading indicator */}
                  {referenceImages.length === 0 && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                    </div>
                  )}
                  
                  {/* Reference Image Grid Component (Dock) */}
                  {referenceImages.length > 0 && (
                    <ReferenceImageGrid
                      images={referenceImages}
                      selectedImageId={selectedImageId}
                      onImageSelect={handleImageSelect}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="stylecard-actions-section sticky bottom-0 bg-white p-4 shadow-lg z-50">
          <div className="stylecard-actions">
            <button
              onClick={handleFaceSwap}
              disabled={!canPerformFaceSwap || isProcessing}
              className={`bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                !canPerformFaceSwap || isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating StyleCard...
                </div>
              ) : (
                "Create StyleCard"
              )}
            </button>

            <button
              onClick={handleReset}
              className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg hover:bg-gray-300 transition duration-300 font-medium"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className="stylecard-results-section">
            <div className="stylecard-results">
              <h3>Your StyleCard</h3>
              <ResultsDisplay
                result={result}
                originalImages={previewUrls}
                onDownload={() => {
                  // Handle download functionality
                  if (result.url) {
                    const link = document.createElement('a');
                    link.href = result.url;
                    link.download = 'stylecard.jpg';
                    link.click();
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isProcessing && (
        <div className="stylecard-loading-overlay">
          <div className="stylecard-loading-content">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Creating Your StyleCard</h3>
            <p className="text-gray-600">This may take a few moments...</p>
          </div>
        </div>
      )}
    </div>
  );
}
