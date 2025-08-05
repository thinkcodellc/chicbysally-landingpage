"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getReferenceImages, getReferenceImagesCount } from "@/lib/data";
import { ReferenceImage } from "@/lib/data";
import ImageUpload from "@/components/stylecard/ImageUpload";
import ReferenceImageGrid from "@/components/stylecard/ReferenceImageGrid";
import TryOnButton from "@/components/stylecard/TryOnButton";
import ResultsDisplay from "@/components/stylecard/ResultsDisplay";

export default function StyleCardPage() {
  const { data: session, status } = useSession();
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [windowWidth, setWindowWidth] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load reference images with pagination
  useEffect(() => {
    const loadImages = async () => {
      setLoading(true);
      setError(null);
      try {
        const images = await getReferenceImages(currentPage, 5);
        setReferenceImages(images);
        
        // Load total count for pagination
        const count = await getReferenceImagesCount();
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
    if (status === "unauthenticated") {
      redirect("/");
    }
  }, [status]);

  const handleImageUpload = (file: File) => {
    setUploadedImage(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImageUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSelect = (image: ReferenceImage) => {
    setSelectedImageId(image.id);
  };

  const handleTryOn = async () => {
    if (!uploadedImage || !selectedImageId) return;
    
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-rose-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your style card...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const selectedImage = referenceImages.find(img => img.id === selectedImageId);
  const totalPages = Math.ceil(totalImages / 5);

  // Determine layout based on screen size
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  return (
    <div className="min-h-screen bg-rose-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-pink-600">StyleCard</h1>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:block text-sm text-gray-600 truncate max-w-[120px]">
              Welcome, {session.user?.name || session.user?.email}
            </div>
            <Link 
              href="/" 
              className="text-xs sm:text-sm text-pink-600 hover:text-pink-800 font-medium whitespace-nowrap"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">Virtual Try-On Studio</h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto px-2">
            Upload your photo and select from our curated collection to see how different styles look on you
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
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Your Photo</h2>
              
              {/* Image Upload Component */}
              <div className="mb-4 sm:mb-6">
                <ImageUpload 
                  onImageUpload={handleImageUpload}
                  previewUrl={uploadedImageUrl || undefined}
                />
              </div>

              {/* Selected Reference Preview - Mobile shows below upload, desktop shows above button */}
              {selectedImage && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-3">Selected Reference Style</h3>
                  <div className="flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <img 
                      src={selectedImage.url} 
                      alt={selectedImage.title}
                      className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                    />
                    <div>
                      <div className="font-medium text-gray-800 text-sm sm:text-base">{selectedImage.title}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Try On Button */}
              <TryOnButton 
                onClick={handleTryOn}
                disabled={!uploadedImage || !selectedImageId}
                loading={isProcessing}
                selectedImageId={selectedImageId}
              />
            </div>
          </div>

          {/* Right Column - Reference Images */}
          <div className={`
            ${isMobile ? 'w-full' : ''}
            ${isTablet ? 'md:w-full' : ''}
            ${isDesktop ? 'lg:w-3/5' : ''}
          `}>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8" id="reference-images-section">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Curated Reference Images</h2>
              
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
                <ReferenceImageGrid
                  images={referenceImages}
                  selectedImageId={selectedImageId}
                  onImageSelect={handleImageSelect}
                />
              )}
              
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
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="mt-8 sm:mt-12 bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
          <ResultsDisplay
            originalImage={uploadedImageUrl || undefined}
            referenceImage={selectedImage?.url}
            resultImage={showResults ? "/images/result-placeholder.jpg" : undefined}
            onDownload={handleDownload}
            showResults={showResults}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 sm:py-8 mt-8 sm:mt-12">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <p className="mb-2 text-sm sm:text-base">&copy; 2025 ChicBySally. All rights reserved.</p>
          <div className="flex justify-center space-x-3 sm:space-x-4">
            <a href="https://instagram.com/chicbysally" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 text-lg sm:text-xl">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="https://youtube.com/channel/UCaQ08bul4f6VeeXXP1Ev95w" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 text-lg sm:text-xl">
              <i className="fab fa-youtube"></i>
            </a>
            <a href="https://www.tiktok.com/@chicbysally" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 text-lg sm:text-xl">
              <i className="fab fa-tiktok"></i>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
