"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import StyleCardAccessDenied from "@/components/StyleCardAccessDenied";
import { Protect } from "@clerk/nextjs";
import { ReferenceImage } from "@/lib/data";
import SimpleImageUpload from "@/components/stylecard/SimpleImageUpload";
import ReferenceImageGrid from "@/components/stylecard/ReferenceImageGrid";
import ResultsDisplay from "@/components/stylecard/ResultsDisplay";
import { FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";
import { FaceSwapService, FaceSwapInput, FaceSwapOutput } from "@/components/stylecard/FaceSwapService";

export default function StyleCardPage() {
  const { user, isLoaded } = useUser();
  const [windowWidth, setWindowWidth] = useState(0);

  // TEMP: Global error listener to capture NotFoundError stacks in browser
  useEffect(() => {
    const handler = (event: ErrorEvent) => {
      // Log full error and stack so we can see originating file/line
      console.error("[GlobalError]", event.error?.name, event.error?.message, event.error?.stack || event.message);
    };
    window.addEventListener("error", handler);
    return () => window.removeEventListener("error", handler);
  }, []);

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
        <StyleCardProtectedContent isMobile={isMobile} isTablet={isTablet} isDesktop={isDesktop} />
      </Protect>
    </div>
  );
}

function StyleCardProtectedContent({ isMobile, isTablet, isDesktop }: { isMobile: boolean; isTablet: boolean; isDesktop: boolean; }) {
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [uploadedImageFile, setUploadedImageFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<FaceSwapOutput | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Load reference images with pagination
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

  // Load images when currentPage changes
  useEffect(() => {
    loadImages();
  }, [currentPage]);

  const handleImageSelect = (image: ReferenceImage | null) => {
    setSelectedImageId(image?.id || null);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll to top of reference images section
    const element = document.getElementById('reference-images-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleImageUpload = (file: File) => {
    try {
      const url = URL.createObjectURL(file);
      setUploadedImageUrl(url);
      setUploadedImageFile(file);
      // Clear previous results when new image is uploaded
      setResult(null);
      setShowResults(false);
    } catch (e) {
      console.warn("Failed to create preview URL:", e);
    }
  };

  const handleResetImage = () => {
    setUploadedImageUrl(null);
    setUploadedImageFile(null);
    setResult(null);
    setShowResults(false);
  };

  const handleResetReference = () => {
    setSelectedImageId(null);
    setResult(null);
    setShowResults(false);
  };

  const handleResetAll = () => {
    handleResetImage();
    handleResetReference();
  };

  const handleFaceSwap = async (file: File) => {
    if (!selectedImageId) {
      setError("Please select a reference style first.");
      return;
    }

    const selectedImage = referenceImages.find(img => img.id === selectedImageId);
    if (!selectedImage) {
      setError("Selected reference image not found.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Convert file to data URL for API
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const faceSwapInput: FaceSwapInput = {
        inputImage: selectedImage.url, // Reference image (target)
        swapImage: dataUrl             // User uploaded photo (swap)
      };

      // Call face-swap API
      const faceSwapResult = await FaceSwapService.performFaceSwap(faceSwapInput);
      
      setResult(faceSwapResult);
      setShowResults(true);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Face swap error:', err);
      setError(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (result?.url) {
      const link = document.createElement('a');
      link.href = result.url;
      link.download = 'stylecard.jpg';
      link.click();
    }
  };

  const totalPages = Math.ceil(totalImages / 6);

  return (
    <main className="container mx-auto px-4 sm:px-6 pb-12">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">Virtual Try-On Studio</h1>
        <p className="text-base sm:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto px-2">
          Follow these simple steps to create your personalized StyleCard
        </p>
      </div>

      {/* Main Layout - Responsive Split Screen */}
      <div className={`
        ${isMobile ? 'flex flex-col gap-6' : ''}
        ${isTablet ? 'flex flex-col md:flex-row gap-6' : ''}
        ${isDesktop ? 'flex flex-col lg:flex-row gap-8' : ''}
      `}>
        {/* Left Column - Upload Section */}
        <div className={`
          ${isMobile ? 'w-full' : ''}
          ${isTablet ? 'md:w-full' : ''}
          ${isDesktop ? 'lg:w-2/5' : ''}
        `}>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm mr-3">1</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Choose Your Photo</h2>
            </div>
            
            {/* Simple Image Upload Component */}
            <SimpleImageUpload
              onImageUpload={handleImageUpload}
              onReset={handleResetImage}
              previewUrl={uploadedImageUrl || undefined}
              isProcessing={isProcessing}
            />
            
            {/* Reset Buttons - Centered */}
            <div className="flex justify-center gap-2 mt-4">
              <button
                onClick={handleResetImage}
                className="px-4 py-2 rounded-lg text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Reset Photo
              </button>
              <button
                onClick={handleResetAll}
                className="px-4 py-2 rounded-lg text-sm bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Reference Images */}
        <div className={`
          ${isMobile ? 'w-full' : ''}
          ${isTablet ? 'md:w-full' : ''}
          ${isDesktop ? 'lg:w-3/5' : ''}
        `}>
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8" id="reference-images-section">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm mr-3">2</div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Choose a Curated Style</h2>
            </div>
            
            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              </div>
            )}
            
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="text-red-800">{error}</div>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            )}
            
            {/* Reference Image Grid Component */}
            {!loading && !error && (
              <div className="mt-4 bg-white rounded-xl shadow-lg p-4 overflow-x-auto">
                <ReferenceImageGrid
                  images={referenceImages}
                  selectedImageId={selectedImageId}
                  onImageSelect={handleImageSelect}
                />
              </div>
            )}
            {/* Social icons row to mimic index footer styling */}
            <div className="mt-6 flex justify-center space-x-4 text-gray-600">
              <a href="https://instagram.com/chicbysally" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">
                <FaInstagram className="inline-block align-middle text-lg" aria-label="Instagram" />
              </a>
              <a href="https://youtube.com/channel/UCaQ08bul4f6VeeXXP1Ev95w" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">
                <FaYoutube className="inline-block align-middle text-lg" aria-label="YouTube" />
              </a>
              <a href="https://www.tiktok.com/@chicbysally" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500">
                <FaTiktok className="inline-block align-middle text-lg" aria-label="TikTok" />
              </a>
            </div>
            
            {/* Pagination */}
            {!loading && !error && totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex items-center px-4 text-gray-600">
                    Page {currentPage} of {totalPages}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
            
            {/* Step 3: Create StyleCard Button */}
            <div className="flex justify-center mt-8">
              <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-sm mr-3 mb-2">3</div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Create StyleCard</h3>
            </div>
            <div className="flex justify-center">
              <button
                onClick={() => uploadedImageFile && handleFaceSwap(uploadedImageFile)}
                disabled={!uploadedImageFile || !selectedImageId || isProcessing}
                className={`px-8 py-3 rounded-lg font-medium text-lg ${
                  uploadedImageFile && selectedImageId && !isProcessing
                    ? 'bg-pink-500 text-white hover:bg-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Generating StyleCard...
                  </div>
                ) : 'Create StyleCard'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="mt-8 sm:mt-12 bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
        <ResultsDisplay
          result={result || undefined}
          originalImages={{
            input: uploadedImageUrl || undefined,
            swap: referenceImages.find(img => img.id === selectedImageId)?.url
          }}
          onDownload={handleDownload}
          showResults={showResults}
        />
      </div>
    </main>
  );
}
