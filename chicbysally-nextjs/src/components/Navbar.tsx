"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { FaInstagram, FaYoutube, FaTiktok, FaBars, FaTimes } from "react-icons/fa";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPackagesDropdownOpen, setIsPackagesDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navbarColor, setNavbarColor] = useState("navbar-dark");
  
  const { user, isLoaded } = useUser();
  const pathname = usePathname();

  useEffect(() => {
    // Determine initial navbar color based on page
    const isHomePage = pathname === "/";
    setNavbarColor(isHomePage ? "navbar-dark" : "navbar-light");

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (isPackagesDropdownOpen && event.target instanceof Element && !event.target.closest('.dropdown')) {
        setIsPackagesDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [pathname, isPackagesDropdownOpen]);

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsPackagesDropdownOpen(false);
  };

  // Close dropdown when mobile menu is closed
  useEffect(() => {
    if (!isMenuOpen) {
      setIsPackagesDropdownOpen(false);
    }
  }, [isMenuOpen]);

  const handleMobileToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handlePackagesClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPackagesDropdownOpen(!isPackagesDropdownOpen);
  };

  return (
    <>
      <nav 
        className={`navbar navbar-expand-lg ${navbarColor} navbar-sticky ${isScrolled ? 'navbar-scrolled' : ''}`}
        data-navbar="sticky"
      >
        <div className="container">
          {/* Left Section - Logo and Main Menu */}
          <div className="navbar-left">
            <button 
              className="navbar-toggler d-lg-none" 
              type="button"
              onClick={handleMobileToggle}
              aria-label="Toggle navigation"
            >
              {isMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
            </button>
            <Link className="navbar-brand" href="/">
              <Image 
                src="/images/ChicBySally_Transparent_Logo.png" 
                alt="ChicBySally Logo" 
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
            
            {/* Desktop Menu */}
            <ul className="nav nav-navbar d-none d-lg-flex">
              <li className="nav-item">
                <Link href="/" className="nav-link" onClick={closeAllMenus}>Home</Link>
              </li>
              <li className="nav-item">
                <Link href="/#profile" className="nav-link" onClick={closeAllMenus}>About</Link>
              </li>
              <li className="nav-item">
                <Link href="/#mission" className="nav-link" onClick={closeAllMenus}>Mission</Link>
              </li>
              <li className="nav-item dropdown">
                <a 
                  className="nav-link"
                  href="#"
                  onClick={handlePackagesClick}
                >
                  Packages <span className="arrow"></span>
                </a>
                <nav className={`nav ${isPackagesDropdownOpen ? 'show' : ''}`}>
                  <Link 
                    href="/#pricing" 
                    className="nav-link"
                    onClick={closeAllMenus}
                  >
                    For Brands
                  </Link>
                  <Link 
                    href="/pricing" 
                    className="nav-link"
                    onClick={closeAllMenus}
                  >
                    For Creators
                  </Link>
                </nav>
              </li>
              {user && (
                <li className="nav-item">
                  <Link href="/stylecard" className="nav-link" onClick={closeAllMenus}>StyleCard</Link>
                </li>
              )}
              <li className="nav-item">
                <Link href="/#contact-form" className="nav-link" onClick={closeAllMenus}>Contact</Link>
              </li>
            </ul>
          </div>

          {/* Right Section - User Auth and Social Icons */}
          <div className="navbar-right d-none d-lg-flex align-items-center">
            {/* User Authentication */}
            <div className="d-flex align-items-center mr-4">
              {!isLoaded ? (
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              ) : user ? (
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8 rounded-full",
                      userButtonOuterBox: "flex items-center"
                    }
                  }}
                />
              ) : (
                <SignInButton mode="modal">
                  <button className="btn btn-sm btn-round btn-success">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
            
            {/* Social Icons */}
            <div className="d-flex align-items-center">
              <a href="https://instagram.com/chicbysally" target="_blank" rel="noopener noreferrer" className="nav-link mx-1">
                <FaInstagram className="text-xl" aria-label="Instagram" />
              </a>
              <a href="https://youtube.com/channel/UCaQ08bul4f6VeeXXP1Ev95w" target="_blank" rel="noopener noreferrer" className="nav-link mx-1">
                <FaYoutube className="text-xl" aria-label="YouTube" />
              </a>
              <a href="https://www.tiktok.com/@chicbysally" target="_blank" rel="noopener noreferrer" className="nav-link mx-1">
                <FaTiktok className="text-xl" aria-label="TikTok" />
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`navbar-mobile ${isMenuOpen ? 'show' : ''}`}>
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <Link className="navbar-brand" href="/" onClick={closeAllMenus}>
              <Image 
                src="/images/ChicBySally_Transparent_Logo.png" 
                alt="ChicBySally Logo" 
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </Link>
            <button 
              className="navbar-toggler" 
              type="button"
              onClick={handleMobileToggle}
              aria-label="Close navigation"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          
          <ul className="nav nav-navbar flex-column">
            <li className="nav-item">
              <Link href="/" className="nav-link" onClick={closeAllMenus}>Home</Link>
            </li>
            <li className="nav-item">
              <Link href="/#profile" className="nav-link" onClick={closeAllMenus}>About</Link>
            </li>
            <li className="nav-item">
              <Link href="/#mission" className="nav-link" onClick={closeAllMenus}>Mission</Link>
            </li>
            <li className="nav-item dropdown">
              <a 
                className="nav-link"
                href="#"
                onClick={handlePackagesClick}
              >
                Packages <span className="arrow"></span>
              </a>
              <nav className={`nav ${isPackagesDropdownOpen ? 'show' : ''}`}>
                <Link 
                  href="/#pricing" 
                  className="nav-link"
                  onClick={closeAllMenus}
                >
                  For Brands
                </Link>
                <Link 
                  href="/pricing" 
                  className="nav-link"
                  onClick={closeAllMenus}
                >
                  For Creators
                </Link>
              </nav>
            </li>
            {user && (
              <li className="nav-item">
                <Link href="/stylecard" className="nav-link" onClick={closeAllMenus}>StyleCard</Link>
              </li>
            )}
            <li className="nav-item">
              <Link href="/#contact-form" className="nav-link" onClick={closeAllMenus}>Contact</Link>
            </li>
          </ul>
          
          {/* Mobile User Auth */}
          <div className="mt-4 pt-4 border-top">
            <div className="d-flex align-items-center justify-content-between mb-4">
              {!isLoaded ? (
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
              ) : user ? (
                <div className="d-flex align-items-center">
                  <UserButton 
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-8 h-8 rounded-full",
                        userButtonOuterBox: "flex items-center"
                      }
                    }}
                  />
                  <span className="ml-2">Welcome back!</span>
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="btn btn-sm btn-round btn-success">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
            
            {/* Mobile Social Icons */}
            <div className="d-flex align-items-center justify-content-center">
              <a href="https://instagram.com/chicbysally" target="_blank" rel="noopener noreferrer" className="nav-link mx-2">
                <FaInstagram className="text-xl" aria-label="Instagram" />
              </a>
              <a href="https://youtube.com/channel/UCaQ08bul4f6VeeXXP1Ev95w" target="_blank" rel="noopener noreferrer" className="nav-link mx-2">
                <FaYoutube className="text-xl" aria-label="YouTube" />
              </a>
              <a href="https://www.tiktok.com/@chicbysally" target="_blank" rel="noopener noreferrer" className="nav-link mx-2">
                <FaTiktok className="text-xl" aria-label="TikTok" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu backdrop */}
      {isMenuOpen && (
        <div 
          className="backdrop backdrop-navbar" 
          onClick={closeAllMenus}
        />
      )}
    </>
  );
}
