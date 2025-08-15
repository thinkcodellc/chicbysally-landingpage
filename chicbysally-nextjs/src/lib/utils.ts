import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Sanitizes ImageKit URLs by removing query parameters
 * This is needed because Replicate API doesn't handle query parameters well
 * @param url The ImageKit URL to sanitize
 * @returns The sanitized URL without query parameters
 */
export function sanitizeImageUrl(url: string): string {
  try {
    // If the URL contains query parameters, remove them
    const urlObj = new URL(url);
    urlObj.search = ''; // Remove all query parameters
    return urlObj.toString();
  } catch (error) {
    // If URL parsing fails, return the original URL
    console.warn('Failed to parse URL for sanitization:', url, error);
    return url;
  }
}

/**
 * Checks if a URL is an ImageKit URL
 * @param url The URL to check
 * @returns True if the URL is an ImageKit URL
 */
export function isImageKitUrl(url: string): boolean {
  return url.includes('imagekit.io');
}

/**
 * Appends ImageKit transformations to a URL
 * @param url The ImageKit URL to transform
 * @returns The URL with transformations appended
 */
export function appendImageKitTransformations(url: string): string {
  // Check if it's an ImageKit URL
  if (!isImageKitUrl(url)) {
    return url;
  }
  
  // Get the transformation string from environment variables
  const transformations = process.env.NEXT_PUBLIC_IMAGEKIT_TRANSFORMATIONS || process.env.IMAGEKIT_TRANSFORMATIONS;
  
  // If no transformations are configured, return the original URL
  if (!transformations) {
    console.warn('IMAGEKIT_TRANSFORMATIONS not found in environment variables');
    return url;
  }
  
  console.log('Using transformations:', transformations);
  
  // Ensure the transformations string starts with /tr:
  if (!transformations.startsWith('/tr:')) {
    console.warn('IMAGEKIT_TRANSFORMATIONS should start with /tr:');
    return url;
  }
  
  // Remove any existing query parameters and append transformations
  try {
    const urlObj = new URL(url);
    const baseUrl = `${urlObj.origin}${urlObj.pathname}`;
    
    // Log original URL for debugging
    console.log('Original URL:', url);
    
    // Append transformations directly to base URL
    const transformedUrl = `${baseUrl}${transformations}`;
    
    // Log detailed transformation information
    console.log('Applying transformations:', transformations);
    console.log('Base URL:', baseUrl);
    console.log('Transformed URL:', transformedUrl);
    console.log('Full transformation details:', {
      originalUrl: url,
      transformations: transformations,
      finalUrl: transformedUrl
    });
    
    return transformedUrl;
  } catch (error) {
    console.warn('Failed to parse URL for ImageKit transformations:', url, error);
    return url;
  }
}

export { cn as default };
