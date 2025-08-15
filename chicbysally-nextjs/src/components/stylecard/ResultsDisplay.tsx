"use client";

import { useState } from "react";
import SocialShareButtons from "./SocialShareButtons";
import { FaDownload, FaMagic } from "react-icons/fa";

interface ResultsDisplayProps {
  originalImage?: string;
  referenceImage?: string;
  resultImage?: string;
  onDownload?: () => void;
  showResults?: boolean;
  // New props for face-swap results
  result?: {
    url: string;
    buffer?: unknown;
  };
  originalImages?: {
    input?: string;
    swap?: string;
  };
}

export default function ResultsDisplay({ 
  originalImage, 
  referenceImage, 
  resultImage,
  onDownload,
  showResults = false,
  result,
  originalImages
}: ResultsDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!result?.url) return;
    
    setIsLoading(true);
    try {
      // Fetch the image data
      const response = await fetch(result.url);
      const blob = await response.blob();
      
      // Create a temporary anchor element to trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'stylecard.jpg'; // Set the file name
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      if (onDownload) {
        await onDownload();
      }
    } catch (error) {
      console.error('Failed to download StyleCard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Use face-swap result if available, otherwise fall back to old props
  const finalResultImage = result?.url || resultImage;
  const finalOriginalImage = originalImages?.input || originalImage;
  const finalReferenceImage = originalImages?.swap || referenceImage;

  if (!showResults && !result) {
    return (
      <div className="text-center py-12">
        <FaMagic className="text-4xl text-gray-300 mb-4 mx-auto" />
        <p className="text-gray-500">Your virtual try-on results will appear here after processing.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your StyleCard Results</h2>
      
      {/* Only show the StyleCard result image, centered */}
      <div className="flex justify-center">
        <div className="text-center">
          <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden mx-auto max-w-2xl">
            {finalResultImage ? (
              <img 
                src={finalResultImage} 
                alt="StyleCard Result" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500">StyleCard Result</span>
            )}
          </div>
          <p className="text-sm text-gray-600">StyleCard</p>
        </div>
      </div>

      {/* Social Share Buttons */}
      {finalResultImage && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Share Your StyleCard</h3>
          <div className="flex justify-center">
            <SocialShareButtons 
              imageUrl={finalResultImage}
              title="Check out my StyleCard!"
              description="I created this amazing StyleCard using virtual try-on technology!"
            />
          </div>
        </div>
      )}
      
      <div className="text-center mt-8">
        <button 
          onClick={handleDownload}
          disabled={isLoading || !finalResultImage}
          className="bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Downloading...
            </>
          ) : (
            <>
              <FaDownload className="mr-3" />
              Download StyleCard
            </>
          )}
        </button>
      </div>
    </div>
  );
}
