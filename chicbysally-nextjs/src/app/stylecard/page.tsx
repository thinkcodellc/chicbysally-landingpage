"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
// IMPORTANT: Avoid importing server-only env reading code into a client component.
// We will call a server action (API) instead.
import { ReferenceImage } from "@/lib/data";
import Image from "next/image";
import ImageUpload from "@/components/stylecard/ImageUpload";
import ReferenceImageGrid from "@/components/stylecard/ReferenceImageGrid";
import TryOnButton from "@/components/stylecard/TryOnButton";
import ResultsDisplay from "@/components/stylecard/ResultsDisplay";
import FaceSwapComponent from "@/components/stylecard/FaceSwapComponent";
import { ErrorBoundary } from "@/components/stylecard/ErrorBoundary";
import Navbar from "@/components/Navbar";
import StyleCardAccessDenied from "@/components/StyleCardAccessDenied";
import { Protect } from "@clerk/nextjs";
import { FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function StyleCardPage() {
  const { user, isLoaded } = useUser();
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  // After upload we keep only the server URL for preview/use
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TEMP: Global error listener to capture NotFoundError stacks in browser
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      // Log full error and stack so we can see originating file/line
      console.error("[GlobalError]", event.error?.name, event.error?.message, event.error?.stack || event.message);
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

  // Load reference images with pagination
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      setError(null);
      try {
        // Call our server endpoints so the client never reads env vars
        const [imagesRes, countRes] = await Promise.all([
          fetch(`/api/imagekit/references?page=${currentPage}&limit=6`, { cache: "no-store" }),
          fetch(`/api/imagekit/references/count`, { cache: "no-store" }),
        ]);

        if (!imagesRes.ok) {
          throw new Error(`Images request failed ${imagesRes.status}`);
        }
        if (!countRes.ok) {
          throw new Error(`Count request failed ${countRes.status}`);
        }

        const images: ReferenceImage[] = await imagesRes.json();
        const count: number = await countRes.json();

        setReferenceImages(images);
        setTotalImages(count);
      } catch (error) {
        console.error("Failed to load reference images:", error);
        setError("Failed to load reference images. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadImages();
  }, [currentPage]);

  // Track window width for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Set initial width
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (isLoaded && !user) {
      redirect("/");
    }
  }, [isLoaded, user]);

  // ImageUpload now returns the compressed File; create an object URL for immediate preview
  const handleImageUpload = (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);
    } catch (e) {
      console.warn("Failed to create preview URL:", e);
    }
  };

  const handleImageSelect = (image: ReferenceImage | null) => {
    console.log('StyleCardPage: handleImageSelect called with image:', image);
    setSelectedImageId(image ? image.id : null);
  };

  useEffect(() => {
    console.log('StyleCardPage: selectedImageId updated to:', selectedImageId);
  }, [selectedImageId]);

  const handleTryOn = async () => {
    if (!uploadedImageUrl || !selectedImageId) return;
    
    setIsProcessing(true);
    setShowResults(true);
    
    // Simulate processing delay
    setTimeout(() => {
      setIsProcessing(false);
    }, 2000);
  };

  const handleDownload = async () => {
    // Simulate download
    console.log("Downloading results...");
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of reference images section
    const element = document.getElementById('reference-images-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your style card...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const selectedImage = referenceImages.find(img => img.id === selectedImageId);
  const totalPages = Math.ceil(totalImages / 6);

  // Determine layout based on screen size
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100 text-gray-800">
      {/* Use the same Navbar as index page */}
      <Navbar />

      {/* Spacer to prevent sticky navbar overlapping content */}
      <div className="h-16 md:h-20"></div>

      <Protect
        feature="stylecard"
        fallback={<StyleCardAccessDenied />}
      >
        <main className="container mx-auto px-4 sm:px-6 pb-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">Virtual Try-On Studio</h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto px-2">
            Upload your photo and select from our curated collection to see how different styles look on you
          </p>
        </div>

        {/* Face Swap Component - Integrated with Error Boundary */}
        <ErrorBoundary>
          <FaceSwapComponent 
            referenceImageUrl={selectedImage?.url}
            referenceImageTitle={selectedImage?.title}
            referenceImages={referenceImages}
            selectedImageId={selectedImageId}
            onImageSelect={handleImageSelect}
            onFaceSwapComplete={(result) => {
              console.log('Face swap completed:', result);
              setShowResults(true);
            }}
            onError={(error) => {
              console.error('Face swap error:', error);
            }}
          />
        </ErrorBoundary>
        
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 sm:py-8 mt-8 sm:mt-12">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="mb-2 text-sm sm:text-base">&copy; 2025 ChicBySally. All rights reserved.</p>
          <div className="flex justify-center space-x-3 sm:space-x-4">
            <a href="https://instagram.com/chicbysally" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 text-lg sm:text-xl">
              <FaInstagram className="inline-block align-middle text-lg" aria-label="Instagram" />
            </a>
            <a href="https://youtube.com/channel/UCaQ08bul4f6VeeXXP1Ev95w" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 text-lg sm:text-xl">
              <FaYoutube className="inline-block align-middle text-lg" aria-label="YouTube" />
            </a>
            <a href="https://www.tiktok.com/@chicbysally" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 text-lg sm:text-xl">
              <FaTiktok className="inline-block align-middle text-lg" aria-label="TikTok" />
            </a>
          </div>
        </div>
      </footer>
    </Protect>
    </div>
  );
}
