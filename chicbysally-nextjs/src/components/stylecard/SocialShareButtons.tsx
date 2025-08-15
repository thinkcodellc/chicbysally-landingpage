"use client";

import { useState } from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaPinterest, FaWhatsapp, FaLink } from "react-icons/fa";

interface SocialShareButtonsProps {
  imageUrl: string;
  title?: string;
  description?: string;
  // New prop to control which buttons are displayed
  platforms?: ('facebook' | 'twitter' | 'pinterest' | 'whatsapp' | 'instagram' | 'link')[];
  // New prop for custom button styling
  buttonClassName?: string;
  // New prop for icon styling
  iconClassName?: string;
}

export default function SocialShareButtons({ 
  imageUrl, 
  title = "Check out my StyleCard!", 
  description = "I created this amazing StyleCard using virtual try-on technology!",
  platforms = ['facebook', 'twitter', 'pinterest', 'whatsapp', 'instagram', 'link'], // Default to all
  buttonClassName = "flex items-center justify-center w-12 h-12 rounded-full text-white text-xl transition duration-200",
  iconClassName = ""
}: SocialShareButtonsProps) {
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  const shareUrls = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(imageUrl)}&quote=${encodeURIComponent(description)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(imageUrl)}&text=${encodeURIComponent(description)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : imageUrl)}&media=${encodeURIComponent(imageUrl)}&description=${encodeURIComponent(description)}`,
    whatsapp: `https://wa.me/?text=${encodeURIComponent(description + " " + imageUrl)}`,
    instagram: `https://www.instagram.com/`, // Instagram doesn't support direct URL sharing, so we'll open the app
  };

  const handleShare = (platform: keyof typeof shareUrls | 'link') => {
    if (platform === 'instagram') {
      // For Instagram, we copy to clipboard and instruct user to share manually
      copyToClipboard(imageUrl, "Image link copied to clipboard! Open Instagram and paste to share your Story or post.");
    } else if (platform === 'link') {
      copyToClipboard(imageUrl, "Image link copied to clipboard!");
    } else {
      // For other platforms, open the share URL
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessage(message);
      setTimeout(() => setCopiedMessage(null), 3000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedMessage(message);
      setTimeout(() => setCopiedMessage(null), 3000);
    });
  };

  return (
    <div className="relative font-sans">
      <div className="flex justify-center space-x-4">
        {platforms.includes('facebook') && (
          <button
            onClick={() => handleShare('facebook')}
            className={`${buttonClassName} bg-blue-600 hover:bg-blue-700`}
            title="Share on Facebook"
          >
            <FaFacebook className={iconClassName} />
          </button>
        )}
        {platforms.includes('twitter') && (
          <button
            onClick={() => handleShare('twitter')}
            className={`${buttonClassName} bg-sky-500 hover:bg-sky-600`}
            title="Share on Twitter"
          >
            <FaTwitter className={iconClassName} />
          </button>
        )}
        {platforms.includes('pinterest') && (
          <button
            onClick={() => handleShare('pinterest')}
            className={`${buttonClassName} bg-red-600 hover:bg-red-700`}
            title="Share on Pinterest"
          >
            <FaPinterest className={iconClassName} />
          </button>
        )}
        {platforms.includes('whatsapp') && (
          <button
            onClick={() => handleShare('whatsapp')}
            className={`${buttonClassName} bg-green-500 hover:bg-green-600`}
            title="Share on WhatsApp"
          >
            <FaWhatsapp className={iconClassName} />
          </button>
        )}
        {platforms.includes('instagram') && (
          <button
            onClick={() => handleShare('instagram')}
            className={`${buttonClassName} bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90`}
            title="Share on Instagram (Copies link)"
          >
            <FaInstagram className={iconClassName} />
          </button>
        )}
        {platforms.includes('link') && (
          <button
            onClick={() => handleShare('link')}
            className={`${buttonClassName} bg-gray-600 hover:bg-gray-700`}
            title="Copy Image Link"
          >
            <FaLink className={iconClassName} />
          </button>
        )}
      </div>

      {/* Copied Message Toast */}
      {copiedMessage && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-out">
          <p className="text-sm font-medium">{copiedMessage}</p>
        </div>
      )}
    </div>
  );
}
