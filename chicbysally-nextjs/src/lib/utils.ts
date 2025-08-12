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

export { cn as default };
