"use client";

import { useState } from "react";

interface TryOnButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  selectedImageId: string | null;
}

export default function TryOnButton({ 
  onClick, 
  disabled = false, 
  loading = false,
  selectedImageId 
}: TryOnButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!disabled && !loading) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform
        ${disabled || loading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : `bg-gradient-to-r from-pink-500 to-purple-600 text-white
             hover:from-pink-600 hover:to-purple-700
             ${isHovered ? 'scale-105 shadow-lg' : 'shadow-md'}`
        }
        ${loading ? 'animate-pulse' : ''}
      `}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
          Processing...
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <i className="fas fa-wand-magic-sparkles mr-3"></i>
          {selectedImageId ? 'Try On Selected Style' : 'Select a Style First'}
        </div>
      )}
    </button>
  );
}
