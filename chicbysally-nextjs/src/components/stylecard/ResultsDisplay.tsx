"use client";

import { useState } from "react";
import { FaDownload } from "react-icons/fa";
import { FaceSwapOutput } from "./FaceSwapService";
import Image from "next/image";
import SocialShareButtons from "./SocialShareButtons";

interface ResultsDisplayProps {
  // Legacy props for backward compatibility
  originalImage?: string;
  referenceImage?: string;
  resultImage?: string;
  onDownload?: () => void;
  showResults?: boolean;
  
  // New props for face-swap functionality
  result?: FaceSwapOutput;
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

  // Determine which images to display (new props take precedence)
  const displayImages = {
    original: originalImages?.input || originalImage,
    reference: originalImages?.swap || referenceImage,
    result: result?.url || resultImage
  };

  const hasResults = displayImages.result || showResults;

  const handleDownload = async () => {
    if (!displayImages.result) return;
    
    setIsLoading(true);
    try {
      // Fetch the image data
      const response = await fetch(displayImages.result);
      const blob = await response.blob();
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `stylecard-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      // Call the original onDownload if it exists
      if (onDownload) {
        await onDownload();
      }
    } catch (error) {
      console.error('Error downloading image:', error);
      alert('Failed to download the image. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasResults) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl text-gray-300 mb-4">✨</div>
        <p className="text-gray-500">Your virtual try-on results will appear here after processing.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Focus only on the generated StyleCard result */}
      <div className="text-center">
        <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden max-w-2xl mx-auto">
          {displayImages.result ? (
            <img 
              src={displayImages.result} 
              alt="Your StyleCard" 
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500">StyleCard</span>
          )}
        </div>
        
        <div className="mt-6 space-y-4">
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
                <FaDownload className="mr-3" />
                Download StyleCard
              </>
            )}
          </button>
          
          {/* Individual Social Sharing Buttons */}
          {displayImages.result && (
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={() => displayImages.result && handleShare('facebook', displayImages.result)}
                className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full text-white text-xl hover:bg-blue-700 transition duration-200"
                title="Share on Facebook"
              >
                <FaFacebook />
              </button>
              <button
                onClick={() => displayImages.result && handleShare('twitter', displayImages.result)}
                className="flex items-center justify-center w-12 h-12 bg-sky-500 rounded-full text-white text-xl hover:bg-sky-600 transition duration-200"
                title="Share on Twitter"
              >
                <FaTwitter />
              </button>
              <button
                onClick={() => displayImages.result && handleShare('pinterest', displayImages.result)}
                className="flex items-center justify-center w-12 h-12 bg-red-600 rounded-full text-white text-xl hover:bg-red-700 transition duration-200"
                title="Share on Pinterest"
              >
                <FaPinterest />
              </button>
              <button
                onClick={() => displayImages.result && handleShare('whatsapp', displayImages.result)}
                className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-full text-white text-xl hover:bg-green-600 transition duration-200"
                title="Share on WhatsApp"
              >
                <FaWhatsapp />
              </button>
              <button
                onClick={() => displayImages.result && handleShare('instagram', displayImages.result)}
                className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white text-xl hover:opacity-90 transition duration-200"
                title="Share on Instagram (Copies link)"
              >
                <FaInstagram />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function for sharing (can be moved to a utility file if needed elsewhere)
const handleShare = (platform: string, imageUrl: string) => {
  const title = "Check out my StyleCard!";
  const description = "I created this amazing StyleCard using virtual try-on technology!";
  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  switch (platform) {
    case 'facebook':
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(description)}`, '_blank', 'width=600,height=400');
      break;
    case 'twitter':
      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(description)}`, '_blank', 'width=600,height=400');
      break;
    case 'pinterest':
      window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(currentUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(description)}`, '_blank', 'width=600,height=400');
      break;
    case 'whatsapp':
      window.open(`https://wa.me/?text=${encodeURIComponent(description + " " + imageUrl)}`, '_blank');
      break;
    case 'instagram':
      // Instagram doesn't support direct URL sharing, so copy to clipboard
      navigator.clipboard.writeText(imageUrl).then(() => {
        alert("Image link copied to clipboard! Open Instagram and paste to share your Story or post.");
      }).catch(() => {
        alert("Failed to copy link. Please copy manually: " + imageUrl);
      });
      break;
    default:
      break;
  }
};

// Import social media icons
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp } from "react-icons/fa";
