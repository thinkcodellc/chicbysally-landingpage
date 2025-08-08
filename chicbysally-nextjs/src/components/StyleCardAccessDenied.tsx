"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { FaLock, FaCrown, FaArrowRight } from "react-icons/fa";

export default function StyleCardAccessDenied() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-200 to-gray-100 text-gray-800">
      {/* Simple header for consistency */}
      <div className="h-16 md:h-20"></div>

      <main className="container mx-auto px-4 sm:px-6 pb-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 md:p-10 text-center">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-pink-100 text-pink-500 mb-4">
                <FaLock className="text-2xl" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                StyleCard Access Required
              </h1>
              <p className="text-gray-600">
                Unlock the power of virtual try-ons with our premium StyleCard feature
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center justify-center">
                <FaCrown className="text-amber-500 mr-2" />
                Premium Feature
              </h2>
              <p className="text-gray-700 mb-4">
                The StyleCard virtual try-on experience is available exclusively to subscribers 
                with the StyleCard feature in their plan.
              </p>
              <div className="text-left space-y-2 text-sm text-gray-600">
                <div className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span>Upload your photo and try on curated styles</span>
                </div>
                <div className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span>Get AI-powered style recommendations</span>
                </div>
                <div className="flex items-start">
                  <span className="text-pink-500 mr-2">•</span>
                  <span>Save and share your virtual looks</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/pricing" 
                className="inline-flex items-center justify-center bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg"
              >
                View Pricing Plans
                <FaArrowRight className="ml-2 text-sm" />
              </Link>
              
              {user ? (
                <button 
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  Refresh Subscription Status
                </button>
              ) : (
                <Link 
                  href="/sign-in" 
                  className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  Sign In to Your Account
                </Link>
              )}
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Already subscribed? Make sure you&#39;re signed in with the correct account.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
