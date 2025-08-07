"use client";

import { useState } from "react";

interface ResultsDisplayProps {
  originalImage?: string;
  referenceImage?: string;
  resultImage?: string;
  onDownload?: () => void;
  showResults?: boolean;
}

export default function ResultsDisplay({ 
  originalImage, 
  referenceImage, 
  resultImage,
  onDownload,
  showResults = false
}: ResultsDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (onDownload) {
      setIsLoading(true);
      try {
        await onDownload();
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!showResults) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-sparkles text-4xl text-gray-300 mb-4"></i>
        <p className="text-gray-500">Your virtual try-on results will appear here after processing.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Virtual Try-On Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            {originalImage ? (
              <img 
                src={originalImage} 
                alt="Original" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500">Original</span>
            )}
          </div>
          <p className="text-sm text-gray-600">Your Photo</p>
        </div>
        
        <div className="text-center">
          <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            {referenceImage ? (
              <img 
                src={referenceImage} 
                alt="Reference" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500">Reference</span>
            )}
          </div>
          <p className="text-sm text-gray-600">Selected Style</p>
        </div>
        
        <div className="text-center">
          <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
            {resultImage ? (
              <img 
                src={resultImage} 
                alt="Result" 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500">Result</span>
            )}
          </div>
          <p className="text-sm text-gray-600">Virtual Try-On</p>
        </div>
      </div>
      
      <div className="text-center mt-8">
        <button 
          onClick={handleDownload}
          disabled={isLoading}
          className="bg-pink-500 text-white px-8 py-3 rounded-lg hover:bg-pink-600 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Downloading...
            </>
          ) : (
            <>
              <i className="fas fa-download mr-3"></i>
              Download Results
            </>
          )}
        </button>
      </div>
    </div>
  );
}
