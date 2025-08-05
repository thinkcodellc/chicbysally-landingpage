"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogin = (provider: string) => {
    signIn(provider, { callbackUrl: "/stylecard" });
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <nav 
      className={`navbar navbar-expand-lg navbar-light ${isSticky ? 'navbar-sticky' : ''}`}
      data-navbar="sticky"
    >
      <div className="container">
        <div className="navbar-left">
          <button 
            className="navbar-toggler" 
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <Link href="/" className="navbar-brand">
            <Image 
              src="/images/chic_by_sally_logo.png" 
              alt="ChicBySally Logo" 
              width={160}
              height={40}
              className="logo-dark"
              priority
            />
          </Link>
        </div>

        <div className={`navbar-mobile ${isMenuOpen ? 'show' : ''}`}>
          <span className="navbar-divider d-mobile-none"></span>
          <ul className="nav nav-navbar">
            <li className="nav-item">
              <Link href="#profile" className="nav-link" onClick={() => setIsMenuOpen(false)}>About</Link>
            </li>
            <li className="nav-item">
              <Link href="#mission" className="nav-link" onClick={() => setIsMenuOpen(false)}>Mission</Link>
            </li>
            <li className="nav-item">
              <Link href="#pricing" className="nav-link" onClick={() => setIsMenuOpen(false)}>Packages</Link>
            </li>
            <li className="nav-item">
              <Link href="#contact-form" className="nav-link" onClick={() => setIsMenuOpen(false)}>Contact</Link>
            </li>
          </ul>
        </div>
        
        <div className="navbar-brand">
          {status === "loading" ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500 mr-2"></div>
              <span className="text-white">Loading...</span>
            </div>
          ) : session ? (
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-white">
                <span className="text-sm">Welcome, {session.user?.name || session.user?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleLogin("google")}
                className="bg-white text-gray-800 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition duration-300 flex items-center space-x-1"
              >
                <i className="fab fa-google mr-1"></i>
                <span className="hidden md:inline">Google</span>
              </button>
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
            </div>
          )}
          
          <a href="https://instagram.com/chicbysally" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-500 mx-2 ml-4">
            <i className="fab fa-instagram text-lg"></i>
          </a>
          <a href="https://youtube.com/channel/UCaQ08bul4f6VeeXXP1Ev95w" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-500 mx-2">
            <i className="fab fa-youtube text-lg"></i>
          </a>
          <a href="https://www.tiktok.com/@chicbysally" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-500 mx-2">
            <i className="fab fa-tiktok text-lg"></i>
          </a>
        </div>       
      </div>
    </nav>
  );
}
