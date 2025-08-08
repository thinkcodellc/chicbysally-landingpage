"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser, SignInButton, SignOutButton, UserButton } from "@clerk/nextjs";
import { FaInstagram, FaYoutube, FaTiktok } from "react-icons/fa";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <nav 
      className="navbar navbar-expand-lg text-white shadow-md bg-[linear-gradient(90deg,_#737872,_#717771)] bg-opacity-75"
      data-navbar="static"
      style={{ position: "sticky", top: 0, zIndex: 50, backdropFilter: "saturate(120%) blur(2px)" }}
    >
      <div className="container text-white">
        <div className="navbar-left">
          <button 
            className="navbar-toggler" 
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          {/* ChicBySally Logo */}
          <div className="navbar-brand">
            <Image 
              src="/images/ChicBySally_Transparent_Logo.png" 
              alt="ChicBySally Logo" 
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
              priority
            />
          </div>
        </div>

        <div className={`navbar-mobile ${isMenuOpen ? 'show' : ''}`}>
          <span className="navbar-divider d-mobile-none"></span>
          <ul className="nav nav-navbar text-white">
            {/* Home should be first and always navigate to index */}
            <li className="nav-item">
              <Link href="/" className="nav-link text-white hover:text-pink-400" onClick={() => setIsMenuOpen(false)}>Home</Link>
            </li>
            {/* These links should always navigate to sections on the home page */}
            <li className="nav-item">
              <Link href="/#profile" className="nav-link text-white hover:text-pink-400" onClick={() => setIsMenuOpen(false)}>About</Link>
            </li>
            <li className="nav-item">
              <Link href="/#mission" className="nav-link text-white hover:text-pink-400" onClick={() => setIsMenuOpen(false)}>Mission</Link>
            </li>
            <li className="nav-item">
              <Link href="/#pricing" className="nav-link text-white hover:text-pink-400" onClick={() => setIsMenuOpen(false)}>Packages</Link>
            </li>
            {/* Show StyleCard menu item only when user is logged in */}
            {user && (
              <li className="nav-item">
                <Link href="/stylecard" className="nav-link text-white hover:text-pink-400" onClick={() => setIsMenuOpen(false)}>StyleCard</Link>
              </li>
            )}
            <li className="nav-item">
              <Link href="/#contact-form" className="nav-link text-white hover:text-pink-400" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            </li>
          </ul>
        </div>
        
        <div className="navbar-brand text-white">
{!isLoaded ? (
  <div className="flex items-center">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mr-2"></div>
    <span className="text-white">Loading...</span>
  </div>
) : user ? (
  <div className="flex items-center space-x-4">
    <UserButton 
      appearance={{
        elements: {
          userButtonAvatarBox: "w-8 h-8 rounded-full",
          userButtonOuterBox: "flex items-center"
        }
      }}
    />
  </div>
) : (
            <div className="flex items-center space-x-2">
              <SignInButton mode="modal">
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5">
                  Sign In
                </button>
              </SignInButton>
              {/* Temporarily hidden per request */}
              {/*
              <button
                onClick={() => handleLogin("facebook")}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition duration-300 flex items-center space-x-1"
              >
                <i className="fab fa-facebook-f mr-1"></i>
                <span className="hidden md:inline">Facebook</span>
              </button>
              <button
                onClick={() => handleLogin("twitter")}
                className="bg-black text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition duration-300 flex items-center space-x-1"
              >
                <i className="fab fa-twitter mr-1"></i>
                <span className="hidden md:inline">X</span>
              </button>
              */}
            </div>
          )}
          
          <a href="https://instagram.com/chicbysally" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400 mx-2 ml-4">
            <FaInstagram className="inline-block align-middle text-xl" aria-label="Instagram" />
          </a>
          <a href="https://youtube.com/channel/UCaQ08bul4f6VeeXXP1Ev95w" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400 mx-2">
            <FaYoutube className="inline-block align-middle text-xl" aria-label="YouTube" />
          </a>
          <a href="https://www.tiktok.com/@chicbysally" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-400 mx-2">
            <FaTiktok className="inline-block align-middle text-xl" aria-label="TikTok" />
          </a>
        </div>       
      </div>
    </nav>
  );
}
