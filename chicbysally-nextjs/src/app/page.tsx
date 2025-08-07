"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import TypingEffect from "@/components/TypingEffect";
import { FaInstagram, FaYoutube, FaTiktok, FaCheckCircle } from "react-icons/fa";

export default function HomePage() {
  return (
    <div className="bg-rose-50 text-gray-800 font-sans">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section id="hero" className="relative h-screen flex items-center justify-center text-center overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <Image
              src="/images/parallax_bg_chicbysally.png"
              alt="Stylish flat lay of fashion accessories representing ChicBySally&#39;s content creation services"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="relative z-10 text-white">
            <h1 className="text-4xl md:text-6xl font-bold">
              Welcome to <span className="fw-600 pl-1"><TypingEffect texts={["ChicBySally"]} elementId="hero-typing" loop={false} /></span>
            </h1>
            <p className="mt-4 text-lg md:text-xl">Discover your <span className="text-primary"><TypingEffect texts={["personal", "beautiful", "party", "awesome-est"]} elementId="style-typing" loop={true} /></span> style!</p>
            <Link 
              href="https://shopmy.us/savvyfashionista" 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-8 inline-block bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white hover:text-black transition-all duration-300"
            >
              Explore My Curations
            </Link>
          </div>
        </section>

        {/* Profile/Bio Section */}
        <section id="profile" className="py-16 bg-white">
          <div className="container mx-auto px-6 text-center">
            <Image
              src="https://static.shopmy.us/uploads/img-user-deres-85371-1731083331375"
              alt="ChicBySally Profile"
              width={128}
              height={128}
              className="w-32 h-32 rounded-full mx-auto mb-8 shadow-lg object-cover"
            />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">About ChicBySally</h2>
            <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto">
              Hello, lovely! I&#39;m a fashion curator with a passion for all things chic, trendy, and luxe. I&#39;m here to bring you the latest in designer styles and refined elegance – think elevated looks that blend timeless sophistication with today&#39;s hottest trends. Fashion isn&#39;t just what I wear; it&#39;s how I express my love for art, style, and creativity. Join me as we explore beautiful, one-of-a-kind pieces that make every day a little more fabulous! 💫
            </p>
          </div>
        </section>

        {/* Mission & Services Section */}
        <section id="mission" className="py-16 bg-gray-50">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed max-w-2xl mx-auto mb-12">
              At ChicBySally, we believe fashion is a narrative waiting to be told. We specialize in crafting exceptionally compelling visual stories that bring curated fashion and accessory collections to life, sparking desire and inspiring personal style.
            </p>

            <h3 className="text-2xl font-bold text-gray-800 mt-12 mb-4">Our Services</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h4 className="text-xl font-semibold text-pink-600 mb-2">User-Generated Content (UGC) Creation</h4>
                <p className="text-gray-700">Elevate your brand with authentic, eye-catching content that speaks directly to your audience. We specialize in producing high-quality, stylish UGC that embodies your brand&#39;s essence and drives engagement.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <h4 className="text-xl font-semibold text-pink-600 mb-2">Brand Collaborations</h4>
                <p className="text-gray-700">Let&#39;s create magic together. We partner with like-minded fashion and accessory brands to develop unique, impactful collaborations. From concept to execution, we bring a sophisticated flair to every project.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Our Packages</h2>
              <p className="text-gray-600 mt-2">Choose the perfect plan to elevate your brand&#39;s presence.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Package 1: Essential Elegance */}
              <div className="bg-rose-50/50 border border-gray-200 rounded-xl shadow-lg p-8 flex flex-col hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-pink-600 mb-2">Essential Elegance</h3>
                <p className="text-gray-500 italic mb-6">Perfect for a Quick Impact</p>
                <ul className="space-y-4 text-gray-700 mb-8 flex-grow">
<li className="flex items-start"><FaCheckCircle className="text-pink-500 mr-3 mt-1 h-5 w-5 shrink-0" aria-hidden="true" /><span>2 high-quality images & 1 hi-res 5s video (9:16)</span></li>
<li className="flex items-start"><FaCheckCircle className="text-pink-500 mr-3 mt-1 h-5 w-5 shrink-0" aria-hidden="true" /><span>1 engaging post & 1 reel</span></li>
<li className="flex items-start"><FaCheckCircle className="text-pink-500 mr-3 mt-1 h-5 w-5 shrink-0" aria-hidden="true" /><span><b>Platforms:</b> Choose 1 (IG, TikTok, or YouTube)</span></li>
<li className="flex items-start"><FaCheckCircle className="text-pink-500 mr-3 mt-1 h-5 w-5 shrink-0" aria-hidden="true" /><span>Basic engagement tracking</span></li>
                </ul>
                <p className="text-4xl font-bold text-gray-800 text-center my-4">$159</p>
                <Link href="#contact-form" className="w-full text-center bg-gray-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-900 transition duration-300 mt-auto">
                  Select
                </Link>
              </div>

              {/* Package 2: Premium Presence */}
              <div className="bg-white rounded-xl shadow-2xl p-8 flex flex-col ring-2 ring-pink-500 relative">
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-pink-500 text-white text-sm font-bold px-4 py-1 rounded-full uppercase tracking-wider">Most Popular</div>
                <h3 className="text-2xl font-bold text-pink-600 mb-2">Premium Presence</h3>
                <p className="text-gray-500 italic mb-6">For a Broader Reach</p>
                <ul className="space-y-4 text-gray-700 mb-8 flex-grow">
<li className="flex items-start"><FaCheckCircle className="text-pink-500 mr-3 mt-1 h-5 w-5 shrink-0" aria-hidden="true" /><span>4 high-quality images & 2 hi-res 5s videos (9:16)</span></li>
<li className="flex items-start"><FaCheckCircle className="text-pink-500 mr-3 mt-1 h-5 w-5 shrink-0" aria-hidden="true" /><span>2 engaging posts & reel</span></li>
<li className="flex items-start"><FaCheckCircle className="text-pink-500 mr-3 mt-1 h-5 w-5 shrink-0" aria-hidden="true" /><span><b>Platforms:</b> Choose 2 (IG, TikTok, or YouTube)</span></li>
<li className="flex items-start"><FaCheckCircle className="text-pink-500 mr-3 mt-1 h-5 w-5 shrink-0" aria-hidden="true" /><span>Detailed audience insights</span></li>
                </ul>
                <div className="text-center my-4">
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-4xl font-bold text-gray-800">$199</p>
                    <p className="text-xl font-medium text-gray-400 line-through">$249</p>
                  </div>
                  <p className="text-sm font-bold text-pink-600 mt-1">Special Intro Offer!</p>
                </div>
                <Link href="#contact-form" className="animate-pulse-button w-full text-center bg-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition duration-300 mt-auto">
                  Select
                </Link>
              </div>

              {/* Package 3: Custom Couture */}
              <div className="bg-rose-50/50 border border-gray-200 rounded-xl shadow-lg p-8 flex flex-col hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-2xl font-bold text-pink-600 mb-2">Custom Couture</h3>
                <p className="text-gray-500 italic mb-6">Tailored to Your Vision</p>
                <ul className="space-y-4 text-gray-700 mb-8 flex-grow">
<li className="flex items-start"><FaCheckCircle className="text-pink-500 mr-3 mt-1 h-5 w-5 shrink-0" aria-hidden="true" /><span>Customized content strategy with unlimited images/reels</span></li>
<li className="flex items-start"><FaCheckCircle className="text-pink-500 mr-3 mt-1 h-5 w-5 shrink-0" aria-hidden="true" /><span><b>Platforms:</b> All (IG, TikTok & YouTube)</span></li>
<li className="flex items-start"><FaCheckCircle className="text-pink-500 mr-3 mt-1 h-5 w-5 shrink-0" aria-hidden="true" /><span>AI-Driven strategy & analytics</span></li>
<li className="flex items-start"><FaCheckCircle className="text-pink-500 mr-3 mt-1 h-5 w-5 shrink-0" aria-hidden="true" /><span>Quarterly strategy sessions</span></li>
                </ul>
                <p className="text-4xl font-bold text-gray-800 text-center my-4">Custom</p>
                <Link href="#contact-form" className="w-full text-center bg-gray-800 text-white font-bold py-3 px-8 rounded-lg hover:bg-gray-900 transition duration-300 mt-auto">
                  Select
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="py-20 bg-rose-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Let&#39;s Connect</h2>
              <p className="text-gray-600 mt-2">Fill out the form below and I&#39;ll get back to you as soon as possible.</p>
            </div>
            <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg">
              <form action="https://formspree.io/f/mdkzlozg" method="POST">
                <div className="mb-4">
                  <label htmlFor="name" className="block text-gray-700 font-bold mb-2">Full Name</label>
                  <input type="text" id="name" name="name" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" required />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-gray-700 font-bold mb-2">Email Address</label>
                  <input type="email" id="email" name="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" required />
                </div>
                <div className="mb-4">
                  <label htmlFor="package-select" className="block text-gray-700 font-bold mb-2">Package of Interest</label>
                  <select id="package-select" name="package" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                    <option>Essential Elegance</option>
                    <option>Premium Presence</option>
                    <option>Custom Couture</option>
                    <option>Additional Service Inquiry</option>
                  </select>
                </div>
                <div className="mb-6">
                  <label htmlFor="message" className="block text-gray-700 font-bold mb-2">Tell me about your brand & goals</label>
                  <textarea id="message" name="message" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" required></textarea>
                </div>
                <div className="text-center">
                  <button type="submit" className="bg-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition duration-300">
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* ShopMy Link Section */}
        <section id="shopmy-link" className="py-16 bg-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Explore More</h2>
            <Link 
              href="https://shopmy.us/savvyfashionista" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block bg-pink-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-pink-600 transition duration-300"
            >
              Visit My Curations
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="mb-2">&copy; 2025 ChicBySally. All rights reserved.</p>
          <div>
            <a href="https://instagram.com/chicbysally" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 mx-2">
              <FaInstagram className="inline-block align-middle text-lg" aria-label="Instagram" />
            </a>
            <a href="https://youtube.com/channel/UCaQ08bul4f6VeeXXP1Ev95w" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 mx-2">
              <FaYoutube className="inline-block align-middle text-lg" aria-label="YouTube" />
            </a>
            <a href="https://www.tiktok.com/@chicbysally" target="_blank" rel="noopener noreferrer" className="hover:text-pink-500 mx-2">
              <FaTiktok className="inline-block align-middle text-lg" aria-label="TikTok" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
