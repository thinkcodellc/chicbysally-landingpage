"use client";

import { PricingTable } from '@clerk/nextjs';
import Navbar from "@/components/Navbar";
import { FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-rose-50 text-gray-800">
      {/* Use the same Navbar as other pages */}
      <Navbar />

      {/* Spacer to prevent sticky navbar overlapping content */}
      <div className="h-16 md:h-20"></div>

      <main className="container mx-auto px-4 sm:px-6 pb-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">Choose Your Plan</h1>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl sm:max-w-3xl mx-auto px-2">
            Select the perfect plan to unlock your style potential with ChicBySally
          </p>
        </div>

        {/* Pricing Table Container */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 md:p-8">
            <PricingTable 
              appearance={{
                variables: {
                  colorPrimary: '#ec4899',
                  colorText: '#1e293b',
                  colorBackground: '#ffffff',
                  colorInputBackground: '#f8fafc',
                  colorBorder: '#cbd5e1',
                  colorTextSecondary: '#64748b',
                },
                elements: {
                  card: 'shadow-lg rounded-xl border border-gray-200',
                  planHeader: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl',
                  planButton: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5',
                  featuredPlanButton: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5',
                  modalBackdrop: 'bg-black bg-opacity-50',
                  modalContent: 'rounded-xl',
                  formButtonPrimary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5',
                  formButtonReset: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all duration-300 transform hover:-translate-y-0.5',
                  billingAddressContainer: 'rounded-lg border border-gray-200',
                  formFieldInput: 'rounded-lg border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                  formFieldLabel: 'text-gray-700 font-medium',
                  accordionTriggerButton: 'text-gray-700 hover:text-purple-600',
                  accordionContent: 'text-gray-600',
                  footerActionText: 'text-gray-600',
                  footerActionLink: 'text-purple-600 hover:text-purple-800 font-medium',
                  logoBox: 'text-gray-800',
                  logoImage: 'max-h-8',
                }
              }}
              fallback={
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
                </div>
              }
            />
          </div>
        </div>
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
    </div>
  );
}
