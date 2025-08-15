import { defaultRateLimiter } from '@/lib/rateLimiter';
import { defaultRetryMechanism } from '@/lib/retryMechanism';
import { defaultLogger } from '@/lib/logger';
import { appendImageKitTransformations } from '@/lib/utils';

// Face-swap API service
export interface FaceSwapInput {
  inputImage: string; // URL to the input image (user's face)
  swapImage: string; // URL to the swap image (reference style)
}

export interface FaceSwapOutput {
  url: string;
  buffer?: unknown;
}

interface EnhancedError extends Error {
  originalError?: unknown;
  originalMessage?: string;
  details?: unknown;
}

export class FaceSwapService {
  /**
   * Perform face-swap using our API route
   */
  static async performFaceSwap(input: FaceSwapInput): Promise<FaceSwapOutput> {
    try {
      defaultLogger.info('Starting face-swap process', { inputImage: input.inputImage, swapImage: input.swapImage });
      
      // Validate input URLs
      if (!input.inputImage || !input.swapImage) {
        const error = new Error('Both inputImage and swapImage are required');
        defaultLogger.error('Missing input URLs', { 
          inputImage: input.inputImage ? 'present' : 'missing',
          swapImage: input.swapImage ? 'present' : 'missing'
        });
        throw error;
      }
      
      // Validate URL formats
      try {
        new URL(input.inputImage);
        new URL(input.swapImage);
      } catch (urlError) {
        const error = new Error('Invalid image URL format');
        defaultLogger.error('URL validation failed', { 
          inputImage: input.inputImage,
          swapImage: input.swapImage,
          urlError: urlError instanceof Error ? urlError.message : 'Unknown URL error'
        });
        throw error;
      }
      
      // Log input URLs
      defaultLogger.info('Input image URL:', input.inputImage);
      defaultLogger.info('Original reference image URL:', input.swapImage);
      
      // Apply ImageKit transformations to both input and reference images
      const transformedInputImage = appendImageKitTransformations(input.inputImage);
      const transformedReferenceImage = appendImageKitTransformations(input.swapImage);
      
      try {
        new URL(transformedInputImage); // Validate transformed input URL
        new URL(transformedReferenceImage); // Validate transformed reference URL
      } catch (error) {
        const err = new Error('Invalid transformed image URL');
        defaultLogger.error('Failed to validate transformed image URL', {
          originalUrls: {
            input: input.inputImage,
            reference: input.swapImage
          },
          transformedUrls: {
            input: transformedInputImage,
            reference: transformedReferenceImage
          },
          error: error instanceof Error ? error.message : 'Unknown URL error'
        });
        throw err;
      }
      
      // Update input with transformed URLs
      input.inputImage = transformedInputImage;
      input.swapImage = transformedReferenceImage;
      defaultLogger.info('Applied ImageKit transformations to reference image', { 
        transformedUrl: transformedReferenceImage 
      });
      
      // Log final transformed URL
      console.log('Final transformed URL:', transformedReferenceImage);
      
      // Check rate limit
      if (!defaultRateLimiter.canMakeRequest()) {
        const error = new Error('Rate limit exceeded. Please try again later.');
        const status = defaultRateLimiter.getStatus();
        defaultLogger.error('Rate limit exceeded', { 
          maxRequests: status.maxRequests,
          windowSize: '60000ms',
          remainingRequests: status.remainingRequests,
          resetTime: status.resetTime
        });
        throw error;
      }
      
      defaultLogger.info('Calling face-swap API route', { input });
      
      // Make API call with transformed URLs
      const response = await defaultRetryMechanism.execute(async () => {
        const apiResponse = await fetch('/api/face-swap', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputImage: input.inputImage,
            swapImage: input.swapImage
          }),
        });
        
        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          throw new Error(errorData.error || `HTTP error! status: ${apiResponse.status}`);
        }
        
        return apiResponse.json();
      });
      
      defaultLogger.info('Face-swap API call completed successfully', { response });
      
      // Validate the response
      if (!response.url) {
        const error = new Error('API response missing URL');
        defaultLogger.error('Missing URL in API response', { response });
        throw error;
      }
      
      // Validate the URL
      if (!response.url.startsWith('http')) {
        const error = new Error('Invalid image URL returned from API');
        defaultLogger.error('Invalid URL in API response', { url: response.url });
        throw error;
      }
      
      defaultLogger.info('Successfully extracted image URL', { url: response.url });
      
      // Update rate limit status if provided
      if (response.rateLimitStatus) {
        // Note: The rate limit is actually managed on the server side,
        // but we can update the client-side status for display purposes
        defaultLogger.info('Rate limit status from API', response.rateLimitStatus);
      }
      
      return {
        url: response.url,
        buffer: response.buffer
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      defaultLogger.error('Face-swap failed', { 
        error: errorMessage,
        stack: errorStack
      });
      
      // Create enhanced error with more details
      const enhancedError = new Error('There is issue creating StyleCard - Please try later.');
      // Attach original error details as properties
      (enhancedError as EnhancedError).originalError = error;
      (enhancedError as EnhancedError).originalMessage = errorMessage;
      (enhancedError as EnhancedError).details = {
        timestamp: new Date().toISOString()
      };
      
      // Re-throw with enhanced error
      throw enhancedError;
    }
  }
  
  /**
   * Get current rate limit status
   */
  static getRateLimitStatus(): {
    remainingRequests: number;
    maxRequests: number;
    resetTime: number | null;
  } {
    return defaultRateLimiter.getStatus();
  }
}
